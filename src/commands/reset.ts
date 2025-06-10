import { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types/Command';
import { logger } from '../utils/logger';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Clear all channels and categories (Use with caution!)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON(),

  async execute(interaction: CommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const guild = interaction.guild;
      if (!guild) {
        await interaction.editReply('❌ This command can only be used in a server!');
        return;
      }

      // Get all channels
      const channels = guild.channels.cache;
      
      // Delete all channels
      for (const channel of channels.values()) {
        try {
          await channel.delete('GameDin server reset');
          logger.info(`Deleted channel: ${channel.name}`);
        } catch (error) {
          logger.error(`Failed to delete channel ${channel.name}:`, error);
        }
      }

      await interaction.editReply('✅ All channels have been cleared. You can now use /setup to initialize the server.');
      logger.info(`Server reset completed for guild: ${guild.name} (${guild.id})`);

    } catch (error) {
      logger.error('Error in reset command:', error);
      await interaction.editReply('❌ An error occurred while resetting the server. Please check the logs for details.');
    }
  },

  cooldown: 300 // 5 minutes cooldown
}; 