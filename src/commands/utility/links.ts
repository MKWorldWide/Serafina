import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BaseCommand } from '../core/commands/base-command';
import { config } from '../core/config';

export default class LinksCommand extends BaseCommand {
  constructor() {
    super();
    this.guildOnly = false; // Can be used in DMs
    this.cooldown = 5; // 5 second cooldown
  }

  protected initialize() {
    return new SlashCommandBuilder()
      .setName('links')
      .setDescription('Get important links related to the bot')
      .toJSON();
  }

  public async execute(interaction: any) {
    try {
      // Defer the reply to avoid the "interaction failed" error
      await interaction.deferReply();

      // Create the embed
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6) // Purple
        .setTitle('🔗 Useful Links')
        .setDescription(`Here are some useful links related to ${config.app.name}:`)
        .addFields(
          {
            name: '📥 Invite',
            value: 'Add me to your server!',
            inline: true,
          },
          {
            name: '❓ Support Server',
            value: 'Need help? Join our support server!',
            inline: true,
          },
          {
            name: '📚 Documentation',
            value: 'Learn how to use all my features!',
            inline: true,
          },
          {
            name: '⭐ Vote',
            value: 'Vote for me on top.gg!',
            inline: true,
          },
          {
            name: '💻 GitHub',
            value: 'View my source code!',
            inline: true,
          },
          {
            name: '📜 Terms of Service',
            value: 'Read the terms of service',
            inline: true,
          }
        )
        .setFooter({
          text: `${config.app.name} v${config.app.version}`,
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Create buttons
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Invite Me')
          .setURL('https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands')
          .setStyle(ButtonStyle.Link)
          .setEmoji('📥'),
        new ButtonBuilder()
          .setLabel('Support Server')
          .setURL('https://discord.gg/YOUR_INVITE_CODE')
          .setStyle(ButtonStyle.Link)
          .setEmoji('❓'),
        new ButtonBuilder()
          .setLabel('GitHub')
          .setURL('https://github.com/your-org/serafina-bot')
          .setStyle(ButtonStyle.Link)
          .setEmoji('💻'),
        new ButtonBuilder()
          .setLabel('Vote')
          .setURL('https://top.gg/bot/YOUR_BOT_ID/vote')
          .setStyle(ButtonStyle.Link)
          .setEmoji('⭐'),
        new ButtonBuilder()
          .setLabel('Documentation')
          .setURL('https://docs.your-bot.com')
          .setStyle(ButtonStyle.Link)
          .setEmoji('📚')
      );

      // Send the response
      await interaction.editReply({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      this.logger.error('Error executing links command:', error);
      
      // Try to send an error message to the user
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ 
          content: '❌ An error occurred while fetching the links.',
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: '❌ An error occurred while fetching the links.',
          ephemeral: true 
        });
      }
    }
  }
}
