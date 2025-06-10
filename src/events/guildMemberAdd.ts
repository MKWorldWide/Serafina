import { GuildMember, Events } from 'discord.js';
import { Event } from '../types/Event';
import { logger } from '../utils/logger';

const welcomeMessages = [
  "Welcome to the divine realm of GameDin, {user}! 🌟",
  "A new star has joined our constellation, {user}! ✨",
  "The Sovereign welcomes you, {user}! May your journey be blessed! 💫",
  "Another soul joins our sacred gaming community, {user}! 🎮",
  "The gates of GameDin open for you, {user}! 🌈"
];

export const event: Event = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember) {
    try {
      // Get a random welcome message
      const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
        .replace('{user}', member.toString());

      // Send welcome message to the default channel
      const defaultChannel = member.guild.systemChannel;
      if (defaultChannel) {
        await defaultChannel.send({
          content: message,
          allowedMentions: { users: [member.id] }
        });
      }

      // Log the new member
      logger.info(`New member joined: ${member.user.tag} (${member.id})`);

      // TODO: Assign default role
      // TODO: Send welcome DM with server rules and features
      // TODO: Add to database for tracking

    } catch (error) {
      logger.error('Error in guildMemberAdd event:', error);
    }
  }
}; 