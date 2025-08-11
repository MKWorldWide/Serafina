import { Client, TextChannel, ThreadChannel } from 'discord.js';
import { getServices } from '../config/env';
import { ping } from '../services/heartbeat';
import { createLogger } from '../utils/logger';
import { createStatusEmbed } from '../ui/statusEmbed';
import { activeIncidents } from '../commands/incident';
import { StatusEntry } from '../commands/status-details';
import { getIncidentRoleId } from '../config/env';

const logger = createLogger({ service: 'jobs' });

// Store status history for each service
const statusHistory = new Map<string, StatusEntry[]>();

// Track service degradation
interface ServiceDegradation {
  startTime: Date;
  lastCheck: Date;
  consecutiveFailures: number;
  incidentId?: string;
}

const degradationMap = new Map<string, ServiceDegradation>();

/**
 * Initialize background jobs
 */
export function initializeJobs(client: Client) {
  // Start status thread updates if enabled
  if (process.env.ENABLE_STATUS_THREADS === 'true') {
    const updateInterval = parseInt(process.env.STATUS_THREAD_UPDATE_INTERVAL || '300000', 10);
    setInterval(() => updateStatusThreads(client), updateInterval);
    logger.info(`Started status thread updates every ${updateInterval}ms`);
  }
  
  // Start auto-incident detection
  const heartbeatInterval = parseInt(process.env.HEARTBEAT_INTERVAL || '30000', 10);
  setInterval(() => checkServices(client), heartbeatInterval);
  logger.info(`Started service monitoring every ${heartbeatInterval}ms`);
}

/**
 * Update status threads with current service status
 */
async function updateStatusThreads(client: Client) {
  const channelId = process.env.STATUS_THREAD_CHANNEL_ID;
  if (!channelId) {
    logger.warn('STATUS_THREAD_CHANNEL_ID not set, skipping status thread updates');
    return;
  }
  
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased()) {
      logger.error('Status thread channel is not a text channel', { channelId });
      return;
    }
    
    const services = getServices();
    const results = await Promise.allSettled(
      services.map(service => ping(service.url).then(result => ({ service, result })))
    );
    
    const serviceStatuses = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        const { service, result: pingResult } = result.value;
        return {
          name: service.name,
          url: service.url,
          ok: pingResult.ok,
          status: pingResult.status,
          responseTime: pingResult.ms || 0,
          error: pingResult.error?.message,
          version: pingResult.data?.version,
          uptime: pingResult.data?.uptime,
          lastChecked: new Date()
        };
      }
      return null;
    }).filter(Boolean);
    
    const embed = createStatusEmbed(serviceStatuses);
    
    // Find or create a thread for the status update
    const threadName = '🔍 Service Status';
    let thread = channel.threads.cache.find(t => t.name === threadName && !t.archived);
    
    if (!thread) {
      // Create a new thread if one doesn't exist
      thread = await (channel as TextChannel).threads.create({
        name: threadName,
        autoArchiveDuration: 60, // 1 hour
        reason: 'Service status monitoring thread'
      });
      logger.info('Created new status thread', { threadId: thread.id });
    }
    
    // Send or update the status message
    const messages = await thread.messages.fetch({ limit: 1 });
    const lastMessage = messages.first();
    
    if (lastMessage && lastMessage.author.id === client.user?.id) {
      await lastMessage.edit({ embeds: [embed] });
    } else {
      await thread.send({ embeds: [embed] });
    }
    
    logger.debug('Updated status thread', { threadId: thread.id });
    
  } catch (error) {
    logger.error('Failed to update status threads', { error });
  }
}

/**
 * Check services for issues and trigger incidents if needed
 */
async function checkServices(client: Client) {
  const services = getServices();
  
  for (const service of services) {
    try {
      const startTime = Date.now();
      const result = await ping(service.url);
      const responseTime = Date.now() - startTime;
      
      // Update status history
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
      
      // Check for service degradation
      await checkServiceDegradation(service, statusEntry, client);
      
    } catch (error) {
      logger.error(`Failed to check service ${service.name}`, { error });
    }
  }
}

/**
 * Check if a service is degraded and trigger incidents if needed
 */
async function checkServiceDegradation(service: any, statusEntry: StatusEntry, client: Client) {
  const degradationConfig = {
    failureThreshold: 3, // Number of consecutive failures before creating an incident
    recoveryThreshold: 3, // Number of consecutive successes before resolving an incident
    responseTimeThreshold: 5000, // ms, response time above this is considered degraded
  };
  
  // Get or initialize degradation tracking for this service
  let degradation = degradationMap.get(service.name) || {
    startTime: new Date(),
    lastCheck: new Date(),
    consecutiveFailures: 0,
    consecutiveSuccesses: 0,
    incidentId: undefined
  };
  
  // Update degradation tracking
  degradation.lastCheck = new Date();
  
  if (!statusEntry.ok || statusEntry.responseTime > degradationConfig.responseTimeThreshold) {
    // Service is failing or degraded
    degradation.consecutiveFailures++;
    degradation.consecutiveSuccesses = 0;
    
    // Check if we need to create an incident
    if (
      degradation.consecutiveFailures >= degradationConfig.failureThreshold && 
      !degradation.incidentId
    ) {
      const incident = await createIncident({
        service: service.name,
        title: `Service ${statusEntry.ok ? 'Degradation' : 'Outage'}: ${service.name}`,
        description: statusEntry.error || 
          `Service response time (${statusEntry.responseTime}ms) exceeds threshold (${degradationConfig.responseTimeThreshold}ms)`,
        severity: statusEntry.ok ? 'minor' : 'major',
        client
      });
      
      if (incident) {
        degradation.incidentId = incident.id;
        logger.info(`Created incident for service degradation: ${service.name}`, {
          incidentId: incident.id,
          service: service.name,
          consecutiveFailures: degradation.consecutiveFailures,
          responseTime: statusEntry.responseTime,
          error: statusEntry.error
        });
      }
    }
  } else {
    // Service is healthy
    degradation.consecutiveSuccesses++;
    degradation.consecutiveFailures = 0;
    
    // Check if we can resolve an existing incident
    if (
      degradation.incidentId && 
      degradation.consecutiveSuccesses >= degradationConfig.recoveryThreshold
    ) {
      await resolveIncident(degradation.incidentId, client);
      logger.info(`Resolved incident for service recovery: ${service.name}`, {
        incidentId: degradation.incidentId,
        service: service.name,
        consecutiveSuccesses: degradation.consecutiveSuccesses
      });
      degradation.incidentId = undefined;
    }
  }
  
  // Update the degradation map
  degradationMap.set(service.name, degradation);
}

