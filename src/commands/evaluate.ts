import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { Command } from '../types/Command';
import { logger } from '../utils/logger';

const getRatingEmoji = (rating: string): string => {
  switch (rating) {
    case 'excellent':
      return '🌟 Excellent';
    case 'good':
      return '✨ Good';
    case 'average':
      return '⭐ Average';
    case 'needs_improvement':
      return '⚠️ Needs Improvement';
    default:
      return '❓ Unknown';
  }
};

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('evaluate')
    .setDescription('Evaluate a trial moderator\'s performance')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option
        .setName('moderator')
        .setDescription('The trial moderator to evaluate')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('activity')
        .setDescription('How active has the moderator been?')
        .setRequired(true)
        .addChoices(
          { name: '🌟 Excellent', value: 'excellent' },
          { name: '✨ Good', value: 'good' },
          { name: '⭐ Average', value: 'average' },
          { name: '⚠️ Needs Improvement', value: 'needs_improvement' }
        )
    )
    .addStringOption(option =>
      option
        .setName('communication')
        .setDescription('How well does the moderator communicate?')
        .setRequired(true)
        .addChoices(
          { name: '🌟 Excellent', value: 'excellent' },
          { name: '✨ Good', value: 'good' },
          { name: '⭐ Average', value: 'average' },
          { name: '⚠️ Needs Improvement', value: 'needs_improvement' }
        )
    )
    .addStringOption(option =>
      option
        .setName('decision_making')
        .setDescription('How well does the moderator make decisions?')
        .setRequired(true)
        .addChoices(
          { name: '🌟 Excellent', value: 'excellent' },
          { name: '✨ Good', value: 'good' },
          { name: '⭐ Average', value: 'average' },
          { name: '⚠️ Needs Improvement', value: 'needs_improvement' }
        )
    )
    .addStringOption(option =>
      option
        .setName('feedback')
        .setDescription('Detailed feedback for the trial moderator')
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

      const trialMod = interaction.options.getUser('moderator', true);
      const activity = interaction.options.getString('activity', true);
      const communication = interaction.options.getString('communication', true);
      const decisionMaking = interaction.options.getString('decision_making', true);
      const feedback = interaction.options.getString('feedback', true);

      const member = await guild.members.fetch(trialMod.id);
      const trialRole = guild.roles.cache.find(r => r.name === '🌟 Trial Seraph');

      if (!trialRole || !member.roles.cache.has(trialRole.id)) {
        await interaction.editReply('❌ This user is not a trial moderator.');
        return;
      }

      const modLogsChannel = guild.channels.cache.find(c => c.name === 'mod-logs');
      const trialModChannel = guild.channels.cache.find(c => c.name === 'trial-moderators');

      if (!modLogsChannel?.isTextBased() || !trialModChannel?.isTextBased()) {
        await interaction.editReply('❌ Required channels not found. Please run /setup first.');
        return;
      }

      // Create evaluation embed
      const evaluationEmbed = new EmbedBuilder()
        .setTitle('📊 Trial Moderator Evaluation')
        .setColor(0x9370DB)
        .setDescription(`Evaluation for ${trialMod.tag}`)
        .addFields(
          { name: '🎯 Activity', value: getRatingEmoji(activity), inline: true },
          { name: '💬 Communication', value: getRatingEmoji(communication), inline: true },
          { name: '⚖️ Decision Making', value: getRatingEmoji(decisionMaking), inline: true },
          { name: '📝 Feedback', value: feedback }
        )
        .setTimestamp()
        .setFooter({ text: `Evaluated by ${interaction.user.tag}` });

      // Send to mod logs
      await modLogsChannel.send({ embeds: [evaluationEmbed] });

      // Send to trial mod channel
      await trialModChannel.send({
        content: `${trialMod}`,
        embeds: [evaluationEmbed]
      });

      // Calculate overall rating
      const ratings = [activity, communication, decisionMaking];
      const needsImprovementCount = ratings.filter(r => r === 'needs_improvement').length;
      const excellentCount = ratings.filter(r => r === 'excellent').length;

      let recommendation = '';
      if (needsImprovementCount >= 2) {
        recommendation = '❌ Consider removing from trial position';
      } else if (excellentCount >= 2) {
        recommendation = '✅ Ready for promotion to full moderator';
      } else {
        recommendation = '⏳ Continue trial period';
      }

      await interaction.editReply(`✅ Evaluation submitted!\n\nRecommendation: ${recommendation}`);

      logger.info(`Trial moderator evaluation completed for ${trialMod.tag} by ${interaction.user.tag}`);

    } catch (error) {
      logger.error('Error in evaluate command:', error);
      await interaction.editReply('❌ An error occurred while evaluating the trial moderator. Please check the logs for details.');
    }
  },

  cooldown: 300 // 5 minutes cooldown
}; 