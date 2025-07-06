/**
 * 🎮 GameDin Discord Bot - Comprehensive Entry Point
 * 
 * This is the comprehensive Discord bot that uses the new dynamic command/event
 * loading system, AI management, and enhanced features.
 * 
 * Features:
 * - Dynamic command and event loading
 * - Multi-provider AI support (OpenAI, Mistral, AthenaMist)
 * - Comprehensive logging and error handling
 * - TypeScript interfaces for type safety
 * - Quantum documentation and usage tracking
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { Client, GatewayIntentBits, Events, ChatInputCommandInteraction, Message } from 'discord.js';
import { CommandManager, SlashCommand, PrefixCommand } from './core/CommandManager';
import { EventManager, BotEvent } from './core/EventManager';
import { AIManager, AIManagerConfig } from './core/ai/AIManager';
import { Logger, LogLevel } from './core/Logger';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Main Discord bot class
 */
class GameDinBot {
  private client: Client;
  private commandManager: CommandManager;
  private eventManager: EventManager;
  private aiManager: AIManager;
  private logger: Logger;
  private isReady: boolean = false;

  constructor() {
    // Initialize logger
    this.logger = new Logger('GameDinBot', LogLevel.INFO);
    
    // Create Discord client
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
      ],
    });

    // Initialize command manager
    this.commandManager = new CommandManager('!', this.logger.child('CommandManager'));

    // Initialize event manager
    this.eventManager = new EventManager(this.client, this.logger.child('EventManager'));

    // Initialize AI manager
    const aiConfig: AIManagerConfig = {
      openaiKey: process.env.OPENAI_API_KEY,
      mistralKey: process.env.MISTRAL_API_KEY,
      athenaMistKey: process.env.ATHENAMIST_API_KEY,
      enableFallback: true,
      maxRetries: 3,
      retryDelay: 1000,
      costLimit: 100
    };
    this.aiManager = new AIManager(aiConfig, this.logger.child('AIManager'));

    this.setupEventHandlers();
  }

  /**
   * Setup Discord event handlers
   */
  private setupEventHandlers(): void {
    // Ready event
    this.client.once(Events.ClientReady, async () => {
      this.logger.info(`Logged in as ${this.client.user?.tag}`);
      this.logger.info(`Bot is ready! Serving ${this.client.guilds.cache.size} guilds`);
      this.isReady = true;
      
      // Perform initial health check
      await this.aiManager.performHealthCheck();
    });

    // Interaction create event (slash commands)
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      
      try {
        await this.commandManager.handleSlashCommand(interaction);
      } catch (error) {
        this.logger.error('Error handling slash command:', error);
        
        const errorMessage = '❌ There was an error while executing this command!';
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      }
    });

    // Message create event (prefix commands)
    this.client.on(Events.MessageCreate, async (message) => {
      // Ignore bot messages
      if (message.author.bot) return;
      
      try {
        await this.commandManager.handlePrefixCommand(message);
      } catch (error) {
        this.logger.error('Error handling prefix command:', error);
      }
    });

    // Error handling
    this.client.on(Events.Error, (error) => {
      this.logger.error('Discord client error:', error);
    });

    // Guild member add event
    this.client.on(Events.GuildMemberAdd, async (member) => {
      try {
        this.logger.info(`New member joined: ${member.user.tag} in ${member.guild.name}`);
        
        // Send welcome message
        const welcomeChannel = member.guild.channels.cache.find(c => c.name === 'welcome');
        if (welcomeChannel && welcomeChannel.isTextBased()) {
          await welcomeChannel.send({
            content: `🌟 Welcome to GameDin, ${member}! We're excited to have you join our gaming community! 🎮`
          });
        }
      } catch (error) {
        this.logger.error('Error handling new member:', error);
      }
    });
  }

  /**
   * Initialize the bot
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing GameDin Discord Bot...');
      
      // Load commands
      const commandsPath = join(__dirname, 'commands');
      await this.commandManager.loadCommands(commandsPath);
      
      // Load events
      const eventsPath = join(__dirname, 'events');
      await this.eventManager.loadEvents(eventsPath);
      
      // Register events with Discord client
      this.eventManager.registerEvents();
      
      this.logger.info('Bot initialization completed successfully');
    } catch (error) {
      this.logger.error('Error initializing bot:', error);
      throw error;
    }
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    try {
      // Initialize bot
      await this.initialize();
      
      // Login to Discord
      const token = process.env.DISCORD_TOKEN;
      if (!token) {
        throw new Error('DISCORD_TOKEN is required');
      }
      
      await this.client.login(token);
      
      this.logger.info('Bot started successfully');
    } catch (error) {
      this.logger.error('Error starting bot:', error);
      throw error;
    }
  }

  /**
   * Stop the bot
   */
  async stop(): Promise<void> {
    try {
      this.logger.info('Stopping bot...');
      
      if (this.client) {
        this.client.destroy();
      }
      
      this.logger.info('Bot stopped successfully');
    } catch (error) {
      this.logger.error('Error stopping bot:', error);
      throw error;
    }
  }

  /**
   * Get bot statistics
   */
  getStats(): {
    isReady: boolean;
    guildCount: number;
    commandStats: any;
    eventStats: any;
    aiStats: any;
  } {
    return {
      isReady: this.isReady,
      guildCount: this.client.guilds.cache.size,
      commandStats: this.commandManager.getStats(),
      eventStats: this.eventManager.getOverallStats(),
      aiStats: this.aiManager.getStats()
    };
  }

  /**
   * Get command manager
   */
  getCommandManager(): CommandManager {
    return this.commandManager;
  }

  /**
   * Get event manager
   */
  getEventManager(): EventManager {
    return this.eventManager;
  }

  /**
   * Get AI manager
   */
  getAIManager(): AIManager {
    return this.aiManager;
  }

  /**
   * Get Discord client
   */
  getClient(): Client {
    return this.client;
  }
}

/**
 * Create and start the bot
 */
async function main(): Promise<void> {
  const logger = new Logger('Main');
  
  try {
    logger.info('Starting GameDin Discord Bot...');
    
    const bot = new GameDinBot();
    await bot.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled promise rejection:', error);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Start the bot if this file is run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export the GameDinBot class
export { GameDinBot }; 