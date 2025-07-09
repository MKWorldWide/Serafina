/**
 * 🎮 GameDin Discord Bot - Main Entry Point
 *
 * This is the main entry point for the GameDin Discord bot. It initializes the Discord client,
 * loads commands and events, sets up services, and handles all bot functionality.
 *
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { loadBotConfig } from './config/config';
import { logger } from './utils/logger';
import { sanitizeDiscordInput } from './utils/validation';
import { ServerManager } from './services/ServerManager';
import { AutoModerator } from './services/AutoModerator';
import { XPManager } from './services/XPManager';

// Load environment variables
dotenv.config();

// Load bot configuration
const config = loadBotConfig();

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

// Collections for commands and events
const commands = new Collection();
const events = new Collection();

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    commands.set(command.data.name, command);
    logger.info(`Loaded command: ${command.data.name}`);
  } else {
    logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Load events
const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event = require(filePath);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }

  logger.info(`Loaded event: ${event.name}`);
}

// Initialize services
let serverManager: ServerManager;
let autoModerator: AutoModerator;
let xpManager: XPManager;

// Ready event
client.once(Events.ClientReady, async () => {
  logger.info(`Logged in as ${client.user?.tag}`);

  try {
    // Initialize services
    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) {
      throw new Error(`Guild with ID ${config.guildId} not found`);
    }

    serverManager = new ServerManager(guild);
    autoModerator = new AutoModerator();
    xpManager = new XPManager();

    // Initialize server
    await serverManager.initializeServer();
    logger.info('Server initialization completed');
  } catch (error) {
    logger.error('Failed to initialize server:', error);
  }
});

// Interaction create event
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName) as any;

  if (!command) {
    logger.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    if (typeof command.execute === 'function') {
      await command.execute(interaction);
    } else {
      logger.error(`Command ${interaction.commandName} does not have an execute function.`);
    }
  } catch (error) {
    logger.error(`Error executing command ${interaction.commandName}:`, error);

    const errorMessage = 'There was an error while executing this command!';

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

// Message create event
client.on(Events.MessageCreate, async message => {
  // Ignore bot messages
  if (message.author.bot) return;

  try {
    // Sanitize message content
    const sanitizedContent = sanitizeDiscordInput(message.content);

    // Process with auto moderator
    if (autoModerator) {
      await autoModerator.handleMessage(message);
    }

    // Add XP for message
    if (xpManager && message.member) {
      await xpManager.handleMessage(message.member);
    }
  } catch (error) {
    logger.error('Error processing message:', error);
  }
});

// Guild member add event
client.on(Events.GuildMemberAdd, async member => {
  try {
    if (serverManager) {
      await serverManager.assignDefaultRole(member.id);
    }
  } catch (error) {
    logger.error('Error handling new member:', error);
  }
});

// Error handling
client.on(Events.Error, error => {
  logger.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Login to Discord
const token = process.env['DISCORD_TOKEN'];
if (!token) {
  logger.error('DISCORD_TOKEN is required');
  process.exit(1);
}

client.login(token).catch(error => {
  logger.error('Failed to login to Discord:', error);
  process.exit(1);
});
