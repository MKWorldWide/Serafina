import { Client, GatewayIntentBits, Collection, Events, MessageReaction, User, GuildMember, PartialMessageReaction, PartialUser } from 'discord.js';
import { config } from 'dotenv';
import { join } from 'path';
import { readdirSync } from 'fs';
import { logger } from './utils/logger';
import { Command } from './types/Command';
import { Event } from './types/Event';
import { ServerManager } from './services/ServerManager';
import { AutoModerator } from './services/AutoModerator';
import { XPManager } from './services/XPManager';
import { SERVER_CONFIG } from './config/serverConfig';

// Load environment variables
config();

// Create Discord client with all necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ],
});

// Extend client with custom properties
declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, Command>;
    cooldowns: Collection<string, Collection<string, number>>;
  }
}

client.commands = new Collection<string, Command>();
client.cooldowns = new Collection<string, Collection<string, number>>();

// Initialize services
let serverManager: ServerManager;
let autoModerator: AutoModerator;
let xpManager: XPManager;

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  let commandExport;
  try {
    commandExport = require(filePath);
  } catch (e) {
    logger.warn(`Failed to require ${filePath}: ${e}`);
    continue;
  }
  const command = commandExport?.command;
  if (command && 'data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    logger.info(`Loaded command: ${command.data.name}`);
  } else {
    logger.warn(`Command at ${filePath} is missing required properties or is undefined`);
  }
}

// Load events
const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event = require(filePath).event as Event;
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  
  logger.info(`Loaded event: ${event.name}`);
}

// Bot ready event
client.once(Events.ClientReady, async () => {
  logger.info(`🚀 ${client.user?.tag} is ready!`);
  
  // Initialize services
  autoModerator = new AutoModerator();
  xpManager = new XPManager();
  
  // Initialize server management for all guilds
  for (const guild of client.guilds.cache.values()) {
    try {
      serverManager = new ServerManager(guild);
      await serverManager.initializeServer();
      logger.info(`✅ Server initialized: ${guild.name}`);
    } catch (error) {
      logger.error(`❌ Failed to initialize server ${guild.name}:`, error);
    }
  }
});

// Handle interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    logger.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
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

// Handle messages for auto-moderation and XP
client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild) return;

  try {
    // Auto-moderation
    if (autoModerator) {
      await autoModerator.handleMessage(message);
    }
    
    // XP system
    if (xpManager) {
      await xpManager.handleMessage(message.member!);
    }
  } catch (error) {
    logger.error('Error handling message:', error);
  }
});

// Handle voice state updates for XP
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (!xpManager) return;
  
  try {
    // User joined voice channel
    if (!oldState.channelId && newState.channelId) {
      await xpManager.handleVoiceJoin(newState.member!, newState.channelId);
    }
    
    // User left voice channel
    if (oldState.channelId && !newState.channelId) {
      await xpManager.handleVoiceLeave(oldState.member!);
    }
  } catch (error) {
    logger.error('Error handling voice state update:', error);
  }
});

// Handle reaction events for role selection
client.on(Events.MessageReactionAdd, async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
  if (user.bot || !reaction.message.guild) return;
  
  try {
    const message = reaction.message;
    const guild = message.guild;
    if (!guild) return;
    
    const member = await guild.members.fetch(user.id);
    const roleSelectChannel = guild.channels.cache.find(c => c.name === 'role-select');
    
    if (message.channelId === roleSelectChannel?.id) {
      let roleName = '';
      
      switch (reaction.emoji.name) {
        case '🎮':
          roleName = '🎮 Gamer';
          break;
        case '🎨':
          roleName = '🎨 Creator';
          break;
        default:
          return;
      }

      const role = guild.roles.cache.find(r => r.name === roleName);
      if (role && !member.roles.cache.has(role.id)) {
        await member.roles.add(role);
        logger.info(`Role ${roleName} added to ${member.user.tag}`);
      }
    }
  } catch (error) {
    logger.error('Error handling reaction add:', error);
  }
});

client.on(Events.MessageReactionRemove, async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
  if (user.bot || !reaction.message.guild) return;
  
  try {
    const message = reaction.message;
    const guild = message.guild;
    if (!guild) return;
    
    const member = await guild.members.fetch(user.id);
    const roleSelectChannel = guild.channels.cache.find(c => c.name === 'role-select');
    
    if (message.channelId === roleSelectChannel?.id) {
      let roleName = '';
      
      switch (reaction.emoji.name) {
        case '🎮':
          roleName = '🎮 Gamer';
          break;
        case '🎨':
          roleName = '🎨 Creator';
          break;
        default:
          return;
      }

      const role = guild.roles.cache.find(r => r.name === roleName);
      if (role && member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        logger.info(`Role ${roleName} removed from ${member.user.tag}`);
      }
    }
  } catch (error) {
    logger.error('Error handling reaction remove:', error);
  }
});

// Handle guild member add for welcome messages
client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
  try {
    // Assign default role
    const memberRole = member.guild.roles.cache.find(r => r.name === '💫 Member');
    if (memberRole) {
      await member.roles.add(memberRole);
    }

    // Send welcome message
    const welcomeChannel = member.guild.channels.cache.find(c => c.name === 'welcome') as any;
    if (welcomeChannel && serverManager) {
      const welcomeMessage = await serverManager.getWelcomeMessage();
      const formattedMessage = welcomeMessage.replace('{user}', member.user.toString());
      
      await welcomeChannel.send(formattedMessage);
    }

    logger.info(`New member joined: ${member.user.tag}`);
  } catch (error) {
    logger.error('Error handling guild member add:', error);
  }
});

// Error handling
client.on(Events.Error, error => {
  logger.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  logger.error('Unhandled promise rejection:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down bot...');
  client.destroy();
  process.exit(0);
});

// Login
const token = process.env.DISCORD_TOKEN;
if (!token) {
  logger.error('DISCORD_TOKEN environment variable is required!');
  process.exit(1);
}

client.login(token).catch(error => {
  logger.error('Failed to login:', error);
  process.exit(1);
});

export { client, autoModerator, xpManager, serverManager }; 