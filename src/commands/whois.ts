import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { getService, getServices } from '../config/services';
import { ping } from '../services/heartbeat';
import { createLogger } from '../utils/logger';
import { createServiceStatusEmbed } from '../ui/statusEmbed';

const logger = createLogger({ service: 'whois-command' });

/**
 * Command data for the whois command
 */
export const data = new SlashCommandBuilder()
  .setName('whois')
  .setDescription('Get detailed information about a specific service')
  .addStringOption(option =>
    option
      .setName('service')
      .setDescription('The name of the service to look up')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addBooleanOption(option =>
    option
      .setName('ephemeral')
      .setDescription('Whether to show the response only to you (default: false)')
      .setRequired(false)
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
 * Execute the whois command
 * @param interaction The chat input command interaction
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  const serviceName = interaction.options.getString('service', true);
  const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
  
  try {
    await interaction.deferReply({ ephemeral });
    
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
    
    // Convert to ServiceStatus format
    const serviceStatus = {
      name: service.name,
      url: service.url,
      ok: result.ok,
      status: result.status || 0,
      responseTime: result.ok ? responseTime : 0,
      error: result.ok ? undefined : result.error?.message || 'Unknown error',
      version: result.ok ? result.data?.version : undefined,
      uptime: result.ok ? result.data?.uptime : undefined,
      lastChecked: new Date()
    };
    
    // Create the embed
    const embed = createServiceStatusEmbed(serviceStatus);
    
    // Add service metadata to the embed
    embed.fields = [
      ...(embed.fields || []),
      {
        name: '\u200B', // Zero-width space for a new line
        value: '\u200B',
        inline: false
      },
      {
        name: '📋 Service Details',
        value: [
          `**Name:** ${service.name}`,
          `**URL:** \`${service.url}\``,
          service.owner ? `**Owner:** <@${service.owner}>` : '**Owner:** Not assigned',
          service.channelId ? `**Channel:** <#${service.channelId}>` : '**Channel:** Not set',
          service.description ? `**Description:** ${service.description}` : '',
          service.tags?.length ? `**Tags:** ${service.tags.map(t => `\`${t}\``).join(', ')}` : ''
        ].filter(Boolean).join('\n'),
        inline: false
      }
    ];
    
    // Create action buttons
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`whois_refresh_${service.name}`)
          .setLabel('Refresh')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔄'),
        new ButtonBuilder()
          .setLabel('Open URL')
          .setURL(service.url)
          .setStyle(ButtonStyle.Link)
      );
    
    // Add a button to view status if the service has a status page
    if (service.statusPageUrl) {
      row.addComponents(
        new ButtonBuilder()
          .setLabel('Status Page')
          .setURL(service.statusPageUrl)
          .setStyle(ButtonStyle.Link)
      );
    }
    
    await interaction.editReply({
      embeds: [embed],
      components: [row]
    });
    
    logger.info('Whois command executed', {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      service: service.name,
      status: serviceStatus.ok ? 'healthy' : 'unhealthy',
      responseTime
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in whois command', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      userId: interaction.user.id,
      guildId: interaction.guildId,
      serviceName
    });
    
    await interaction.editReply({
      content: `❌ An error occurred while fetching information for "${serviceName}". Please try again later.`
    });
  }
}

/**
 * Handles button interactions for the whois command
 */
export async function handleButtonInteraction(interaction: any) {
  if (!interaction.isButton()) return false;
  
  const { customId } = interaction;
  
  try {
    // Handle refresh button
    if (customId.startsWith('whois_refresh_')) {
      await interaction.deferUpdate();
      
      const serviceName = customId.replace('whois_refresh_', '');
      const service = getService(serviceName);
      
      if (!service) {
        await interaction.followUp({
          content: '❌ This service is no longer registered.',
          ephemeral: true
        });
        return true;
      }
      
      // Re-check the service status
      const startTime = Date.now();
      const result = await ping(service.url);
      const responseTime = Date.now() - startTime;
      
      // Convert to ServiceStatus format
      const serviceStatus = {
        name: service.name,
        url: service.url,
        ok: result.ok,
        status: result.status || 0,
        responseTime: result.ok ? responseTime : 0,
        error: result.ok ? undefined : result.error?.message || 'Unknown error',
        version: result.ok ? result.data?.version : undefined,
        uptime: result.ok ? result.data?.uptime : undefined,
        lastChecked: new Date()
      };
      
      // Update the embed
      const embed = createServiceStatusEmbed(serviceStatus);
      
      // Keep the original components
      const components = interaction.message.components;
      
      await interaction.editReply({
        embeds: [embed],
        components
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error handling whois button', {
      error: errorMessage,
      customId,
      userId: interaction.user.id
    });
    
    await interaction.followUp({
      content: '❌ An error occurred while refreshing the service status.',
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
