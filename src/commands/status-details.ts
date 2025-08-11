import { SlashCommandSubcommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getService, getServices } from '../config/services';
import { ping } from '../services/heartbeat';
import { createLogger } from '../utils/logger';
import { createServiceStatusEmbed } from '../ui/statusEmbed';

const logger = createLogger({ service: 'status-details-command' });

// In-memory store for status history (in a real app, this would be a database)
const statusHistory = new Map<string, StatusEntry[]>();

interface StatusEntry {
  timestamp: Date;
  ok: boolean;
  status?: number;
  responseTime: number;
  version?: string;
  uptime?: number;
  error?: string;
}

/**
 * Command data for the status details subcommand
 */
export const data = new SlashCommandSubcommandBuilder()
  .setName('details')
  .setDescription('Get detailed status information for a service')
  .addStringOption(option =>
    option
      .setName('service')
      .setDescription('The name of the service')
      .setRequired(true)
      .setAutocomplete(true)
  );

/**
 * Handle autocomplete for the service name
 */
export async function autocomplete(interaction: any) {
  const focusedValue = interaction.options.getFocused().toLowerCase();
  const services = getServices();
  
  // Filter services based on user input
  const filtered = services
    .filter(service => 
      service.name.toLowerCase().includes(focusedValue) ||
      service.url.toLowerCase().includes(focusedValue)
    )
    .slice(0, 25); // Discord limits to 25 choices
  
  await interaction.respond(
    filtered.map(service => ({
      name: service.name,
      value: service.name
    }))
  );
}

/**
 * Execute the status details command
 * @param interaction The chat input command interaction
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  const serviceName = interaction.options.getString('service', true);
  
  try {
    await interaction.deferReply();
    
    const service = getService(serviceName);
    
    if (!service) {
      await interaction.editReply({
        content: `❌ No service found with name "${serviceName}". Use /services to list all available services.`
      });
      return;
    }
    
    // Check the service status
    const startTime = Date.now();
    const result = await ping(service.url);
    const responseTime = Date.now() - startTime;
    
    // Get or initialize status history for this service
    if (!statusHistory.has(service.name)) {
      statusHistory.set(service.name, []);
    }
    const history = statusHistory.get(service.name)!;
    
    // Add current status to history
    const statusEntry: StatusEntry = {
      timestamp: new Date(),
      ok: result.ok,
      status: result.status,
      responseTime,
      version: result.ok ? result.data?.version : undefined,
      uptime: result.ok ? result.data?.uptime : undefined,
      error: result.ok ? undefined : result.error?.message || 'Unknown error'
    };
    
    // Keep only the last 100 entries
    history.unshift(statusEntry);
    if (history.length > 100) {
      history.length = 100;
    }
    
    // Calculate metrics
    const metrics = calculateMetrics(history);
    
    // Create the embed
    const embed = createServiceStatusEmbed({
      name: service.name,
      url: service.url,
      ok: statusEntry.ok,
      status: statusEntry.status,
      responseTime: statusEntry.responseTime,
      error: statusEntry.error,
      version: statusEntry.version,
      uptime: statusEntry.uptime,
      lastChecked: statusEntry.timestamp
    });
    
    // Add metrics to the embed
    embed.fields = [
      ...(embed.fields || []),
      {
        name: '\u200B',
        value: '\u200B',
        inline: false
      },
      {
        name: '📊 Service Metrics',
        value: [
          `**Uptime (24h):** ${(metrics.uptime24h * 100).toFixed(2)}%`,
          `**Avg. Response Time:** ${metrics.avgResponseTime.toFixed(2)}ms`,
          `**Incidents (7d):** ${metrics.incidents7d} (${metrics.incidentRate7d.toFixed(2)}/day)`,
          `**Last Incident:** ${metrics.lastIncident ? `<t:${Math.floor(metrics.lastIncident.getTime() / 1000)}:R>` : 'Never'}`
        ].join('\n'),
        inline: false
      },
      {
        name: '📅 Status History',
        value: `Last checked <t:${Math.floor(statusEntry.timestamp.getTime() / 1000)}:R>\n` +
               `_${metrics.up24h} up, ${metrics.down24h} down in last 24 hours_`,
        inline: false
      }
    ];
    
    // Add action buttons
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`status_refresh_${service.name}`)
          .setLabel('Refresh')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔄'),
        new ButtonBuilder()
          .setLabel('Open Service')
          .setURL(service.url)
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setCustomId(`incident_create_${service.name}`)
          .setLabel('Report Issue')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🚨')
      );
    
    await interaction.editReply({
      embeds: [embed],
      components: [row]
    });
    
    logger.info('Status details command executed', {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      service: service.name,
      status: statusEntry.ok ? 'healthy' : 'unhealthy',
      responseTime
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in status details command', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      userId: interaction.user.id,
      guildId: interaction.guildId,
      serviceName
    });
    
    await interaction.editReply({
      content: `❌ An error occurred while fetching status details for "${serviceName}". Please try again later.`
    });
  }
}

/**
 * Calculate metrics from status history
 */
