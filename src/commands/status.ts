import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { pingAll } from "../services/heartbeat";
import { createStatusEmbed, createStatusButtons, ServiceStatus } from "../ui/statusEmbed";
import { createLogger } from "../utils/logger";

const logger = createLogger({ service: 'status-command' });

/**
 * Command data for the status command
 */
export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Show the status of all monitored services")
  .addBooleanOption(option =>
    option
      .setName("ephemeral")
      .setDescription("Whether to show the status only to you (default: false)")
      .setRequired(false)
  );

/**
 * Execute the status command
 * @param interaction The chat input command interaction
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
  
  try {
    // Defer the reply to give us more time to check all services
    await interaction.deferReply({ ephemeral });
    
    // Ping all services and measure total time
    const { results, msTotal } = await pingAll();
    
    // Convert results to ServiceStatus format for the embed
    const serviceStatuses: ServiceStatus[] = results.map(service => {
      // Handle both old and new response formats
      const responseData = 'data' in service ? service.data : service;
      const errorMessage = 'error' in service ? service.error?.message : undefined;
      const version = responseData?.version || (service as any).json?.version;
      const uptime = responseData?.uptime || (service as any).json?.uptime;
      
      return {
        name: service.name,
        url: service.url,
        ok: service.ok,
        status: service.status || 0,
        responseTime: 'ms' in service ? service.ms : 0,
        error: errorMessage,
        version,
        uptime,
        lastChecked: new Date()
      };
    });
    
    // Create the status embed
    const embed = createStatusEmbed(serviceStatuses);
    const components = createStatusButtons();
    
    // Send the embed with action buttons
    await interaction.editReply({
      embeds: [embed],
      components
    });
    
    logger.info('Status command executed', { 
      userId: interaction.user.id,
      guildId: interaction.guildId,
      serviceCount: results.length,
      okCount: results.filter(r => r.ok).length,
      responseTime: msTotal
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in status command', { 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
    
    await interaction.editReply({
      content: "❌ An error occurred while checking service statuses. Please try again later.",
      embeds: [],
      components: []
    });
  }
}

/**
 * Handles button interactions for the status command
 */
export async function handleButtonInteraction(interaction: any) {
  if (!interaction.isButton()) return false;
  
  const { customId } = interaction;
  
  try {
    // Handle refresh button
    if (customId === 'status_refresh') {
      await interaction.deferUpdate();
      
      // Re-run the status command
      const { results, msTotal } = await pingAll();
      
      // Convert results to ServiceStatus format
      const serviceStatuses: ServiceStatus[] = results.map(service => {
        // Handle both old and new response formats
        const responseData = 'data' in service ? service.data : service;
        const errorMessage = 'error' in service ? service.error?.message : undefined;
        const version = responseData?.version || (service as any).json?.version;
        const uptime = responseData?.uptime || (service as any).json?.uptime;
        
        return {
          name: service.name,
          url: service.url,
          ok: service.ok,
          status: service.status || 0,
          responseTime: 'ms' in service ? service.ms : 0,
          error: errorMessage,
          version,
          uptime,
          lastChecked: new Date()
        };
      });
      
      // Update the message with fresh data
      const embed = createStatusEmbed(serviceStatuses);
      const components = createStatusButtons();
      
      await interaction.editReply({
        embeds: [embed],
        components
      });
      
      return true;
    }
    
    // Handle acknowledge button
    if (customId === 'status_acknowledge') {
      await interaction.deferUpdate();
      
      // Check if the user has permission to acknowledge
      // This is a basic check - you might want to enhance this with proper role-based permissions
      if (!interaction.member.permissions.has('ManageGuild')) {
        await interaction.followUp({
          content: '❌ You need the "Manage Server" permission to acknowledge status issues.',
          ephemeral: true
        });
        return true;
      }
      
      // Update the embed to show who acknowledged the status
      const originalEmbed = interaction.message.embeds[0];
      const acknowledgedEmbed = {
        ...originalEmbed,
        footer: {
          text: `Acknowledged by ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL()
        },
        timestamp: new Date().toISOString()
      };
      
      // Disable the acknowledge button
      const components = interaction.message.components.map((row: any) => ({
        ...row,
        components: row.components.map((component: any) => {
          if (component.customId === 'status_acknowledge') {
            return {
              ...component,
              disabled: true,
              label: 'Acknowledged',
              emoji: '✅'
            };
          }
          return component;
        })
      }));
      
      await interaction.editReply({
        embeds: [acknowledgedEmbed],
        components
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error handling status button', { 
      error: errorMessage,
      customId,
      userId: interaction.user.id,
      messageId: interaction.message.id
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
