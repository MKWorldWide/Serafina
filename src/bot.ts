/**
 * 🎮 GameDin Discord Bot - Serafina's Personality Core
 *
 * This is the main entry point for Serafina, the GameDin Discord bot,
 * now with enhanced personality and conversational abilities.
 *
 * @author NovaSanctum
 * @version 2.0.0
 * @since 2024-12-19
 */

import { Client, GatewayIntentBits, Collection, Events, Message } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { SerafinaPersonality } from './core/serafina-new';
import { SerafinaRouter } from './services/serafina-router';

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
const commands = new Collection<string, any>();
const events = new Collection<string, any>();

// Initialize Serafina's personality
const serafina = new SerafinaPersonality(client);

// Initialize Serafina's router service
const serafinaRouter = new SerafinaRouter(client);

// Simple logger
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  warn: (message: string) => console.log(`[WARN] ${message}`),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error || ''),
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
  try {
    if (interaction.isChatInputCommand()) {
      // Handle slash commands
      const command = commands.get(interaction.commandName);

      if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        // Execute the command with Serafina's personality
        if (typeof command.execute === 'function') {
          // Check if the command expects the serafina parameter
          if (command.execute.length > 1) {
            await command.execute(interaction, serafina);
          } else {
            await command.execute(interaction);
          }
        } else {
          logger.error(`Command ${interaction.commandName} does not have an execute function.`);
          await interaction.reply({
            content: "This command isn't working right now. Please try again later.",
            ephemeral: true
          });
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
    }
    // Add support for other interaction types here (buttons, select menus, etc.)
  } catch (error: any) {
    logger.error('Error in interaction handler:', error);
    
    if (interaction && 'isRepliable' in interaction && interaction.isRepliable()) {
      const errorMessage = 'There was an error while executing this command!';
      if ('replied' in interaction && 'deferred' in interaction) {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
          return;
        }
      }
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

// Message create event
client.on(Events.MessageCreate, async (message: Message) => {
  // Ignore bot messages and DMs
  if (message.author.bot || !message.guild) return;

  try {
    // Log the message
    logger.info(
      `Message from ${message.author.tag} in ${message.guild.name}: ${message.content.substring(0, 100)}`,
    );

    // Check if the bot is mentioned or the message is a reply to the bot
    const isMentioned = message.mentions.has(client.user!.id);
    const isReplyToBot = message.reference?.messageId && 
      message.mentions.repliedUser?.id === client.user?.id;

    // Only respond if it's a mention or a direct reply, but not both
    const shouldRespond = isMentioned || isReplyToBot;
    
    // If we should respond and it's a text-based channel
    if (shouldRespond && message.channel.isTextBased()) {
      // Only process if this is the first mention or reply (not both)
      if ((isMentioned && !isReplyToBot) || (!isMentioned && isReplyToBot) || 
          (isMentioned && isReplyToBot && message.mentions.users.size === 1)) {
        try {
          // Send a typing indicator if possible
          if ('sendTyping' in message.channel) {
            await (message.channel as any).sendTyping();
          }
          
          // Generate a response using Serafina's personality
          const response = await serafina.generateResponse(message);
          
          // Send the response with a mention if the original was a mention
          if (isMentioned) {
            await message.reply({
              content: response,
              allowedMentions: { repliedUser: true }
            });
          } else {
            await message.reply(response);
          }
        } catch (error) {
          logger.error('Error generating response:', error);
        }
      }
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
        content: `🌟 Welcome to GameDin, ${member}! We're excited to have you join our gaming community! 🎮`,
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

// Load commands from the commands directory
const loadCommands = async () => {
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
};

// Load event handlers from the events directory
const loadEvents = async () => {
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
};

// Start the bot
const startBot = async () => {
  try {
    // Load commands and events
    await loadCommands();
    await loadEvents();

    // Initialize router service
    serafinaRouter.initialize();

    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
    logger.info('Bot is online!');
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
};

// Login to Discord
const token = process.env['DISCORD_TOKEN'];
if (!token) {
  logger.error('DISCORD_TOKEN is required');
  process.exit(1);
}

startBot();

export { client, logger };
