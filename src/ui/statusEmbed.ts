import { APIEmbed, APIEmbedField, ButtonStyle, ComponentType } from 'discord.js';
import { createLogger } from '../utils/logger';
import { Service } from '../config/services';

const logger = createLogger({ service: 'status-embed' });

export interface ServiceStatus {
  name: string;
  url: string;
  ok: boolean;
  status?: number;
  responseTime?: number;
  error?: string;
  version?: string;
  uptime?: number;
  lastChecked?: Date;
}

/**
 * Formats uptime in seconds to a human-readable string
 */
function formatUptime(seconds?: number): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return 'N/A';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
  if (secs > 0 && days === 0 && hours === 0) parts.push(`${secs}s`);
  
  return parts.length > 0 ? parts.join(' ') : '0s';
}

/**
 * Creates a status embed for a single service
 */
export function createStatusEmbed(services: ServiceStatus[], title: string = 'Service Status'): APIEmbed {
  const now = new Date();
  const healthyCount = services.filter(s => s.ok).length;
  const totalCount = services.length;
  
  // Sort services: unhealthy first, then by name
  const sortedServices = [...services].sort((a, b) => {
    if (a.ok !== b.ok) return a.ok ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
  
  const fields: APIEmbedField[] = [];
  
  // Add a field for each service
  for (const service of sortedServices) {
    const statusEmoji = service.ok ? '🟢' : '🔴';
    const statusText = service.ok ? 'Operational' : 'Outage';
    const responseTime = service.responseTime ? `${service.responseTime}ms` : 'N/A';
    const version = service.version || 'N/A';
    const uptime = formatUptime(service.uptime);
    
    let value = `**Status:** ${statusEmoji} ${statusText}\n`;
    value += `**Response Time:** ${responseTime}\n`;
    value += `**Version:** ${version}\n`;
    value += `**Uptime:** ${uptime}\n`;
    
    if (service.error) {
      value += `\n*${service.error}*`;
    }
    
    fields.push({
      name: service.name,
      value,
      inline: true
    });
  }
  
  // Calculate overall status
  const allHealthy = healthyCount === totalCount;
  const someHealthy = healthyCount > 0 && healthyCount < totalCount;
  
  let statusText: string;
  let statusColor: number;
  
  if (allHealthy) {
    statusText = 'All Systems Operational';
    statusColor = 0x43b581; // Green
  } else if (someHealthy) {
    statusText = 'Partial Outage';
    statusColor = 0xfaa61a; // Orange
  } else {
    statusText = 'Major Outage';
    statusColor = 0xf04747; // Red
  }
  
  const embed: APIEmbed = {
    title: `🔍 ${title}`,
    description: `**Status:** ${statusText}\n` +
                 `**Last Updated:** <t:${Math.floor(now.getTime() / 1000)}:R>\n` +
                 `\`${healthyCount}/${totalCount}\` services operational`,
    color: statusColor,
    fields,
    footer: {
      text: 'Last checked',
      icon_url: 'https://i.imgur.com/wSTFkRM.png' // Replace with your bot's icon
    },
    timestamp: now.toISOString()
  };
  
  return embed;
}

/**
 * Creates action buttons for the status message
 */
export function createStatusButtons() {
  return [
    {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Secondary,
          customId: 'status_refresh',
          emoji: '🔄',
          label: 'Refresh'
        },
        {
          type: ComponentType.Button,
          style: ButtonStyle.Link,
          url: process.env.STATUS_DASHBOARD_URL || '#',
          label: 'Dashboard',
          emoji: '📊',
          disabled: !process.env.STATUS_DASHBOARD_URL
        },
        {
          type: ComponentType.Button,
          style: ButtonStyle.Primary,
          customId: 'status_acknowledge',
          emoji: '✅',
          label: 'Acknowledge',
          disabled: false
        }
      ]
    }
  ];
}

/**
 * Creates an error embed for when there's an issue checking service status
 */
export function createErrorEmbed(error: Error): APIEmbed {
  return {
    title: '❌ Error Checking Status',
    description: 'There was an error while checking the service statuses. Please try again later.',
    color: 0xf04747, // Red
    fields: [
      {
        name: 'Error',
        value: `\`\`\`${error.message}\`\`\``
      }
    ],
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates an embed for a specific service's detailed status
 */
export function createServiceStatusEmbed(service: ServiceStatus): APIEmbed {
  const statusEmoji = service.ok ? '🟢' : '🔴';
  const statusText = service.ok ? 'Operational' : 'Outage';
  const responseTime = service.responseTime ? `${service.responseTime}ms` : 'N/A';
  const version = service.version || 'N/A';
  const uptime = formatUptime(service.uptime);
  const lastChecked = service.lastChecked ? `<t:${Math.floor(service.lastChecked.getTime() / 1000)}:R>` : 'N/A';
  
  const embed: APIEmbed = {
    title: `🔍 ${service.name} Status`,
    color: service.ok ? 0x43b581 : 0xf04747,
    fields: [
      {
        name: 'Status',
        value: `${statusEmoji} ${statusText}`,
        inline: true
      },
      {
        name: 'Response Time',
        value: responseTime,
        inline: true
      },
      {
        name: 'Version',
        value: version,
        inline: true
      },
      {
        name: 'Uptime',
        value: uptime,
        inline: true
      },
      {
        name: 'Last Checked',
        value: lastChecked,
        inline: true
      },
      {
        name: 'Endpoint',
        value: `\`${service.url}\``,
        inline: false
      }
    ],
    timestamp: new Date().toISOString()
  };
  
  if (service.error) {
    embed.fields?.push({
      name: 'Error',
      value: `\`\`\`${service.error}\`\`\``,
      inline: false
    });
  }
  
  return embed;
}

/**
 * Updates or creates a status thread in the specified channel
 */
export async function ensureStatusThread(
  channel: any, // Replace with proper Discord.js TextChannel type
  threadName: string = '🔍 Service Status'
) {
  try {
    // Try to find an existing thread
    const existingThread = channel.threads.cache.find(
      (thread: any) => thread.name === threadName && !thread.archived
    );
    
    if (existingThread) {
      return existingThread;
    }
    
    // Create a new thread if one doesn't exist
    const thread = await channel.threads.create({
      name: threadName,
      autoArchiveDuration: 60, // 1 hour
      reason: 'Service status monitoring thread',
      type: 'GUILD_PUBLIC_THREAD'
    });
    
    return thread;
  } catch (error) {
    logger.error('Failed to ensure status thread', { error });
    throw error;
  }
}
