import { Client, Events, Guild } from 'discord.js';
import { BaseEvent } from '../core/events/base-event';

export default class GuildCreateEvent extends BaseEvent {
  public name = Events.GuildCreate;
  public once = false;

  public async execute(client: Client, guild: Guild) {
    try {
      // Log the guild join
      this.logEvent({
        guildId: guild.id,
        guildName: guild.name,
        memberCount: guild.memberCount,
        ownerId: guild.ownerId,
        region: guild.preferredLocale,
      });

      // Send a welcome message to the system channel or the first available channel
      const welcomeChannel = guild.systemChannel || guild.publicUpdatesChannel || guild.channels.cache.find(c => 
        c.isTextBased() && c.permissionsFor(guild.members.me!).has('SendMessages')
      );

      if (welcomeChannel?.isTextBased()) {
        try {
          await welcomeChannel.send({
            embeds: [{
              color: 0x7289DA, // Discord blurple
              title: `👋 Thanks for adding ${client.user?.username} to ${guild.name}!`,
              description: [
                `Hello! I'm ${client.user?.username}, a multipurpose Discord bot.`,
                '\n**Getting Started:**',
                '• Use `/help` to see all available commands',
                '• Use `/config` to configure the bot for your server',
                '• Join our [Support Server](https://discord.gg/your-invite) if you need help',
                '\n**Important Links:**',
                '• [Invite Link](https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands)',
                '• [Documentation](https://docs.your-bot.com)',
                '• [GitHub](https://github.com/your-org/serafina-bot)',
              ].join('\n'),
              footer: {
                text: `Use /help to get started! | ${client.user?.username} v${process.env.npm_package_version}`,
                icon_url: client.user?.displayAvatarURL(),
              },
              timestamp: new Date().toISOString(),
            }]
          });
        } catch (error) {
          this.logError(error as Error, { action: 'sendWelcomeMessage', guildId: guild.id });
        }
      }

      // Send a DM to the guild owner with setup instructions
      try {
        const owner = await guild.fetchOwner();
        if (owner) {
          await owner.send({
            embeds: [{
              color: 0x7289DA, // Discord blurple
              title: `👋 Thanks for adding ${client.user?.username} to ${guild.name}!`,
              description: [
                `Hello ${owner.user.username},`,
                `Thank you for adding me to **${guild.name}**!`,
                '\n**Getting Started:**',
                '1. Use `/config` to configure the bot for your server',
                '2. Check out `/help` to see all available commands',
                '3. Customize settings with `/config set`',
                '\n**Need Help?**',
                '• Join our [Support Server](https://discord.gg/your-invite)',
                '• Check out the [Documentation](https://docs.your-bot.com)',
                '• Review the [GitHub](https://github.com/your-org/serafina-bot) for source code and issues',
              ].join('\n'),
              footer: {
                text: `Thank you for using ${client.user?.username}!`,
                icon_url: client.user?.displayAvatarURL(),
              },
              timestamp: new Date().toISOString(),
            }]
          });
        }
      } catch (error) {
        // Couldn't send DM to owner (DMs might be disabled)
        this.logError(error as Error, { action: 'sendOwnerDM', guildId: guild.id, ownerId: guild.ownerId });
      }

      // Update the bot's presence to reflect the new guild count
      this.updatePresence(client);
    } catch (error) {
      this.logError(error as Error, { action: 'guildCreate', guildId: guild.id });
    }
  }

  /**
   * Update the bot's presence with the current guild count
   */
  private updatePresence(client: Client) {
    try {
      const guildCount = client.guilds.cache.size;
      client.user?.setPresence({
        activities: [{
          name: `${guildCount} servers`,
          type: 'WATCHING',
        }],
        status: 'online',
      });
    } catch (error) {
      this.logError(error as Error, { action: 'updatePresence' });
    }
  }
}