/**
 * Create a new incident
 */
async function createIncident({
  service,
  title,
  description,
  severity = 'major',
  client
}: {
  service: string;
  title: string;
  description: string;
  severity?: 'minor' | 'major' | 'critical';
  client: Client;
}) {
  try {
    const incident = {
      id: `INC-${Date.now().toString(36).toUpperCase()}`,
      service,
      title,
      description,
      status: 'investigating' as const,
      severity,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: client.user?.id || 'system',
      updatedBy: client.user?.id || 'system',
      channelId: process.env.INCIDENT_CHANNEL_ID
    };
    
    // Add to active incidents
    activeIncidents.set(incident.id, incident);
    
    // Send notification to the incident channel if configured
    if (process.env.INCIDENT_CHANNEL_ID) {
      const channel = await client.channels.fetch(process.env.INCIDENT_CHANNEL_ID);
      if (channel?.isTextBased()) {
        const roleId = getIncidentRoleId(severity);
        const roleMention = roleId ? `<@&${roleId}>` : '';
        
        const embed = new EmbedBuilder()
          .setTitle(`🚨 ${incident.title}`)
          .setDescription(incident.description)
          .addFields(
            { name: 'Service', value: incident.service, inline: true },
            { name: 'Severity', value: `${getSeverityEmoji(incident.severity)} ${incident.severity.toUpperCase()}`, inline: true },
            { name: 'Status', value: '🔄 Investigating', inline: true },
            { name: 'Incident ID', value: `\`${incident.id}\``, inline: true },
            { name: 'Reported', value: `<t:${Math.floor(incident.createdAt.getTime() / 1000)}:R>`, inline: true }
          )
          .setColor(getSeverityColor(incident.severity))
          .setTimestamp();
        
        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`incident_update_${incident.id}`)
              .setLabel('Update')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(`incident_resolve_${incident.id}`)
              .setLabel('Resolve')
              .setStyle(ButtonStyle.Success)
          );
        
        const message = await channel.send({
          content: roleMention ? `${roleMention} New incident reported!` : 'New incident reported!',
          embeds: [embed],
          components: [row]
        });
        
        // Store the message ID for updates
        incident.messageId = message.id;
        activeIncidents.set(incident.id, incident);
      }
    }
    
    return incident;
  } catch (error) {
    logger.error('Failed to create incident', { error, service, title });
    return null;
  }
}

/**
 * Resolve an incident
 */
async function resolveIncident(incidentId: string, client: Client) {
  const incident = activeIncidents.get(incidentId);
  if (!incident) return false;
  
  try {
    // Update the incident
    incident.status = 'resolved';
    incident.updatedAt = new Date();
    incident.updatedBy = client.user?.id || 'system';
    incident.description += `\n\n**Resolved at ${new Date().toISOString()}**`;
    
    // Update the message if it exists
    if (incident.messageId && incident.channelId) {
      const channel = await client.channels.fetch(incident.channelId);
      if (channel?.isTextBased()) {
        try {
          const message = await channel.messages.fetch(incident.messageId);
          if (message) {
            const embed = message.embeds[0];
            if (embed) {
              // Find and update the status field
              const statusField = embed.fields?.find(field => field.name === 'Status');
              if (statusField) {
                statusField.value = '✅ Resolved';
              }
              
              // Disable all buttons
              const components = message.components.map(row => ({
                ...row,
                components: row.components.map(component => ({
                  ...component,
                  disabled: true,
                  ...(component.customId === `incident_resolve_${incident.id}` && {
                    label: 'Resolved',
                    style: ButtonStyle.Success
                  })
                }))
              }));
              
              await message.edit({ embeds: [embed], components });
            }
          }
        } catch (error) {
          logger.error('Failed to update incident message', {
            error,
            incidentId,
            messageId: incident.messageId
          });
        }
      }
    }
    
    // Remove from active incidents after a delay
    setTimeout(() => {
      activeIncidents.delete(incidentId);
    }, 7 * 24 * 60 * 60 * 1000); // Keep for 7 days
    
    return true;
  } catch (error) {
    logger.error('Failed to resolve incident', { error, incidentId });
    return false;
  }
}

// Helper functions for incident embeds
function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'critical': return '🔥';
    case 'major': return '⚠️';
    case 'minor': return 'ℹ️';
    default: return '❓';
  }
}

function getSeverityColor(severity: string): number {
  switch (severity) {
    case 'critical': return 0xe74c3c; // Red
    case 'major': return 0xf39c12; // Orange
    case 'minor': return 0x3498db; // Blue
    default: return 0x95a5a6; // Gray
  }
}

export { initializeJobs };
