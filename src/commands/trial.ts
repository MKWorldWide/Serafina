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
    .setName('trial')
    .setDescription('Manage trial moderators')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a trial moderator')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('The user to add as trial moderator')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Reason for adding as trial moderator')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('promote')
        .setDescription('Promote a trial moderator to full moderator')
        .addUserOption(option =>
          option.setName('user').setDescription('The trial moderator to promote').setRequired(true),
        )
        .addStringOption(option =>
          option.setName('reason').setDescription('Reason for promotion').setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a trial moderator')
        .addUserOption(option =>
          option.setName('user').setDescription('The trial moderator to remove').setRequired(true),
        )
        .addStringOption(option =>
          option.setName('reason').setDescription('Reason for removal').setRequired(true),
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
      const user = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason', true);
      const member = await guild.members.fetch(user.id);

      const trialRole = guild.roles.cache.find(r => r.name === '🌟 Trial Seraph');
      const modRole = guild.roles.cache.find(r => r.name === '✨ Seraph');

      if (!trialRole || !modRole) {
        await interaction.editReply('❌ Required roles not found. Please run /setup first.');
        return;
      }

      const modLogsChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
      if (!modLogsChannel?.isTextBased()) {
        await interaction.editReply('❌ Mod logs channel not found. Please run /setup first.');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0xff69b4)
        .setTimestamp()
        .setFooter({ text: `Action by ${interaction.user.tag}` });

      switch (subcommand) {
        case 'add': {
          if (member.roles.cache.has(trialRole.id)) {
            await interaction.editReply('❌ This user is already a trial moderator.');
            return;
          }

          await member.roles.add(trialRole);
          embed
            .setTitle('🆕 Trial Moderator Added')
            .setDescription(`**User:** ${user.tag} (${user.id})\n**Reason:** ${reason}`)
            .setColor(0x9370db);

          await modLogsChannel.send({ embeds: [embed] });
          await interaction.editReply(`✅ Added ${user.tag} as trial moderator.`);
          break;
        }

        case 'promote': {
          if (!member.roles.cache.has(trialRole.id)) {
            await interaction.editReply('❌ This user is not a trial moderator.');
            return;
          }

          await member.roles.remove(trialRole);
          await member.roles.add(modRole);
          embed
            .setTitle('⬆️ Trial Moderator Promoted')
            .setDescription(`**User:** ${user.tag} (${user.id})\n**Reason:** ${reason}`)
            .setColor(0xff69b4);

          await modLogsChannel.send({ embeds: [embed] });
          await interaction.editReply(`✅ Promoted ${user.tag} to full moderator.`);
          break;
        }

        case 'remove': {
          if (!member.roles.cache.has(trialRole.id)) {
            await interaction.editReply('❌ This user is not a trial moderator.');
            return;
          }

          await member.roles.remove(trialRole);
          embed
            .setTitle('❌ Trial Moderator Removed')
            .setDescription(`**User:** ${user.tag} (${user.id})\n**Reason:** ${reason}`)
            .setColor(0xff0000);

          await modLogsChannel.send({ embeds: [embed] });
          await interaction.editReply(`✅ Removed ${user.tag} from trial moderator role.`);
          break;
        }
      }

      logger.info(
        `Trial moderator ${subcommand} executed for ${user.tag} by ${interaction.user.tag}`,
      );
    } catch (error) {
      logger.error('Error in trial command:', error);
      await interaction.editReply(
        '❌ An error occurred while managing trial moderators. Please check the logs for details.',
      );
    }
  },

  cooldown: 10, // 10 seconds cooldown
};
