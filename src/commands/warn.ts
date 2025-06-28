import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import { logger } from '../utils/logger';

const wisdomQuotes = [
  "In truth, we find growth. In growth, we find wisdom.",
  "Every action is a seed. Choose to plant kindness.",
  "The path of wisdom is paved with understanding.",
  "In the garden of truth, every flower blooms in its time.",
  "Through understanding, we find peace. Through peace, we find strength.",
  "The mirror of truth reflects both light and shadow.",
  "In the dance of words, let truth lead the way.",
  "Wisdom flows like water, finding its path through every obstacle.",
  "The heart of understanding beats with the rhythm of truth.",
  "In the silence between words, truth speaks loudest."
];

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning with wisdom and guidance')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to warn')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('guidance')
        .setDescription('Guidance for improvement')
        .setRequired(true)
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

      const targetUser = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason', true);
      const guidance = interaction.options.getString('guidance', true);
      const member = await guild.members.fetch(targetUser.id);

      // Get mod logs channel
      const modLogsChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
      if (!modLogsChannel?.isTextBased()) {
        await interaction.editReply('❌ Mod logs channel not found. Please run /setup first.');
        return;
      }

      // Select a random wisdom quote
      const wisdomQuote = wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];

      // Create warning embed
      const warningEmbed = new EmbedBuilder()
        .setTitle('✨ Wisdom\'s Warning')
        .setColor(0xFFD700)
        .setDescription(`**User:** ${targetUser.tag} (${targetUser.id})\n**Reason:** ${reason}\n\n**Guidance:** ${guidance}\n\n*"${wisdomQuote}"*`)
        .setTimestamp()
        .setFooter({ text: `Warned by ${interaction.user.tag}` });

      // Send to mod logs
      await modLogsChannel.send({ embeds: [warningEmbed] });

      // Try to DM the user
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle('✨ A Message of Guidance')
          .setColor(0xFFD700)
          .setDescription(`You have received a warning in ${guild.name}.\n\n**Reason:** ${reason}\n\n**Guidance for Growth:** ${guidance}\n\n*"${wisdomQuote}"*\n\nPlease reflect on this message and consider how you can contribute positively to our community.`)
          .setTimestamp()
          .setFooter({ text: `From ${interaction.user.tag}` });

        await targetUser.send({ embeds: [dmEmbed] });
      } catch (error) {
        logger.warn(`Could not send warning DM to ${targetUser.tag}`);
      }

      // Send confirmation
      await interaction.editReply(`✅ Warning issued to ${targetUser.tag} with wisdom and guidance.`);

      logger.info(`Warning issued to ${targetUser.tag} by ${interaction.user.tag}`);

    } catch (error) {
      logger.error('Error in warn command:', error);
      await interaction.editReply('❌ An error occurred while issuing the warning. Please check the logs for details.');
    }
  },

  cooldown: 30 // 30 seconds cooldown
}; 