function calculateMetrics(history: StatusEntry[]) {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Filter history to relevant time periods
  const history24h = history.filter(entry => entry.timestamp >= twentyFourHoursAgo);
  const history7d = history.filter(entry => entry.timestamp >= sevenDaysAgo);
  
  // Calculate uptime for the last 24 hours
  const up24h = history24h.filter(entry => entry.ok).length;
  const down24h = history24h.length - up24h;
  const uptime24h = history24h.length > 0 ? up24h / history24h.length : 1;
  
  // Calculate average response time
  const totalResponseTime = history24h.reduce((sum, entry) => sum + (entry.responseTime || 0), 0);
  const avgResponseTime = history24h.length > 0 ? totalResponseTime / history24h.length : 0;
  
  // Count incidents in the last 7 days
  let incidentCount = 0;
  let inIncident = false;
  let lastIncident: Date | null = null;
  
  for (const entry of history7d) {
    if (!entry.ok && !inIncident) {
      // Start of a new incident
      inIncident = true;
      incidentCount++;
      lastIncident = entry.timestamp;
    } else if (entry.ok && inIncident) {
      // End of an incident
      inIncident = false;
    }
  }
  
  // Calculate incident rate (per day)
  const days = (now.getTime() - sevenDaysAgo.getTime()) / (24 * 60 * 60 * 1000);
  const incidentRate = incidentCount / Math.max(1, days);
  
  return {
    uptime24h,
    up24h,
    down24h,
    avgResponseTime,
    incidents7d: incidentCount,
    incidentRate7d: incidentRate,
    lastIncident
  };
}

/**
 * Handles button interactions for the status details command
 */
