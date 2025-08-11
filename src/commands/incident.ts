import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ModalSubmitInteraction } from 'discord.js';
import { getService, getServices } from '../config/services';
import { createLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger({ service: 'incident-command' });

// In-memory store for incidents (in a real app, this would be a database)
const activeIncidents = new Map<string, Incident>();

interface Incident {
  id: string;
  service: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  messageId?: string;
  channelId?: string;
}

/**
 * Command data for the incident command
 */
export const data = new SlashCommandBuilder()
  .setName('incident')
  .setDescription('Manage service incidents')
  .addSubcommand(subcommand =>
    subcommand
      .setName('create')
      .setDescription('Create a new incident')
      .addStringOption(option =>
        option
          .setName('service')
          .setDescription('The affected service')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName('title')
          .setDescription('Short title for the incident')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('severity')
          .setDescription('Severity of the incident')
          .setRequired(true)
          .addChoices(
            { name: 'Minor - Minor impact', value: 'minor' },
            { name: 'Major - Significant impact', value: 'major' },
            { name: 'Critical - Service down', value: 'critical' }
          )
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('update')
      .setDescription('Update an existing incident')
      .addStringOption(option =>
        option
          .setName('id')
          .setDescription('The incident ID')
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('List active incidents')
  );

/**
 * Handle autocomplete for the service name and incident ID
 */
export async function autocomplete(interaction: any) {
  const focusedOption = interaction.options.getFocused(true);
  
  if (focusedOption.name === 'service') {
    const focusedValue = focusedOption.value.toLowerCase();
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
  } else if (focusedOption.name === 'id') {
    const focusedValue = focusedOption.value.toLowerCase();
    const incidents = Array.from(activeIncidents.values())
      .filter(incident => 
        incident.id.toLowerCase().includes(focusedValue) ||
        incident.title.toLowerCase().includes(focusedValue) ||
        incident.service.toLowerCase().includes(focusedValue)
      )
      .slice(0, 25);
    
    await interaction.respond(
      incidents.map(incident => ({
        name: `${incident.id}: ${incident.title} (${incident.service})`,
        value: incident.id
      }))
    );
  }
}

/**
 * Execute the incident command
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  
  try {
    switch (subcommand) {
      case 'create':
        await handleCreateIncident(interaction);
        break;
      case 'update':
        await handleUpdateIncident(interaction);
        break;
      case 'list':
        await handleListIncidents(interaction);
        break;
      default:
        await interaction.reply({
          content: '❌ Unknown subcommand',
          ephemeral: true
        });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error in incident ${subcommand} command`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    
    await interaction.reply({
      content: `❌ An error occurred while processing your request: ${errorMessage}`,
      ephemeral: true
    });
  }
}

/**
 * Handle the create incident subcommand
 */
async function handleCreateIncident(interaction: ChatInputCommandInteraction) {
  const serviceName = interaction.options.getString('service', true);
  const title = interaction.options.getString('title', true);
  const severity = interaction.options.getString('severity', true) as 'minor' | 'major' | 'critical';
  
  const service = getService(serviceName);
  if (!service) {
    await interaction.reply({
      content: `❌ No service found with name "${serviceName}"`,
      ephemeral: true
    });
    return;
  }
  
  // Create a modal for the incident description
  const modal = new ModalBuilder()
    .setCustomId(`incident_create_${Date.now()}`)
    .setTitle('Create Incident');
  
  // Add components to modal
  const descriptionInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Incident Description')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Describe the incident in detail...')
    .setRequired(true);
  
  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);
  modal.addComponents(firstActionRow);
  
  // Show the modal to the user
  await interaction.showModal(modal);
  
  // Create a filter to only collect responses from the user who triggered the command
  const filter = (i: any) => i.customId === modal.data.custom_id;
  
  try {
    const modalResponse = await interaction.awaitModalSubmit({ filter, time: 300_000 }); // 5 minutes
    const description = modalResponse.fields.getTextInputValue('description');
    
    // Create the incident
    const incident: Incident = {
      id: `INC-${uuidv4().substring(0, 6).toUpperCase()}`,
      service: service.name,
      title,
      description,
      status: 'investigating',
      severity,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: interaction.user.id,
      updatedBy: interaction.user.id,
      channelId: interaction.channelId
    };
    
    // Store the incident
    activeIncidents.set(incident.id, incident);
    
    // Create the incident embed
    const embed = createIncidentEmbed(incident);
    
    // Add action buttons
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`incident_update_${incident.id}`)
          .setLabel('Update Status')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`incident_resolve_${incident.id}`)
          .setLabel('Resolve')
          .setStyle(ButtonStyle.Success)
      );
    
    // Send the incident message
    const message = await interaction.channel?.send({
      content: `<@&${getIncidentRoleId(incident.severity)}> New incident reported!`,
      embeds: [embed],
      components: [row]
    });
    
    // Store the message ID for future updates
    if (message) {
      incident.messageId = message.id;
      activeIncidents.set(incident.id, incident);
    }
    
    // Acknowledge the modal submission
    await modalResponse.reply({
      content: `✅ Created incident ${incident.id}: ${incident.title}`,
      ephemeral: true
    });
    
    logger.info('Created new incident', {
      incidentId: incident.id,
      service: incident.service,
      severity: incident.severity,
      createdBy: incident.createdBy,
      channelId: incident.channelId,
      messageId: incident.messageId
    });
    
  } catch (error) {
    // Handle the user not submitting the modal
    if (error instanceof Error && error.message.includes('timeout')) {
      await interaction.followUp({
        content: '❌ You took too long to submit the incident details. Please try again.',
        ephemeral: true
      });
    } else {
      throw error;
    }
  }
}

