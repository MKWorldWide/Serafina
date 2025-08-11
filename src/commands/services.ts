import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getServices } from '../config/services';
import { createLogger } from '../utils/logger';

const logger = createLogger({ service: 'services-command' });

/**
 * Command data for the services command
 */
export const data = new SlashCommandBuilder()
  .setName('services')
  .setDescription('List all registered services and their status')
  .addBooleanOption(option =>
    option
      .setName('ephemeral')
      .setDescription('Whether to show the response only to you (default: false)')
      .setRequired(false)
  );

/**
 * Execute the services command
 * @param interaction The chat input command interaction
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
  
  try {
    await interaction.deferReply({ ephemeral });
    
    const services = getServices();
    
    if (services.length === 0) {
      await interaction.editReply({
        content: '❌ No services are currently registered.'
      });
      return;
    }
    
    // Group services by category (if any)
    const serviceGroups = services.reduce((acc, service) => {
      const category = service.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {} as Record<string, typeof services>);
    
    // Create a field for each service
    const fields = Object.entries(serviceGroups).map(([category, categoryServices]) => {
      const servicesList = categoryServices.map(service => {
        const ownerMention = service.owner ? `<@${service.owner}>` : 'Not assigned';
        const channelMention = service.channelId ? `<#${service.channelId}>` : 'Not set';
        
        return `• **${service.name}**\n` +
               `  URL: \`${service.url}\`\n` +
               `  Owner: ${ownerMention}\n` +
               `  Channel: ${channelMention}`;
      }).join('\n\n');
      
      return {
        name: `📁 ${category} (${categoryServices.length})`,
        value: servicesList,
        inline: false
      };
    });
    
    // Create the embed
    const embed = new EmbedBuilder()
      .setTitle('🔧 Registered Services')
      .setDescription(`There are currently **${services.length}** services registered.`)
      .setColor(0x3498db) // Blue
      .addFields(fields)
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      });
    
    // Add buttons for common actions
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('status_check_all')
          .setLabel('Check Status')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔄'),
        new ButtonBuilder()
          .setURL('https://discord.com/developers/applications')
          .setLabel('Manage in Dev Portal')
          .setStyle(ButtonStyle.Link)
      );
    
    await interaction.editReply({
      embeds: [embed],
      components: [row]
    });
    
    logger.info('Services command executed', {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      serviceCount: services.length,
      ephemeral
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in services command', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    
    await interaction.editReply({
      content: '❌ An error occurred while fetching the registered services. Please try again later.'
    });
  }
}

/**
 * Handles button interactions for the services command
 */
export async function handleButtonInteraction(interaction: any) {
  if (!interaction.isButton()) return false;
  
  const { customId } = interaction;
  
  try {
    if (customId === 'status_check_all') {
      await interaction.deferUpdate();
      
      // Import the status command handler to reuse its functionality
      const { execute: statusExecute } = await import('./status');
      
      // Create a mock interaction with the status command
      const mockInteraction = {
        ...interaction,
        commandName: 'status',
        options: {
          getBoolean: () => false // Always show to everyone
        },
        reply: interaction.reply.bind(interaction),
        editReply: interaction.editReply.bind(interaction)
      };
      
      // Execute the status command
      await statusExecute(mockInteraction as any);
      return true;
    }
    
    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error handling services button', {
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
  execute,
  handleButtonInteraction
};
