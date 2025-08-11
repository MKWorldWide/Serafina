import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getService, getServices } from '../config/env';
import { ping } from '../services/heartbeat';
import { getLogger } from '../utils/logger';

const logger = getLogger({ service: 'dashboard' });

// Status emojis for different service statuses
const STATUS_EMOJIS = {
  up: '🟢',
  degraded: '🟡',
  down: '🔴',
  unknown: '⚪',};

// Status colors for embeds
const STATUS_COLORS = {
  up: 0x43b581,    // Green
  degraded: 0xfaa61a, // Yellow
  down: 0xf04747,  // Red
  unknown: 0x747f8d, // Gray
};

/**
 * Generate a service status card embed
 */
export async function generateServiceStatusCard(serviceName: string) {
  const service = getService(serviceName);
  if (!service) {
    throw new Error(`Service not found: ${serviceName}`);
  }

  // Ping the service to get current status
  let status = 'unknown';
  let responseTime = 0;
  let details = '';

  try {
    const startTime = Date.now();
    const result = await ping(service.url);
    responseTime = Date.now() - startTime;
    
    if (result.ok) {
      status = 'up';
      details = `✅ Operational\n⏱️ ${responseTime}ms`;
      
      if (result.data?.version) {
        details += `\n📦 v${result.data.version}`;
      }
      
      if (result.data?.uptime) {
        const uptimeDays = (result.data.uptime / 86400).toFixed(1);
        details += `\n⏳ Uptime: ${uptimeDays}d`;
      }
    } else {
      status = 'down';
      details = `❌ ${result.status || 'Error'}: ${result.error?.message || 'Unknown error'}`;
    }
  } catch (error) {
    status = 'down';
    details = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  // Create the embed
  const embed = new EmbedBuilder()
    .setTitle(`${STATUS_EMOJIS[status]} ${service.name}`)
    .setDescription(service.description || 'No description available')
    .setColor(STATUS_COLORS[status])
    .addFields(
      { name: 'Status', value: status.toUpperCase(), inline: true },
      { name: 'Response Time', value: `${responseTime}ms`, inline: true },
      { name: 'Details', value: details || 'No additional details' },
      { name: 'URL', value: `[Visit Service](${service.url})`, inline: true },
    )
    .setTimestamp();

  // Add service URL button if available
  const row = new ActionRowBuilder<ButtonBuilder>();
  
  // Add service URL button
  if (service.url) {
    row.addComponents(
      new ButtonBuilder()
        .setLabel('Open Service')
        .setURL(service.url)
        .setStyle(ButtonStyle.Link)
    );
  }
  
  // Add status page button if available
  if (service.statusPageUrl) {
    row.addComponents(
      new ButtonBuilder()
        .setLabel('Status Page')
        .setURL(service.statusPageUrl)
        .setStyle(ButtonStyle.Link)
    );
  }

  return { embed, components: row.components.length > 0 ? [row] : [] };
}

/**
 * Generate a dashboard embed showing status of all services
 */
export async function generateDashboardEmbed() {
  const services = getServices();
  const statuses = await Promise.all(
    services.map(async (service) => {
      try {
        const startTime = Date.now();
        const result = await ping(service.url);
        const responseTime = Date.now() - startTime;
        
        let status: 'up' | 'degraded' | 'down' | 'unknown' = 'unknown';
        
        if (result.ok) {
          status = responseTime > 1000 ? 'degraded' : 'up';
        } else {
          status = 'down';
        }
        
        return {
          name: service.name,
          status,
          responseTime,
          url: service.url,
        };
      } catch (error) {
        return {
          name: service.name,
          status: 'down' as const,
          responseTime: 0,
          url: service.url,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  // Count statuses
  const upCount = statuses.filter(s => s.status === 'up').length;
  const degradedCount = statuses.filter(s => s.status === 'degraded').length;
  const downCount = statuses.filter(s => s.status === 'down').length;
  const unknownCount = statuses.filter(s => s.status === 'unknown').length;

  // Create the main dashboard embed
  const embed = new EmbedBuilder()
    .setTitle('📊 Service Dashboard')
    .setDescription('Overview of all monitored services')
    .setColor(0x3498db) // Default blue color
    .setTimestamp();

  // Add status summary
  embed.addFields({
    name: 'Status Summary',
    value: [
      `${STATUS_EMOJIS.up} **${upCount}** Operational`,
      `${STATUS_EMOJIS.degraded} **${degradedCount}** Degraded`,
      `${STATUS_EMOJIS.down} **${downCount}** Down`,
      `${STATUS_EMOJIS.unknown} **${unknownCount}** Unknown`,
    ].join('\n'),
    inline: true,
  });

  // Add service status list
  const serviceStatusList = statuses.map(service => {
    const statusEmoji = STATUS_EMOJIS[service.status];
    const responseTime = service.responseTime ? `${service.responseTime}ms` : 'N/A';
    return `- ${statusEmoji} **${service.name}**: ${service.status.toUpperCase()} (${responseTime})`;
  });

  embed.addFields({
    name: 'Service Status',
    value: serviceStatusList.join('\n') || 'No services configured',
    inline: false,
  });

  // Add a note about auto-refresh if needed
  embed.setFooter({
    text: 'Last updated',
  });

  // Create action buttons
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('refresh_dashboard')
        .setLabel('🔄 Refresh')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setURL('https://example.com/dashboard')
        .setLabel('Open Web Dashboard')
        .setStyle(ButtonStyle.Link)
    );

  return { embed, components: [row] };
}

/**
 * Generate a detailed service information embed
 */
export async function generateServiceDetailsEmbed(serviceName: string) {
  const service = getService(serviceName);
  if (!service) {
    throw new Error(`Service not found: ${serviceName}`);
  }

  // Ping the service to get current status
  let status = 'unknown';
  let responseTime = 0;
  let details = '';
  let version = 'Unknown';
  let uptime = 'N/A';

  try {
    const startTime = Date.now();
    const result = await ping(service.url);
    responseTime = Date.now() - startTime;
    
    if (result.ok) {
      status = 'up';
      details = 'The service is operating normally.';
      
      if (result.data?.version) {
        version = result.data.version;
      }
      
      if (result.data?.uptime) {
        const days = Math.floor(result.data.uptime / 86400);
        const hours = Math.floor((result.data.uptime % 86400) / 3600);
        uptime = `${days}d ${hours}h`;
      }
    } else {
      status = 'down';
      details = `**Status Code**: ${result.status || 'N/A'}\n`;
      details += `**Error**: ${result.error?.message || 'Unknown error'}`;
    }
  } catch (error) {
    status = 'down';
    details = `**Error**: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  // Create the embed
  const embed = new EmbedBuilder()
    .setTitle(`🔍 ${service.name} - Service Details`)
    .setDescription(service.description || 'No description available')
    .setColor(STATUS_COLORS[status])
    .addFields(
      { name: 'Status', value: status.toUpperCase(), inline: true },
      { name: 'Response Time', value: `${responseTime}ms`, inline: true },
      { name: 'Version', value: version, inline: true },
      { name: 'Uptime', value: uptime, inline: true },
      { name: 'Category', value: service.category || 'Uncategorized', inline: true },
      { name: 'Tags', value: service.tags?.join(', ') || 'None', inline: true },
      { name: 'Details', value: details || 'No additional details' },
      { name: 'Service URL', value: `[${service.url}](${service.url})` },
    )
    .setTimestamp();

  // Create action buttons
  const row = new ActionRowBuilder<ButtonBuilder>();
  
  // Add service URL button
  if (service.url) {
    row.addComponents(
      new ButtonBuilder()
        .setLabel('Open Service')
        .setURL(service.url)
        .setStyle(ButtonStyle.Link)
    );
  }
  
  // Add status page button if available
  if (service.statusPageUrl) {
    row.addComponents(
      new ButtonBuilder()
        .setLabel('Status Page')
        .setURL(service.statusPageUrl)
        .setStyle(ButtonStyle.Link)
    );
  }
  
  // Add refresh button
  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`refresh_service_${service.name}`)
      .setLabel('🔄 Refresh')
      .setStyle(ButtonStyle.Secondary)
  );

  return { 
    embed, 
    components: row.components.length > 0 ? [row] : [] 
  };
}

export { generateServiceStatusCard, generateDashboardEmbed, generateServiceDetailsEmbed };