/**
 * Handle the update incident subcommand
 */
async function handleUpdateIncident(interaction: ChatInputCommandInteraction) {
  const incidentId = interaction.options.getString('id', true);
  const incident = activeIncidents.get(incidentId);
  
  if (!incident) {
    await interaction.reply({
      content: `❌ No active incident found with ID "${incidentId}"`,
      ephemeral: true
    });
    return;
  }
  
  // Create a modal for the incident update
  const modal = new ModalBuilder()
    .setCustomId(`incident_update_${incident.id}_${Date.now()}`)
    .setTitle(`Update Incident ${incident.id}`);
  
  // Add components to modal
  const statusInput = new TextInputBuilder()
    .setCustomId('status')
    .setLabel('Status Update')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Provide an update on the incident...')
    .setRequired(true);
  
  const statusRow = new ActionRowBuilder<TextInputBuilder>().addComponents(statusInput);
  modal.addComponents(statusRow);
  
  // Show the modal to the user
  await interaction.showModal(modal);
  
  // Create a filter to only collect responses from the user who triggered the command
  const filter = (i: any) => i.customId === modal.data.custom_id;
  
  try {
    const modalResponse = await interaction.awaitModalSubmit({ filter, time: 300_000 }); // 5 minutes
    const updateText = modalResponse.fields.getTextInputValue('status');
    
    // Update the incident
    incident.updatedAt = new Date();
    incident.updatedBy = interaction.user.id;
    incident.description += `\n\n**Update (${new Date().toISOString()})**: ${updateText}`;
    
    // Save the updated incident
    activeIncidents.set(incident.id, incident);
    
    // Update the incident message if it exists
    if (incident.messageId && incident.channelId) {
      const channel = interaction.guild?.channels.cache.get(incident.channelId);
      if (channel?.isTextBased()) {
        try {
          const message = await channel.messages.fetch(incident.messageId);
          if (message) {
            const embed = createIncidentEmbed(incident);
            await message.edit({ embeds: [embed] });
          }
        } catch (error) {
          logger.error('Failed to update incident message', {
            error: error instanceof Error ? error.message : 'Unknown error',
            incidentId: incident.id,
            messageId: incident.messageId,
            channelId: incident.channelId
          });
        }
      }
    }
    
    // Acknowledge the modal submission
    await modalResponse.reply({
      content: `✅ Updated incident ${incident.id}`,
      ephemeral: true
    });
    
    logger.info('Updated incident', {
      incidentId: incident.id,
      updatedBy: incident.updatedBy
    });
    
  } catch (error) {
    // Handle the user not submitting the modal
    if (error instanceof Error && error.message.includes('timeout')) {
      await interaction.followUp({
        content: '❌ You took too long to submit the update. Please try again.',
        ephemeral: true
      });
    } else {
      throw error;
    }
  }
}

