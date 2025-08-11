import { Client, Events, ActivityType, type ActivityOptions } from 'discord.js';
import { BaseEvent } from '../core/events/base-event';
import { config } from '../core/config';

export default class ReadyEvent extends BaseEvent {
  public name = Events.ClientReady;
  public once = true;

  public async execute(client: Client) {
    if (!client.user || !client.application) {
      this.logError(new Error('Client user or application is not available'));
      return;
    }

    // Log bot information
    this.logEvent({
      tag: client.user.tag,
      id: client.user.id,
      guilds: client.guilds.cache.size,
      users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
      ping: client.ws.ping,
    });

    // Set initial presence
    await this.setPresence(client);

    // Log guild information
    this.logGuildInfo(client);

    // Log successful startup
    this.logger.info(`${client.user.tag} is now online and ready to serve!`);
  }

  /**
   * Set the bot's presence/status
   */
  private async setPresence(client: Client) {
    try {
      // Define activities with proper typing
      const activities = [
        { name: config.app.tagline, type: ActivityType.Playing },
        { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
        { name: 'Type /help', type: ActivityType.Listening },
      ] satisfies ActivityOptions[];

      // Set initial presence
      const activity = activities[Math.floor(Math.random() * activities.length)] as ActivityOptions;
      
      if (client.user) {
        await client.user.setPresence({
          activities: [activity],
          status: 'online',
        });

        this.logger.info(`Presence set to: ${activity.type} ${activity.name}`);
      }
    } catch (error) {
      this.logError(error as Error, { action: 'setPresence' });
    }
  }

  /**
   * Log information about the guilds the bot is in
   */
  private logGuildInfo(client: Client) {
    const guilds = client.guilds.cache;
    
    this.logger.info(`Connected to ${guilds.size} guilds:`);
    
    guilds.forEach((guild) => {
      this.logger.info(`- ${guild.name} (${guild.id}) | ${guild.memberCount} members`);
    });

    // Log guild count and member count totals
    const totalMembers = guilds.reduce((acc, guild) => acc + guild.memberCount, 0);
    this.logger.info(`Total members across all guilds: ${totalMembers}`);
  }
}
