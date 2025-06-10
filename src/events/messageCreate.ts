import { Message, Events, TextChannel } from 'discord.js';
import { Event } from '../types/Event';
import { logger } from '../utils/logger';

// Simple spam detection
const userMessageCounts = new Map<string, number>();
const SPAM_THRESHOLD = 5; // messages
const SPAM_WINDOW = 5000; // 5 seconds

// Toxic words filter (basic example)
const toxicWords = [
  'hate', 'stupid', 'dumb', 'idiot', // Add more as needed
];

export const event: Event = {
  name: Events.MessageCreate,
  once: false,
  async execute(message: Message) {
    try {
      // Ignore bot messages
      if (message.author.bot) return;

      // Only process text channels
      if (!(message.channel instanceof TextChannel)) return;

      // Spam detection
      const userId = message.author.id;
      const currentTime = Date.now();
      const userMessages = userMessageCounts.get(userId) || 0;

      if (userMessages >= SPAM_THRESHOLD) {
        // Potential spam detected
        await message.delete();
        await message.channel.send({
          content: `${message.author}, please slow down your messages. 🌊`,
          allowedMentions: { users: [userId] }
        });
        logger.warn(`Spam detected from user ${message.author.tag} (${userId})`);
        return;
      }

      // Update message count
      userMessageCounts.set(userId, userMessages + 1);
      setTimeout(() => {
        const count = userMessageCounts.get(userId);
        if (count) userMessageCounts.set(userId, count - 1);
      }, SPAM_WINDOW);

      // Basic toxicity check
      const content = message.content.toLowerCase();
      if (toxicWords.some(word => content.includes(word))) {
        await message.delete();
        await message.channel.send({
          content: `${message.author}, let's keep the vibes positive! 💫`,
          allowedMentions: { users: [userId] }
        });
        logger.warn(`Toxic message detected from user ${message.author.tag} (${userId})`);
        return;
      }

      // TODO: Implement more advanced features:
      // - Message sentiment analysis
      // - Channel vibe tracking
      // - XP/leveling system
      // - Custom command handling
      // - AI-powered responses

    } catch (error) {
      logger.error('Error in messageCreate event:', error);
    }
  }
}; 