/**
 * Handle the list incidents subcommand
 */
async function handleListIncidents(interaction: ChatInputCommandInteraction) {
  const incidents = Array.from(activeIncidents.values());
  
  if (incidents.length === 0) {
    await interaction.reply({
      content: '✅ There are no active incidents.',
      ephemeral: true
    });
    return;
  }
  
  // Sort by severity and creation time
  const severityOrder = { critical: 0, major: 1, minor: 2 };
  incidents.sort((a, b) => {
    if (a.severity !== b.severity) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
  
  // Create an embed with the list of incidents
  const embed = new EmbedBuilder()
    .setTitle('🚨 Active Incidents')
    .setDescription(`There are currently **${incidents.length}** active incidents.`)
    .setColor(0xe74c3c) // Red
    .setTimestamp();
  
  // Add a field for each incident
  for (const incident of incidents) {
    const statusEmoji = getStatusEmoji(incident.status);
    const severityEmoji = getSeverityEmoji(incident.severity);
    
    embed.addFields({
      name: `${severityEmoji} ${incident.id}: ${incident.title}`,
      value: [
        `**Service:** ${incident.service}`,
        `**Status:** ${statusEmoji} ${formatStatus(incident.status)}`,
        `**Created:** <t:${Math.floor(incident.createdAt.getTime() / 1000)}:R>`,
        `**Last Updated:** <t:${Math.floor(incident.updatedAt.getTime() / 1000)}:R>`,
        `**Reported By:** <@${incident.createdBy}>`,
        `\`/incident update id:${incident.id}\``
      ].join('\n'),
      inline: false
    });
  }
  
  await interaction.reply({
    embeds: [embed],
    ephemeral: true
  });
}

/**
 * Handle button interactions for incidents
 */
export async function handleButtonInteraction(interaction: any) {
  if (!interaction.isButton()) return false;
  
  const { customId } = interaction;
  
  try {
    // Handle incident update button
    if (customId.startsWith('incident_update_')) {
      const incidentId = customId.replace('incident_update_', '');
      const incident = activeIncidents.get(incidentId);
      
      if (!incident) {
        await interaction.reply({
          content: '❌ This incident no longer exists or has been resolved.',
          ephemeral: true
        });
        return true;
      }
      
      // Create a modal for the incident update
      const modal = new ModalBuilder()
        .setCustomId(`incident_update_${incident.id}_${Date.now()}`)
        .setTitle(`Update Incident ${incident.id}`);
      
      // Add components to modal
      const statusInput = new TextInputBuilder()
        .setCustomId('status')
        .setLabel('Status Update')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Provide an update on the incident...')
        .setRequired(true);
      
      const statusRow = new ActionRowBuilder<TextInputBuilder>().addComponents(statusInput);
      modal.addComponents(statusRow);
      
      // Show the modal to the user
      await interaction.showModal(modal);
      return true;
    }
    
    // Handle incident resolve button
    if (customId.startsWith('incident_resolve_')) {
      await interaction.deferUpdate();
      
      const incidentId = customId.replace('incident_resolve_', '');
      const incident = activeIncidents.get(incidentId);
      
      if (!incident) {
        await interaction.followUp({
          content: '❌ This incident no longer exists or has already been resolved.',
          ephemeral: true
        });
        return true;
      }
      
      // Update the incident status
      incident.status = 'resolved';
      incident.updatedAt = new Date();
      incident.updatedBy = interaction.user.id;
      incident.description += `\n\n**Resolved by <@${interaction.user.id}> at ${new Date().toISOString()}**`;
      
      // Update the incident message
      const embed = createIncidentEmbed(incident);
      
      // Disable all buttons
      const components = interaction.message.components.map((row: any) => ({
        ...row,
        components: row.components.map((component: any) => ({
          ...component,
          disabled: true,
          ...(component.customId === `incident_resolve_${incident.id}` && {
            label: 'Resolved',
            style: ButtonStyle.Success
          })
        }))
      }));
      
      await interaction.editReply({
        embeds: [embed],
        components
      });
      
      // Remove from active incidents after a delay
      setTimeout(() => {
        activeIncidents.delete(incident.id);
      }, 7 * 24 * 60 * 60 * 1000); // Keep for 7 days
      
      logger.info('Resolved incident', {
        incidentId: incident.id,
        resolvedBy: interaction.user.id
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error handling incident button', {
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

/**
 * Create an embed for an incident
 */
function createIncidentEmbed(incident: Incident): EmbedBuilder {
  const statusEmoji = getStatusEmoji(incident.status);
  const severityEmoji = getSeverityEmoji(incident.severity);
  
  const embed = new EmbedBuilder()
    .setTitle(`🚨 ${incident.title}`)
    .setDescription(incident.description)
    .setColor(getSeverityColor(incident.severity))
    .addFields(
      {
        name: 'Service',
        value: incident.service,
        inline: true
      },
      {
        name: 'Status',
        value: `${statusEmoji} ${formatStatus(incident.status)}`,
        inline: true
      },
      {
        name: 'Severity',
        value: `${severityEmoji} ${formatSeverity(incident.severity)}`,
        inline: true
      },
      {
        name: 'Incident ID',
        value: `\`${incident.id}\``,
        inline: true
      },
      {
        name: 'Created',
        value: `<t:${Math.floor(incident.createdAt.getTime() / 1000)}:R>`,
        inline: true
      },
      {
        name: 'Last Updated',
        value: `<t:${Math.floor(incident.updatedAt.getTime() / 1000)}:R>`,
        inline: true
      },
      {
        name: 'Reported By',
        value: `<@${incident.createdBy}>`,
        inline: true
      },
      {
        name: 'Last Updated By',
        value: `<@${incident.updatedBy}>`,
        inline: true
      }
    )
    .setTimestamp(incident.updatedAt);
  
  return embed;
}

/**
 * Get the emoji for a status
 */
function getStatusEmoji(status: string): string {
  switch (status) {
    case 'investigating':
      return '🔍';
    case 'identified':
      return '🔧';
    case 'monitoring':
      return '👀';
    case 'resolved':
      return '✅';
    default:
      return '❓';
  }
}

/**
 * Get the emoji for a severity
 */
function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'critical':
      return '🔥';
    case 'major':
      return '⚠️';
    case 'minor':
      return 'ℹ️';
    default:
      return '❓';
  }
}

/**
 * Get the color for a severity
 */
function getSeverityColor(severity: string): number {
  switch (severity) {
    case 'critical':
      return 0xe74c3c; // Red
    case 'major':
      return 0xf39c12; // Orange
    case 'minor':
      return 0x3498db; // Blue
    default:
      return 0x95a5a6; // Gray
  }
}

/**
 * Format a status for display
 */
function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Format a severity for display
 */
function formatSeverity(severity: string): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

/**
 * Get the role ID for pinging based on severity
 */
function getIncidentRoleId(severity: string): string {
  // These should be configured in your environment or config
  switch (severity) {
    case 'critical':
      return process.env.INCIDENT_ROLE_CRITICAL || '';
    case 'major':
      return process.env.INCIDENT_ROLE_MAJOR || '';
    case 'minor':
      return process.env.INCIDENT_ROLE_MINOR || '';
    default:
      return '';
  }
}

export default {
  data,
  autocomplete,
  execute,
  handleButtonInteraction
};
