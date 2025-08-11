import { Client, User, TextChannel, ThreadChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getLogger } from './logger';
import { getService } from '../config/env';

const logger = getLogger({ service: 'notifications' });

/**
 * Send a notification to a service owner
 * @param client Discord client
 * @param serviceName Name of the service
 * @param options Notification options
 */
export async function notifyServiceOwner(
  client: Client,
  serviceName: string,
  options: {
    title: string;
    description: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    fields?: { name: string; value: string; inline?: boolean }[];
    actions?: { label: string; url?: string; style?: 'primary' | 'secondary' | 'success' | 'danger' }[];
  }
): Promise<void> {
  try {
    const service = getService(serviceName);
    if (!service || !service.owner) {
      logger.warn(`No owner configured for service: ${serviceName}`);
      return;
    }

    // Get the owner user
    let owner: User | undefined;
    try {
      owner = await client.users.fetch(service.owner);
    } catch (error) {
      logger.error(`Failed to fetch owner user ${service.owner} for service ${serviceName}`, { error });
      return;
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(options.title)
      .setDescription(options.description)
      .setColor(getSeverityColor(options.severity || 'info'))
      .setTimestamp();

    // Add fields if provided
    if (options.fields?.length) {
      embed.addFields(options.fields);
    }

    // Create action buttons if provided
    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    if (options.actions?.length) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      
      for (const action of options.actions) {
        const button = new ButtonBuilder()
          .setLabel(action.label)
          .setStyle(getButtonStyle(action.style || 'secondary'));
          
        if (action.url) {
          button.setURL(action.url);
        } else {
          button.setCustomId(`action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`)
            .setDisabled(true); // Disable if no URL provided
        }
        
        row.addComponents(button);
      }
      
      components.push(row);
    }

    // Send DM to owner
    try {
      await owner.send({
        content: `🔔 **Service Notification**: ${serviceName}`,
        embeds: [embed],
        components: components.length ? components : undefined,
      });
      
      logger.info(`Sent notification to owner of ${serviceName}`, { ownerId: owner.id });
    } catch (error) {
      logger.error(`Failed to send DM to owner ${owner.id} for service ${serviceName}`, { error });
    }
  } catch (error) {
    logger.error(`Error in notifyServiceOwner for service ${serviceName}`, { error });
  }
}

/**
 * Send a notification to a service channel
 * @param client Discord client
 * @param serviceName Name of the service
 * @param options Notification options
 */
export async function notifyServiceChannel(
  client: Client,
  serviceName: string,
  options: {
    title: string;
    description: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    fields?: { name: string; value: string; inline?: boolean }[];
    pingRoles?: boolean;
    threadName?: string;
  }
): Promise<void> {
  try {
    const service = getService(serviceName);
    if (!service?.channelId) {
      logger.warn(`No channel configured for service: ${serviceName}`);
      return;
    }

    // Get the channel
    let channel: TextChannel | ThreadChannel | null = null;
    try {
      const fetchedChannel = await client.channels.fetch(service.channelId);
      if (fetchedChannel?.isTextBased()) {
        channel = fetchedChannel as TextChannel | ThreadChannel;
      }
    } catch (error) {
      logger.error(`Failed to fetch channel ${service.channelId} for service ${serviceName}`, { error });
      return;
    }

    if (!channel) {
      logger.warn(`Channel ${service.channelId} for service ${serviceName} is not a text channel`);
      return;
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`🔔 ${options.title}`)
      .setDescription(options.description)
      .setColor(getSeverityColor(options.severity || 'info'))
      .setTimestamp()
      .setFooter({ text: serviceName });

    // Add fields if provided
    if (options.fields?.length) {
      embed.addFields(options.fields);
    }

    // Send message to channel
    try {
      let messageContent = '';
      
      // Add role mentions if requested
      if (options.pingRoles && service.tags?.length) {
        // This is a simplified example - you might want to map tags to role IDs
        const roleMentions = service.tags
          .map(tag => {
            // This is a placeholder - you should implement your own tag to role mapping
            const roleId = getRoleIdForTag(tag);
            return roleId ? `<@&${roleId}>` : null;
          })
          .filter(Boolean);
          
        if (roleMentions.length > 0) {
          messageContent = roleMentions.join(' ');
        }
      }
      
      // Send message
      const message = await channel.send({
        content: messageContent || undefined,
        embeds: [embed],
      });
      
      logger.info(`Sent notification to channel for service ${serviceName}`, { channelId: channel.id });
      
      // Create thread if requested
      if (options.threadName && !channel.isThread()) {
        try {
          const thread = await message.startThread({
            name: options.threadName,
            autoArchiveDuration: 1440, // 1 day
            reason: `Discussion for: ${options.title}`,
          });
          
          await thread.send({
            content: 'Use this thread to discuss and resolve this issue.',
          });
          
          logger.info(`Created thread for notification`, { threadId: thread.id });
        } catch (error) {
          logger.error(`Failed to create thread for notification`, { error });
        }
      }
      
      return message;
    } catch (error) {
      logger.error(`Failed to send message to channel ${channel.id} for service ${serviceName}`, { error });
    }
  } catch (error) {
    logger.error(`Error in notifyServiceChannel for service ${serviceName}`, { error });
  }
}

/**
 * Get color based on severity
 */
function getSeverityColor(severity: 'info' | 'warning' | 'error' | 'critical'): number {
  switch (severity) {
    case 'critical': return 0xe74c3c; // Red
    case 'error': return 0xe67e22;    // Orange
    case 'warning': return 0xf1c40f;  // Yellow
    case 'info':
    default: return 0x3498db;         // Blue
  }
}

/**
 * Get button style from string
 */
function getButtonStyle(style: 'primary' | 'secondary' | 'success' | 'danger'): ButtonStyle {
  switch (style) {
    case 'primary': return ButtonStyle.Primary;
    case 'success': return ButtonStyle.Success;
    case 'danger': return ButtonStyle.Danger;
    case 'secondary':
    default: return ButtonStyle.Secondary;
  }
}

/**
 * Map service tags to role IDs (customize this based on your setup)
 */
function getRoleIdForTag(tag: string): string | null {
  // This is a placeholder - implement your own mapping logic
  const tagToRoleMap: Record<string, string> = {
    'production': process.env.ROLE_PRODUCTION || '',
    'critical': process.env.ROLE_CRITICAL || '',
    'backend': process.env.ROLE_BACKEND || '',
    'frontend': process.env.ROLE_FRONTEND || '',
  };
  
  return tagToRoleMap[tag.toLowerCase()] || null;
}

export { notifyServiceOwner, notifyServiceChannel };
