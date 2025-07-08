import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../types/Command';
import { logger } from '../utils/logger';

/**
 * /vibe Command - Send a random positive vibe or emoji
 *
 * Feature Context:
 *   - Boosts server morale and engagement with fun, positive responses.
 *   - Useful for icebreakers, mood-lifting, and community interaction.
 *
 * Usage Example:
 *   - /vibe
 *
 * Security Implications:
 *   - No sensitive data exposed. Rate-limited by default cooldown.
 *
 * Performance Considerations:
 *   - Lightweight, minimal processing.
 *
 * Changelog:
 *   - [v1.0.0] Initial implementation (2024-06-09)
 *
 * Accessibility:
 *   - Responds with clear, readable text and emoji. No visual-only cues.
 */
export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('vibe')
    .setDescription('Send a random positive vibe or emoji to the server!')
    .toJSON(),

  /**
   * Executes the /vibe command.
   * Replies with a random positive message or emoji.
   * @param interaction Discord ChatInputCommandInteraction
   */
  async execute(interaction: ChatInputCommandInteraction) {
    const vibes = [
      '🌈 Sending good vibes your way!',
      '✨ You are awesome!',
      '😎 Stay cool, gamer!',
      '💖 Spread the love!',
      '🔥 Keep the energy up!',
      '🎮 Game on!',
      '🌟 Shine bright!',
      '🦄 Unleash your magic!',
      '🚀 To the moon!',
      '🍀 Good luck, have fun!',
      '🥳 Party time!',
      '🙌 You got this!',
      '🧘‍♂️ Breathe in, vibe out.',
      '🎵 Let the music flow!',
      '🫶 Community strong!'
    ];
    const vibe = vibes[Math.floor(Math.random() * vibes.length)];
    await interaction.reply({ content: vibe, ephemeral: false });
    logger.info(`/vibe used by ${interaction.user.tag}: ${vibe}`);
  },

  cooldown: 5, // 5 seconds cooldown to prevent spam
}; 