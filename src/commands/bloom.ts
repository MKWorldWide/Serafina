import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';
import type { Command } from '../types/Command';
import { logger } from '../utils/logger';

const emotions = {
  '🌸 Joy': { color: 0xffb6c1, emoji: '🌸' },
  '🌿 Peace': { color: 0x98fb98, emoji: '🌿' },
  '🌺 Love': { color: 0xff69b4, emoji: '🌺' },
  '🌼 Hope': { color: 0xffd700, emoji: '🌼' },
  '🌻 Growth': { color: 0xffa500, emoji: '🌻' },
  '🌹 Passion': { color: 0xff0000, emoji: '🌹' },
  '🌱 Renewal': { color: 0x90ee90, emoji: '🌱' },
  '🌷 Gratitude': { color: 0xda70d6, emoji: '🌷' },
};

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('bloom')
    .setDescription('Share your NeuroBloom garden moment')
    .addStringOption(option =>
      option
        .setName('emotion')
        .setDescription('The emotion you want to share')
        .setRequired(true)
        .addChoices(
          { name: '🌸 Joy', value: 'Joy' },
          { name: '🌿 Peace', value: 'Peace' },
          { name: '🌺 Love', value: 'Love' },
          { name: '🌼 Hope', value: 'Hope' },
          { name: '🌻 Growth', value: 'Growth' },
          { name: '🌹 Passion', value: 'Passion' },
          { name: '🌱 Renewal', value: 'Renewal' },
          { name: '🌷 Gratitude', value: 'Gratitude' },
        ),
    )
    .addStringOption(option =>
      option
        .setName('memory')
        .setDescription('Share a memory or thought (optional)')
        .setRequired(false),
    )
    .addStringOption(option =>
      option.setName('plant').setDescription('What plant bloomed? (optional)').setRequired(false),
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const emotion = interaction.options.getString('emotion', true);
      const memory = interaction.options.getString('memory');
      const plant = interaction.options.getString('plant');

      const emotionKey = Object.keys(emotions).find(key => key.includes(emotion));
      const emotionData = emotionKey
        ? emotions[emotionKey as keyof typeof emotions]
        : emotions['🌸 Joy'];

      const embed = new EmbedBuilder()
        .setColor(emotionData.color)
        .setTitle(`${emotionData.emoji} A New Bloom in the Garden ${emotionData.emoji}`)
        .setDescription(
          `**Emotion:** ${emotion}\n${memory ? `**Memory:** ${memory}\n` : ''}${plant ? `**Plant:** ${plant}` : ''}`,
        )
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp()
        .setFooter({ text: 'NeuroBloom Garden' });

      // Find the appropriate channel to post in
      const channel = interaction.guild?.channels.cache.find(
        c => c.name === 'coven-circle' || c.name === 'holy-quotes',
      );

      if (channel?.isTextBased()) {
        await channel.send({ embeds: [embed] });
        await interaction.editReply('🌸 Your bloom has been shared in the garden!');
      } else {
        await interaction.editReply(
          '❌ Could not find an appropriate channel to share your bloom.',
        );
      }

      logger.info(`Bloom shared by ${interaction.user.tag}: ${emotion}`);
    } catch (error) {
      logger.error('Error in bloom command:', error);
      await interaction.editReply(
        '❌ An error occurred while sharing your bloom. Please try again.',
      );
    }
  },

  cooldown: 60, // 1 minute cooldown
};
