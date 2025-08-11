import { SlashCommandBuilder } from 'discord.js';
import { BaseCommand } from '../core/commands/base-command';

export default class PingCommand extends BaseCommand {
  constructor() {
    super();
    // Set command properties
    this.guildOnly = false; // Can be used in DMs
    this.cooldown = 5; // 5 second cooldown
  }

  protected initialize() {
    return new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Check the bot\'s latency and status')
      .toJSON();
  }

  public async execute(interaction: any) {
    try {
      // Defer the reply to avoid the "interaction failed" error
      await interaction.deferReply();

      // Calculate the latency
      const sent = await interaction.fetchReply();
      const latency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(interaction.client.ws.ping);

      // Create a nice embed response
      const embed = {
        color: 0x00ff00, // Green
        title: '🏓 Pong!',
        description: 'Here\'s my current status:',
        fields: [
          {
            name: '🔹 Bot Latency',
            value: `${latency}ms`,
            inline: true,
          },
          {
            name: '🌐 API Latency',
            value: `${apiLatency}ms`,
            inline: true,
          },
          {
            name: '🆙 Uptime',
            value: this.formatUptime(process.uptime()),
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: `Requested by ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL(),
        },
      };

      // Send the response
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      this.logger.error('Error executing ping command:', error);
      
      // Try to send an error message to the user
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ 
          content: '❌ An error occurred while processing your request.',
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: '❌ An error occurred while processing your request.',
          ephemeral: true 
        });
      }
    }
  }

  /**
   * Format the uptime in a human-readable format
   * @param seconds Uptime in seconds
   * @returns Formatted uptime string
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
