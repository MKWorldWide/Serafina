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

import { Client, GatewayIntentBits, Collection, Events, MessageReaction, User, GuildMember, PartialMessageReaction, PartialUser } from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import { logger } from './utils/logger';
import { Command } from './types/Command';
import { Event } from './types/Event';
import { ServerManager } from './services/ServerManager';
import { AutoModerator } from './services/AutoModerator';
import { XPManager } from './services/XPManager';
import { SERVER_CONFIG } from './config/serverConfig';
import { BotError, ErrorCode } from './types/Bot';
import { sanitizeDiscordInput } from './utils/validation';

// Load environment variables
require('dotenv').config();

// ============================================================================
// BOT INITIALIZATION
// ============================================================================

/**
 * Main bot class that handles all Discord.js functionality
 * Provides a clean interface for bot operations and error handling
 */
class GameDinBot {
  private client: Client;
  private commands: Collection<string, Command>;
  private cooldowns: Collection<string, Collection<string, number>>;
  private serverManager?: ServerManager;
  private autoModerator?: AutoModerator;
  private xpManager?: XPManager;
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
    this.commands = new Collection<string, Command>();
    this.cooldowns = new Collection<string, Collection<string, number>>();

    // Create Discord client with all necessary intents
    this.client = new Client({
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
    (this.client as any).commands = this.commands;
    (this.client as any).cooldowns = this.cooldowns;
  }

  /**
   * Initialize the bot and all its components
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing GameDin Discord Bot...');

      // Validate environment variables
      this.validateEnvironment();

      // Load commands and events
      await this.loadCommands();
      await this.loadEvents();

      // Set up event handlers
      this.setupEventHandlers();

      // Initialize services
      await this.initializeServices();

      logger.info('✅ Bot initialization completed successfully');
    } catch (error) {
      logger.error('❌ Bot initialization failed:', error);
      throw error;
    }
  }

  /**
   * Validate required environment variables
   * @throws BotError if required variables are missing
   */
  private validateEnvironment(): void {
    const requiredVars = ['DISCORD_TOKEN'];
    const missing: string[] = [];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }

    if (missing.length > 0) {
      throw new BotError(
        `Missing required environment variables: ${missing.join(', ')}`,
        ErrorCode.CONFIG_MISSING_TOKEN,
        { missingVariables: missing },
        'Please check your .env file and ensure all required variables are set.',
        false
      );
    }
  }

  /**
   * Load all slash commands from the commands directory
   * @returns Promise that resolves when commands are loaded
   */
  private async loadCommands(): Promise<void> {
    try {
      const commandsPath = join(__dirname, 'commands');
      const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

      logger.info(`📁 Loading ${commandFiles.length} commands...`);

      for (const file of commandFiles) {
        try {
          const filePath = join(commandsPath, file);
          const commandExport = require(filePath);
          const command = commandExport?.command;

          if (command && 'data' in command && 'execute' in command) {
            this.commands.set(command.data.name, command);
            logger.info(`✅ Loaded command: ${command.data.name}`);
          } else {
            logger.warn(`⚠️ Command at ${filePath} is missing required properties`);
          }
        } catch (error) {
          logger.error(`❌ Failed to load command ${file}:`, error);
        }
      }

      logger.info(`✅ Successfully loaded ${this.commands.size} commands`);
    } catch (error) {
      logger.error('❌ Failed to load commands:', error);
      throw new BotError(
        'Failed to load commands',
        ErrorCode.COMMAND_NOT_FOUND,
        { error },
        'Please check the commands directory and file structure.',
        true
      );
    }
  }

  /**
   * Load all event handlers from the events directory
   * @returns Promise that resolves when events are loaded
   */
  private async loadEvents(): Promise<void> {
    try {
      const eventsPath = join(__dirname, 'events');
      const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

      logger.info(`📁 Loading ${eventFiles.length} events...`);

      for (const file of eventFiles) {
        try {
          const filePath = join(eventsPath, file);
          const event = require(filePath).event as Event;
          
          if (event.once) {
            this.client.once(event.name, (...args) => event.execute(...args));
          } else {
            this.client.on(event.name, (...args) => event.execute(...args));
          }
          
          logger.info(`✅ Loaded event: ${event.name}`);
        } catch (error) {
          logger.error(`❌ Failed to load event ${file}:`, error);
        }
      }

      logger.info(`✅ Successfully loaded ${eventFiles.length} events`);
    } catch (error) {
      logger.error('❌ Failed to load events:', error);
      throw new BotError(
        'Failed to load events',
        ErrorCode.SYSTEM_UNKNOWN_ERROR,
        { error },
        'Please check the events directory and file structure.',
        true
      );
    }
  }

