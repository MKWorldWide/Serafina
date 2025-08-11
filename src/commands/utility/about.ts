import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BaseCommand } from '../core/commands/base-command';
import { config } from '../core/config';

export default class AboutCommand extends BaseCommand {
  constructor() {
    super();
    this.guildOnly = false; // Can be used in DMs
    this.cooldown = 10; // 10 second cooldown
  }

  protected initialize() {
    return new SlashCommandBuilder()
      .setName('about')
      .setDescription('Learn more about the bot and its features')
      .toJSON();
  }

  public async execute(interaction: any) {
    try {
      // Defer the reply to avoid the "interaction failed" error
      await interaction.deferReply();

      // Get the bot user
      const clientUser = interaction.client.user;
      
      // Calculate uptime
      const uptime = this.formatUptime(process.uptime());
      
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const usedMemory = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const totalMemory = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      
      // Create the embed
      const embed = new EmbedBuilder()
        .setColor(0x6f00ff) // Purple
        .setTitle(`🤖 ${config.app.name} - ${config.app.tagline}`)
        .setDescription(config.app.description)
        .setThumbnail(clientUser.displayAvatarURL())
        .addFields(
          {
            name: '📊 Stats',
            value: `• **Servers**: ${interaction.client.guilds.cache.size}\n` +
                   `• **Users**: ${interaction.client.guilds.cache.reduce((a: number, g: any) => a + g.memberCount, 0).toLocaleString()}\n` +
                   `• **Uptime**: ${uptime}\n` +
                   `• **Memory**: ${usedMemory}MB / ${totalMemory}MB`,
            inline: true,
          },
          {
            name: '🔧 Technical',
            value: `• **Node.js**: ${process.version}\n` +
                   `• **Discord.js**: v${require('discord.js').version}\n` +
                   `• **Shard**: ${interaction.guild?.shardId ?? 0}/${interaction.client.shard?.count ?? 1}\n` +
                   `• **Ping**: ${interaction.client.ws.ping}ms`,
            inline: true,
          },
          {
            name: '📅 Created',
            value: `<t:${Math.floor(clientUser.createdTimestamp / 1000)}:R>`,
            inline: true,
          },
          {
            name: '🔗 Links',
            value: '• [GitHub Repository](https://github.com/your-org/serafina-bot)\n' +
                   '• [Support Server](https://discord.gg/your-invite)\n' +
                   '• [Documentation](https://docs.your-bot.com)'
          }
        )
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Create buttons
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Invite to Server')
            .setURL('https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands')
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel('GitHub')
            .setURL('https://github.com/your-org/serafina-bot')
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel('Support Server')
            .setURL('https://discord.gg/your-invite')
            .setStyle(ButtonStyle.Link)
        );

      // Send the response
      await interaction.editReply({ 
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      this.logger.error('Error executing about command:', error);
      
      // Try to send an error message to the user
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ 
          content: '❌ An error occurred while fetching bot information.',
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: '❌ An error occurred while fetching bot information.',
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