export async function handleButtonInteraction(interaction: any) {
  if (!interaction.isButton()) return false;
  
  const { customId } = interaction;
  
  try {
    // Handle refresh button
    if (customId.startsWith('status_refresh_')) {
      await interaction.deferUpdate();
      
      const serviceName = customId.replace('status_refresh_', '');
      const service = getService(serviceName);
      
      if (!service) {
        await interaction.followUp({
          content: '❌ This service is no longer registered.',
          ephemeral: true
        });
        return true;
      }
      
      // Re-run the status check
      const startTime = Date.now();
      const result = await ping(service.url);
      const responseTime = Date.now() - startTime;
      
      // Update history
      if (!statusHistory.has(service.name)) {
        statusHistory.set(service.name, []);
      }
      const history = statusHistory.get(service.name)!;
      
      const statusEntry: StatusEntry = {
        timestamp: new Date(),
        ok: result.ok,
        status: result.status,
        responseTime,
        version: result.ok ? result.data?.version : undefined,
        uptime: result.ok ? result.data?.uptime : undefined,
        error: result.ok ? undefined : result.error?.message || 'Unknown error'
      };
      
      history.unshift(statusEntry);
      if (history.length > 100) {
        history.length = 100;
      }
      
      // Recalculate metrics
      const metrics = calculateMetrics(history);
      
      // Update the embed
      const embed = createServiceStatusEmbed({
        name: service.name,
        url: service.url,
        ok: statusEntry.ok,
        status: statusEntry.status,
        responseTime: statusEntry.responseTime,
        error: statusEntry.error,
        version: statusEntry.version,
        uptime: statusEntry.uptime,
        lastChecked: statusEntry.timestamp
      });
      
      // Add metrics to the embed
      embed.fields = [
        ...(embed.fields || []),
        {
          name: '\u200B',
          value: '\u200B',
          inline: false
        },
        {
          name: '📊 Service Metrics',
          value: [
            `**Uptime (24h):** ${(metrics.uptime24h * 100).toFixed(2)}%`,
            `**Avg. Response Time:** ${metrics.avgResponseTime.toFixed(2)}ms`,
            `**Incidents (7d):** ${metrics.incidents7d} (${metrics.incidentRate7d.toFixed(2)}/day)`,
            `**Last Incident:** ${metrics.lastIncident ? `<t:${Math.floor(metrics.lastIncident.getTime() / 1000)}:R>` : 'Never'}`
          ].join('\n'),
          inline: false
        },
        {
          name: '📅 Status History',
          value: `Last checked <t:${Math.floor(statusEntry.timestamp.getTime() / 1000)}:R>\n` +
                 `_${metrics.up24h} up, ${metrics.down24h} down in last 24 hours_`,
          inline: false
        }
      ];
      
      // Keep the original components
      const components = interaction.message.components;
      
      await interaction.editReply({
        embeds: [embed],
        components
      });
      
      return true;
    }
    
    // Handle incident creation button
    if (customId.startsWith('incident_create_')) {
      const serviceName = customId.replace('incident_create_', '');
      const service = getService(serviceName);
      
      if (!service) {
        await interaction.reply({
          content: '❌ This service is no longer registered.',
          ephemeral: true
        });
        return true;
      }
      
      // Create a modal for incident creation
      const modal = new (interaction.client as any).ModalBuilder()
        .setCustomId(`incident_create_${Date.now()}`)
        .setTitle(`Report Issue: ${service.name}`);
      
      // Add components to modal
      const titleInput = new (interaction.client as any).TextInputBuilder()
        .setCustomId('title')
        .setLabel('Brief Title')
        .setStyle(1) // SHORT
        .setPlaceholder('e.g., API Timeout')
        .setRequired(true);
      
      const descriptionInput = new (interaction.client as any).TextInputBuilder()
        .setCustomId('description')
        .setLabel('Description')
        .setStyle(2) // PARAGRAPH
        .setPlaceholder('Describe the issue in detail...')
        .setRequired(true);
      
      const severityInput = new (interaction.client as any).TextInputBuilder()
        .setCustomId('severity')
        .setLabel('Severity (minor/major/critical)')
        .setStyle(1) // SHORT
        .setPlaceholder('minor')
        .setRequired(true);
      
      const firstActionRow = new (interaction.client as any).ActionRowBuilder().addComponents(titleInput);
      const secondActionRow = new (interaction.client as any).ActionRowBuilder().addComponents(descriptionInput);
      const thirdActionRow = new (interaction.client as any).ActionRowBuilder().addComponents(severityInput);
      
      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
      
      // Show the modal to the user
      await interaction.showModal(modal);
      
      return true;
    }
    
    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error handling status details button', {
      error: errorMessage,
      customId,
      userId: interaction.user.id
    });
    
    await interaction.followUp({
      content: '❌ An error occurred while processing your request.',
      ephemeral: true
    });
    
    return false;
  }
}

export default {
  data,
  autocomplete,
  execute,
  handleButtonInteraction
};
