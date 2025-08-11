import { SlashCommandBuilder, EmbedBuilder, version as djsVersion } from 'discord.js';
import { BaseCommand } from '../core/commands/base-command';
import { config } from '../core/config';
import os from 'os';

export default class StatusCommand extends BaseCommand {
  constructor() {
    super();
    this.guildOnly = false; // Can be used in DMs
    this.cooldown = 10; // 10 second cooldown
  }

  protected initialize() {
    return new SlashCommandBuilder()
      .setName('status')
      .setDescription('View the bot\'s current status and system information')
      .toJSON();
  }

  public async execute(interaction: any) {
    try {
      // Defer the reply to avoid the "interaction failed" error
      await interaction.deferReply();

      // Get system information
      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercentage = (usedMemory / totalMemory) * 100;

      // Get CPU information
      const cpus = os.cpus();
      const cpuModel = cpus[0]?.model || 'Unknown';
      const cpuCores = cpus.length;
      const cpuUsage = await this.getCpuUsage();

      // Get uptime
      const uptime = this.formatUptime(process.uptime());
      const systemUptime = this.formatUptime(os.uptime());

      // Get Discord.js and Node.js versions
      const nodeVersion = process.version;
      const discordJsVersion = djsVersion;

      // Get process information
      const processUptime = process.uptime();
      const processMemory = {
        rss: this.formatBytes(memoryUsage.rss),
        heapTotal: this.formatBytes(memoryUsage.heapTotal),
        heapUsed: this.formatBytes(memoryUsage.heapUsed),
        external: this.formatBytes(memoryUsage.external || 0),
        arrayBuffers: this.formatBytes(memoryUsage.arrayBuffers || 0),
      };

      // Get system information
      const platform = `${os.platform()} (${os.arch()})`;
      const systemMemory = {
        total: this.formatBytes(totalMemory),
        used: this.formatBytes(usedMemory),
        free: this.formatBytes(freeMemory),
        usage: `${memoryUsagePercentage.toFixed(2)}%`,
      };

      // Get bot statistics
      const guildCount = interaction.client.guilds.cache.size;
      const userCount = interaction.client.guilds.cache.reduce(
        (acc: number, guild: any) => acc + guild.memberCount,
        0
      );
      const channelCount = interaction.client.channels.cache.size;
      const ping = interaction.client.ws.ping;

      // Create the embed
      const embed = new EmbedBuilder()
        .setColor(0x3498db) // Blue
        .setTitle('📊 Bot Status & System Information')
        .setDescription(`Here's the current status of ${config.app.name}.`)
        .addFields(
          {
            name: '🖥️ System',
            value: `• **OS**: ${platform}\n` +
                   `• **CPU**: ${cpuModel} (${cpuCores} cores, ${cpuUsage.toFixed(2)}% usage)\n` +
                   `• **Uptime**: ${systemUptime}`,
            inline: false,
          },
          {
            name: '💾 Memory',
            value: `• **Total**: ${systemMemory.total}\n` +
                   `• **Used**: ${systemMemory.used} (${systemMemory.usage})\n` +
                   `• **Free**: ${systemMemory.free}`,
            inline: true,
          },
          {
            name: '📊 Process Memory',
            value: `• **RSS**: ${processMemory.rss}\n` +
                   `• **Heap Total**: ${processMemory.heapTotal}\n` +
                   `• **Heap Used**: ${processMemory.heapUsed}\n` +
                   `• **External**: ${processMemory.external}`,
            inline: true,
          },
          {
            name: '🤖 Bot',
            value: `• **Uptime**: ${uptime}\n` +
                   `• **Ping**: ${ping}ms\n` +
                   `• **Node.js**: ${nodeVersion}\n` +
                   `• **Discord.js**: v${discordJsVersion}`,
            inline: false,
          },
          {
            name: '🌐 Statistics',
            value: `• **Servers**: ${guildCount.toLocaleString()}\n` +
                   `• **Users**: ${userCount.toLocaleString()}\n` +
                   `• **Channels**: ${channelCount.toLocaleString()}`,
            inline: true,
          }
        )
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Send the response
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      this.logger.error('Error executing status command:', error);
      
      // Try to send an error message to the user
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ 
          content: '❌ An error occurred while fetching status information.',
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: '❌ An error occurred while fetching status information.',
          ephemeral: true 
        });
      }
    }
  }

  /**
   * Format bytes to a human-readable string
   */
  private formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  /**
   * Format the uptime in a human-readable format
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

  /**
   * Get the current CPU usage as a percentage
   */
  private async getCpuUsage(): Promise<number> {
    const startUsage = process.cpuUsage();
    const startTime = process.hrtime();

    // Wait for a short time to measure CPU usage
    await new Promise(resolve => setTimeout(resolve, 100));

    const endUsage = process.cpuUsage(startUsage);
    const endTime = process.hrtime(startTime);

    // Calculate the time difference in microseconds
    const timeDiff = (endTime[0] * 1e9 + endTime[1]) / 1000; // Convert to microseconds
    
    // Calculate the CPU usage percentage
    const cpuUsage = (endUsage.user + endUsage.system) / timeDiff * 100;
    
    return cpuUsage;
  }
}
