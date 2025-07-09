import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';
import type { Command } from '../types/Command';
import { logger } from '../utils/logger';

const games = [
  { name: 'Fortnite', emoji: '🎮', maxPlayers: 4 },
  { name: 'Roblox', emoji: '🎲', maxPlayers: 8 },
  { name: 'Minecraft', emoji: '⛏️', maxPlayers: 10 },
  { name: 'Valorant', emoji: '🎯', maxPlayers: 5 },
  { name: 'League of Legends', emoji: '⚔️', maxPlayers: 5 },
];

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('match')
    .setDescription('Create or join a game party')
    .addStringOption(option =>
      option
        .setName('game')
        .setDescription('Select the game')
        .setRequired(true)
        .addChoices(
          ...games.map(game => ({ name: `${game.emoji} ${game.name}`, value: game.name })),
        ),
    )
    .addStringOption(option =>
      option.setName('mode').setDescription('Game mode (if applicable)').setRequired(false),
    )
    .toJSON(),

  async execute(interaction: CommandInteraction) {
    const chatInput = interaction as ChatInputCommandInteraction;
    const gameName = chatInput.options.getString('game', true);
    const gameMode = chatInput.options.getString('mode');
    const game = games.find(g => g.name === gameName);

    if (!game) {
      await interaction.reply({ content: '❌ Invalid game selection!', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle(`${game.emoji} ${game.name} Party`)
      .setDescription(
        `Looking for players to join the party!${gameMode ? `\nMode: ${gameMode}` : ''}`,
      )
      .addFields(
        { name: 'Party Leader', value: interaction.user.toString(), inline: true },
        { name: 'Players', value: `1/${game.maxPlayers}`, inline: true },
        { name: 'Status', value: '🟢 Open', inline: true },
      )
      .setTimestamp()
      .setFooter({ text: 'GameDin - A Sacred Gaming Community' });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('join_party')
        .setLabel('Join Party')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('leave_party')
        .setLabel('Leave Party')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('➖'),
      new ButtonBuilder()
        .setCustomId('start_game')
        .setLabel('Start Game')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('▶️'),
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },

  cooldown: 30, // 30 seconds cooldown
};

export default command;
