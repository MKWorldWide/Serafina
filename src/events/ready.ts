import { Client, Events } from 'discord.js';
import { Event } from '../types/Event';
import { logger } from '../utils/logger';

export const event: Event = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    logger.info(`GameDin Bot is ready! Logged in as ${client.user?.tag}`);
    
    // Set bot status
    client.user?.setPresence({
      activities: [{
        name: '🎮 GameDin Community',
        type: 4 // Custom Status
      }],
      status: 'online'
    });

    // Log guild information
    const guilds = client.guilds.cache;
    logger.info(`Connected to ${guilds.size} guilds:`);
    guilds.forEach(guild => {
      logger.info(`- ${guild.name} (${guild.id})`);
    });
  }
}; 