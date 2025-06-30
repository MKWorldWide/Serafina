/**
 * 🎮 GameDin Discord Bot - Simplified Entry Point
 * 
 * This is a simplified version of the Discord bot that excludes web app dependencies
 * and focuses only on Discord bot functionality.
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// Simple logger
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  warn: (message: string) => console.log(`[WARN] ${message}`),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error || '')
};

// Load commands
const commandsPath = join(__dirname, 'commands');
try {
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
} catch (error) {
  logger.warn('No commands directory found or error loading commands');
}

// Load events
const eventsPath = join(__dirname, 'events');
try {
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
} catch (error) {
  logger.warn('No events directory found or error loading events');
}

// Ready event
client.once(Events.ClientReady, async () => {
  logger.info(`Logged in as ${client.user?.tag}`);
  logger.info(`Bot is ready! Serving ${client.guilds.cache.size} guilds`);
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
    // Simple message logging
    logger.info(`Message from ${message.author.tag} in ${message.guild?.name}: ${message.content.substring(0, 50)}...`);
    
    // Add XP for message (simple implementation)
    if (message.member) {
      // TODO: Implement XP system
      logger.info(`XP added for ${message.member.user.tag}`);
    }
    
  } catch (error) {
    logger.error('Error processing message:', error);
  }
});

// Guild member add event
client.on(Events.GuildMemberAdd, async member => {
  try {
    logger.info(`New member joined: ${member.user.tag} in ${member.guild.name}`);
    
    // Send welcome message
    const welcomeChannel = member.guild.channels.cache.find(c => c.name === 'welcome');
    if (welcomeChannel && welcomeChannel.isTextBased()) {
      await welcomeChannel.send({
        content: `🌟 Welcome to GameDin, ${member}! We're excited to have you join our gaming community! 🎮`
      });
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
  logger.error('Failed to login:', error);
  process.exit(1);
});

export { client, logger }; 