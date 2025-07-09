import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';
import type { Command } from '../types/Command';
import { logger } from '../utils/logger';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('View moderation history and trial records')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(subcommand =>
      subcommand
        .setName('mod')
        .setDescription("View a moderator's history")
        .addUserOption(option =>
          option.setName('moderator').setDescription('The moderator to check').setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('user')
        .setDescription("View a user's moderation history")
        .addUserOption(option =>
          option.setName('user').setDescription('The user to check').setRequired(true),
        ),
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
      const targetUser = interaction.options.getUser(
        subcommand === 'mod' ? 'moderator' : 'user',
        true,
      );
      const member = await guild.members.fetch(targetUser.id);

      // Get mod logs channel
      const modLogsChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
      if (!modLogsChannel?.isTextBased()) {
        await interaction.editReply('❌ Mod logs channel not found. Please run /setup first.');
        return;
      }

      // Fetch recent messages from mod logs
      const messages = await modLogsChannel.messages.fetch({ limit: 100 });
      const relevantLogs = messages.filter(msg => {
        const content = msg.content.toLowerCase();
        return (
          content.includes(targetUser.id) ||
          (msg.embeds.length > 0 && msg.embeds[0]?.description?.includes(targetUser.id))
        );
      });

      if (relevantLogs.size === 0) {
        await interaction.editReply(`No moderation history found for ${targetUser.tag}`);
        return;
      }

      // Create history embed
      const historyEmbed = new EmbedBuilder()
        .setTitle(`📜 Moderation History: ${targetUser.tag}`)
        .setColor(0x9370db)
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp();

      // Process logs
      const actions = new Map<string, number>();
      const evaluations: string[] = [];
      const warnings: string[] = [];
      const mutes: string[] = [];
      const bans: string[] = [];

      for (const [_, msg] of relevantLogs) {
        const embed = msg.embeds[0];
        if (!embed) continue;

        const title = embed.title?.toLowerCase() || '';
        const description = embed.description || '';

        if (title.includes('evaluation')) {
          evaluations.push(description);
        } else if (title.includes('warning')) {
          warnings.push(description);
        } else if (title.includes('mute')) {
          mutes.push(description);
        } else if (title.includes('ban')) {
          bans.push(description);
        }

        // Count actions
        if (title.includes('warning')) actions.set('warnings', (actions.get('warnings') || 0) + 1);
        if (title.includes('mute')) actions.set('mutes', (actions.get('mutes') || 0) + 1);
        if (title.includes('ban')) actions.set('bans', (actions.get('bans') || 0) + 1);
        if (title.includes('evaluation'))
          actions.set('evaluations', (actions.get('evaluations') || 0) + 1);
      }

      // Add action summary
      if (actions.size > 0) {
        const summary = Array.from(actions.entries())
          .map(([action, count]) => `${action}: ${count}`)
          .join('\n');
        historyEmbed.addFields({ name: '📊 Action Summary', value: summary });
      }

      // Add recent evaluations
      if (evaluations.length > 0) {
        historyEmbed.addFields({
          name: '📝 Recent Evaluations',
          value: evaluations.slice(0, 3).join('\n\n'),
        });
      }

      // Add recent warnings
      if (warnings.length > 0) {
        historyEmbed.addFields({
          name: '⚠️ Recent Warnings',
          value: warnings.slice(0, 3).join('\n\n'),
        });
      }

      // Add recent mutes
      if (mutes.length > 0) {
        historyEmbed.addFields({
          name: '🔇 Recent Mutes',
          value: mutes.slice(0, 3).join('\n\n'),
        });
      }

      // Add recent bans
      if (bans.length > 0) {
        historyEmbed.addFields({
          name: '🚫 Recent Bans',
          value: bans.slice(0, 3).join('\n\n'),
        });
      }

      // Add role information
      const roles = member.roles.cache
        .filter(role => role.name !== '@everyone')
        .map(role => role.toString())
        .join(', ');

      if (roles) {
        historyEmbed.addFields({ name: '👑 Current Roles', value: roles });
      }

      await interaction.editReply({ embeds: [historyEmbed] });
      logger.info(`Moderation history viewed for ${targetUser.tag} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error in history command:', error);
      await interaction.editReply(
        '❌ An error occurred while fetching moderation history. Please check the logs for details.',
      );
    }
  },

  cooldown: 30, // 30 seconds cooldown
};
