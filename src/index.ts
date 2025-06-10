import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { join } from 'path';
import { readdirSync } from 'fs';
import { logger } from './utils/logger';
import { Command } from './types/Command';
import { Event } from './types/Event';

// Load environment variables
config();

// Initialize Discord client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Initialize collections
client.commands = new Collection<string, Command>();
client.cooldowns = new Collection<string, Collection<string, number>>();

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    logger.info(`Loaded command: ${command.data.name}`);
  } else {
    logger.warn(`The command at ${filePath} is missing required properties`);
  }
}

// Load events
const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event: Event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  
  logger.info(`Loaded event: ${event.name}`);
}

// Error handling
process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    logger.info('GameDin Bot is now online! 🌟');
  })
  .catch((error) => {
    logger.error('Error logging in:', error);
    process.exit(1);
  }); 