  /**
   * Set up custom event handlers for bot functionality
   */
  private setupEventHandlers(): void {
    // Bot ready event
    this.client.once(Events.ClientReady, async () => {
      logger.info(`🚀 ${this.client.user?.tag} is ready!`);
      
      // Initialize services for all guilds
      await this.initializeServicesForGuilds();
    });

    // Handle interactions
    this.client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isChatInputCommand()) return;

      await this.handleCommandInteraction(interaction);
    });

    // Handle messages for auto-moderation and XP
    this.client.on(Events.MessageCreate, async message => {
      if (message.author.bot || !message.guild) return;

      await this.handleMessage(message);
    });

    // Handle voice state updates for XP
    this.client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
      await this.handleVoiceStateUpdate(oldState, newState);
    });

    // Handle reaction events for role selection
    this.client.on(Events.MessageReactionAdd, async (reaction, user) => {
      await this.handleReactionAdd(reaction, user);
    });

    this.client.on(Events.MessageReactionRemove, async (reaction, user) => {
      await this.handleReactionRemove(reaction, user);
    });

    // Handle guild member add for welcome messages
    this.client.on(Events.GuildMemberAdd, async (member) => {
      await this.handleGuildMemberAdd(member);
    });

    // Error handling
    this.client.on(Events.Error, error => {
      logger.error('Discord client error:', error);
    });
  }

  /**
   * Initialize services for all guilds
   * @returns Promise that resolves when services are initialized
   */
  private async initializeServicesForGuilds(): Promise<void> {
    for (const guild of this.client.guilds.cache.values()) {
      try {
        this.serverManager = new ServerManager(guild);
        await this.serverManager.initializeServer();
        logger.info(`✅ Server initialized: ${guild.name}`);
      } catch (error) {
        logger.error(`❌ Failed to initialize server ${guild.name}:`, error);
      }
    }
  }

  /**
   * Initialize bot services
   * @returns Promise that resolves when services are initialized
   */
  private async initializeServices(): Promise<void> {
    try {
      this.autoModerator = new AutoModerator();
      this.xpManager = new XPManager();
      logger.info('✅ Services initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize services:', error);
      throw new BotError(
        'Failed to initialize services',
        ErrorCode.SERVICE_INITIALIZATION_FAILED,
        { error },
        'Please check service configuration and dependencies.',
        true
      );
    }
  }

  /**
   * Handle command interactions with error handling and validation
   * @param interaction - Discord interaction to handle
   */
  private async handleCommandInteraction(interaction: any): Promise<void> {
    const command = this.commands.get(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      // Check cooldown
      if (command.cooldown) {
        const cooldownKey = `${interaction.user.id}-${interaction.commandName}`;
        const now = Date.now();
        const timestamps = this.cooldowns.get(interaction.commandName) || new Collection();
        const cooldownAmount = command.cooldown * 1000;

        if (timestamps.has(cooldownKey)) {
          const expirationTime = timestamps.get(cooldownKey)! + cooldownAmount;
          if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            await interaction.reply({
              content: `⏰ Please wait ${timeLeft.toFixed(1)} more seconds before using this command again.`,
              ephemeral: true
            });
            return;
          }
        }

        timestamps.set(cooldownKey, now);
        setTimeout(() => timestamps.delete(cooldownKey), cooldownAmount);
        this.cooldowns.set(interaction.commandName, timestamps);
      }

      // Execute command
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Error executing command ${interaction.commandName}:`, error);
      
      const errorMessage = error instanceof BotError 
        ? error.toUserMessage()
        : 'There was an error while executing this command!';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }

  /**
   * Handle incoming messages for moderation and XP
   * @param message - Discord message to handle
   */
  private async handleMessage(message: any): Promise<void> {
    try {
      // Sanitize message content
      const sanitizedContent = sanitizeDiscordInput(message.content);

      // Auto-moderation
      if (this.autoModerator) {
        await this.autoModerator.handleMessage(message);
      }
      
      // XP system
      if (this.xpManager) {
        await this.xpManager.handleMessage(message.member);
      }
    } catch (error) {
      logger.error('Error handling message:', error);
    }
  }

  /**
   * Handle voice state updates for XP tracking
   * @param oldState - Previous voice state
   * @param newState - New voice state
   */
  private async handleVoiceStateUpdate(oldState: any, newState: any): Promise<void> {
    if (!this.xpManager) return;
    
    try {
      // User joined voice channel
      if (!oldState.channelId && newState.channelId) {
        await this.xpManager.handleVoiceJoin(newState.member, newState.channelId);
      }
      
      // User left voice channel
      if (oldState.channelId && !newState.channelId) {
        await this.xpManager.handleVoiceLeave(oldState.member);
      }
    } catch (error) {
      logger.error('Error handling voice state update:', error);
    }
  }

  /**
   * Handle reaction add events for role selection
   * @param reaction - Discord reaction
   * @param user - User who added the reaction
   */
  private async handleReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser): Promise<void> {
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
  }

  /**
   * Handle reaction remove events for role selection
   * @param reaction - Discord reaction
   * @param user - User who removed the reaction
   */
  private async handleReactionRemove(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser): Promise<void> {
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
  }

  /**
   * Handle new guild member joins
   * @param member - New guild member
   */
  private async handleGuildMemberAdd(member: GuildMember): Promise<void> {
    try {
      // Assign default role
      const memberRole = member.guild.roles.cache.find(r => r.name === '💫 Member');
      if (memberRole) {
        await member.roles.add(memberRole);
      }

      // Send welcome message
      const welcomeChannel = member.guild.channels.cache.find(c => c.name === 'welcome') as any;
      if (welcomeChannel && this.serverManager) {
        const welcomeMessage = await this.serverManager.getWelcomeMessage();
        const formattedMessage = welcomeMessage.replace('{user}', member.user.toString());
        
        await welcomeChannel.send(formattedMessage);
      }

      logger.info(`New member joined: ${member.user.tag}`);
    } catch (error) {
      logger.error('Error handling guild member add:', error);
    }
  }

  /**
   * Start the bot and connect to Discord
   * @returns Promise that resolves when bot is connected
   */
  async start(): Promise<void> {
    try {
      const token = process.env.DISCORD_TOKEN;
      if (!token) {
        throw new BotError(
          'DISCORD_TOKEN environment variable is required!',
          ErrorCode.CONFIG_MISSING_TOKEN,
          {},
          'Please set the DISCORD_TOKEN environment variable.',
          false
        );
      }

      await this.client.login(token);
      logger.info('🎉 Bot started successfully!');
    } catch (error) {
      logger.error('Failed to start bot:', error);
      throw error;
    }
  }

  /**
   * Gracefully shutdown the bot
   * @returns Promise that resolves when shutdown is complete
   */
  async shutdown(): Promise<void> {
    try {
      logger.info('🛑 Shutting down bot...');
      this.client.destroy();
      logger.info('✅ Bot shutdown completed');
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
    }
  }

  /**
   * Get bot statistics
   * @returns Bot statistics object
   */
  getStats() {
    const uptime = Date.now() - this.startTime.getTime();
    return {
      uptime,
      commandsLoaded: this.commands.size,
      guilds: this.client.guilds.cache.size,
      users: this.client.users.cache.size,
      startTime: this.startTime
    };
  }
}

// ============================================================================
// APPLICATION STARTUP
// ============================================================================

/**
 * Main application startup function
 * Handles bot initialization and error handling
 */
async function main(): Promise<void> {
  const bot = new GameDinBot();

  try {
    // Initialize bot
    await bot.initialize();

    // Start bot
    await bot.start();

    // Set up graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await bot.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await bot.shutdown();
      process.exit(0);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled promise rejection:', error);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  main().catch(error => {
    logger.error('❌ Application startup failed:', error);
    process.exit(1);
  });
}

// Export bot class for testing
export { GameDinBot }; 