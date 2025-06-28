import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, Guild, ChannelType } from 'discord.js';
import { Command } from '../types/Command';
import { logger } from '../utils/logger';
import { ServerManager } from '../services/ServerManager';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('manage')
    .setDescription('Server management commands for administrators')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Initialize or reinitialize the server structure')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Check server status and configuration')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('fix')
        .setDescription('Fix missing channels and roles')
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const guild = interaction.guild;
      if (!guild) {
        await interaction.editReply('❌ This command can only be used in a server!');
        return;
      }

      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case 'setup':
          await handleSetup(interaction, guild);
          break;
        case 'status':
          await handleStatus(interaction, guild);
          break;
        case 'fix':
          await handleFix(interaction, guild);
          break;
        default:
          await interaction.editReply('❌ Unknown subcommand');
      }

    } catch (error) {
      logger.error('Error in manage command:', error);
      await interaction.editReply('❌ An error occurred while executing the command. Please check the logs for details.');
    }
  },

  cooldown: 60 // 1 minute cooldown
};

// Private methods for the command
async function handleSetup(interaction: ChatInputCommandInteraction, guild: Guild) {
  try {
    const serverManager = new ServerManager(guild);
    await serverManager.initializeServer();

    const embed = new EmbedBuilder()
      .setTitle('✅ Server Setup Complete')
      .setColor(0x00FF00)
      .setDescription('The server has been successfully initialized with all required channels, roles, and configurations.')
      .addFields(
        { name: 'Categories Created', value: '6', inline: true },
        { name: 'Channels Created', value: '25+', inline: true },
        { name: 'Roles Created', value: '7', inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    logger.info(`Server setup completed by ${interaction.user.tag}`);

  } catch (error) {
    logger.error('Error in setup:', error);
    await interaction.editReply('❌ Failed to setup server. Please check the logs for details.');
  }
}

async function handleStatus(interaction: ChatInputCommandInteraction, guild: Guild) {
  try {
    const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const roles = guild.roles.cache.size;
    const members = guild.memberCount;

    const embed = new EmbedBuilder()
      .setTitle('📊 Server Status')
      .setColor(0x0099FF)
      .setDescription(`Current status of **${guild.name}**`)
      .addFields(
        { name: 'Categories', value: categories.toString(), inline: true },
        { name: 'Text Channels', value: textChannels.toString(), inline: true },
        { name: 'Voice Channels', value: voiceChannels.toString(), inline: true },
        { name: 'Roles', value: roles.toString(), inline: true },
        { name: 'Members', value: members.toString(), inline: true },
        { name: 'Server ID', value: guild.id, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    logger.error('Error in status:', error);
    await interaction.editReply('❌ Failed to get server status.');
  }
}

async function handleFix(interaction: ChatInputCommandInteraction, guild: Guild) {
  try {
    const serverManager = new ServerManager(guild);
    await serverManager.checkAndCreateMissingChannels();

    const embed = new EmbedBuilder()
      .setTitle('🔧 Server Fix Applied')
      .setColor(0xFFA500)
      .setDescription('The server has been checked and any missing channels or roles have been recreated.')
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    logger.info(`Server fix applied by ${interaction.user.tag}`);

  } catch (error) {
    logger.error('Error in fix:', error);
    await interaction.editReply('❌ Failed to fix server issues.');
  }
} 