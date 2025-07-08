import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../types/Command';
import { logger } from '../utils/logger';

/**
 * /ping Command - Health Check & Latency Test
 *
 * Feature Context:
 *   - Provides a simple way to check if the bot is online and responsive.
 *   - Useful for diagnostics, uptime monitoring, and user reassurance.
 *
 * Usage Example:
 *   - /ping
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
 *   - Responds with clear, readable text. No visual-only cues.
 */
export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if the bot is online and measure latency.')
    .toJSON(),

  /**
   * Executes the /ping command.
   * Replies with bot latency and API latency.
   * @param interaction Discord ChatInputCommandInteraction
   */
  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true, ephemeral: true });
    // Calculate round-trip latency
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    // API latency from Discord.js client
    const apiLatency = interaction.client.ws.ping;
    await interaction.editReply(`🏓 Pong! Latency: ${latency}ms | API Latency: ${apiLatency}ms`);
    logger.info(`/ping used by ${interaction.user.tag} (Latency: ${latency}ms, API: ${apiLatency}ms)`);
  },

  cooldown: 5, // 5 seconds cooldown to prevent spam
}; 