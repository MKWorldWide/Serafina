import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';
import type { Command } from '../types/Command';
import { logger } from '../utils/logger';

const affirmations = [
  'May your gaming journey be filled with joy and victory! 🌟',
  "The Sovereign's light guides your path to greatness! ✨",
  'Your presence brings harmony to our community! 💫',
  'May your skills shine brighter than the stars! 🌠',
  'The divine energy flows through your gameplay! 🌈',
];

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('bless')
    .setDescription('Receive a divine blessing from the Sovereign')
    .addUserOption(option =>
      option.setName('target').setDescription('The user to bless (optional)').setRequired(false),
    )
    .toJSON(),

  async execute(interaction: CommandInteraction) {
    const chatInput = interaction as ChatInputCommandInteraction;
    const target = chatInput.options.getUser('target') || interaction.user;
    const blessing = affirmations[Math.floor(Math.random() * affirmations.length)];

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🌟 Divine Blessing 🌟')
      .setDescription(`${blessing}`)
      .addFields(
        { name: 'Blessed User', value: target.toString(), inline: true },
        { name: 'Blessed By', value: interaction.user.toString(), inline: true },
      )
      .setTimestamp()
      .setFooter({ text: 'GameDin - A Sacred Gaming Community' });

    await interaction.reply({ embeds: [embed] });
  },

  cooldown: 60, // 1 minute cooldown
};

export default command;
