import { Client, GatewayIntentBits, Collection, Events, ActivityType } from 'discord.js';
import { createLogger } from './pino-logger';
import { config } from './config';
import { TaskManager } from './tasks/task-manager';
import { createWebServer, WebServer } from '../web';
import { HealthCheckTask } from '../tasks/health-check';
import { PresenceRotationTask } from '../tasks/presence-rotation';

export class SerafinaBot {
  public readonly client: Client;
  private readonly logger = createLogger('bot');
  private taskManager: TaskManager | null = null;
  private webServer: WebServer | null = null;
  private isShuttingDown = false;

  constructor() {
    // Create Discord client with necessary intents
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
      ],
      presence: {
        status: 'online',
        activities: [{
          name: 'Starting up...',
          type: ActivityType.Playing,
        }],
      },
    });
  }

  /**
   * Initialize the bot
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Serafina Bot...');
      
      // Initialize task manager
      await this.initializeTaskManager();
      
      // Initialize web server
      await this.initializeWebServer();
      
      // Register event handlers
      this.registerEventHandlers();
      
      this.logger.info('Bot initialization completed');
    } catch (error) {
      this.logger.error('Failed to initialize bot:', error);
      throw error;
    }
  }

  /**
   * Start the bot
   */
  public async start(): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('Bot is in the process of shutting down');
    }

    try {
      // Initialize first
      await this.initialize();
      
      // Login to Discord
      this.logger.info('Logging in to Discord...');
      await this.client.login(config.discord.token);
      
      // Start web server
      if (this.webServer) {
        await this.webServer.start();
      }
      
      this.logger.info('Bot is now running');
    } catch (error) {
      this.logger.error('Failed to start bot:', error);
      await this.shutdown(1);
    }
  }

  /**
   * Shutdown the bot gracefully
   */
  public async shutdown(exitCode = 0): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    
    this.logger.info('Shutting down...');
    
    try {
      // Stop web server
      if (this.webServer) {
        await this.webServer.stop();
      }
      
      // Destroy task manager
      if (this.taskManager) {
        await this.taskManager.destroy();
      }
      
      // Destroy Discord client
      if (this.client) {
        this.client.destroy();
      }
      
      this.logger.info('Shutdown complete');
      
      // Exit the process
      if (exitCode !== null) {
        process.exit(exitCode);
      }
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Initialize the task manager
   */
  private async initializeTaskManager(): Promise<void> {
    this.logger.info('Initializing task manager...');
    
    this.taskManager = new TaskManager(this.client);
    
    // Load tasks
    await this.taskManager.loadTasks();
    
    // Add built-in tasks
    this.taskManager.addTask(new HealthCheckTask());
    this.taskManager.addTask(new PresenceRotationTask());
    
    this.logger.info('Task manager initialized');
  }

  /**
   * Initialize the web server
   */
  private async initializeWebServer(): Promise<void> {
    if (!config.web.enabled) {
      this.logger.info('Web server is disabled');
      return;
    }
    
    this.logger.info('Initializing web server...');
    
    try {
      this.webServer = await createWebServer(config.web.port);
      
      // Set task manager for graceful shutdown
      if (this.taskManager) {
        this.webServer.setTaskManager(this.taskManager);
      }
      
      this.logger.info(`Web server will run on port ${config.web.port}`);
    } catch (error) {
      this.logger.error('Failed to initialize web server:', error);
      throw error;
    }
  }

  /**
   * Register event handlers
   */
  private registerEventHandlers(): void {
    // Ready event
    this.client.once(Events.ClientReady, async (client) => {
      this.logger.info(`Logged in as ${client.user.tag}`);
      this.logger.info(`Serving ${client.guilds.cache.size} guilds`);
      
      // Set initial presence
      await client.user.setPresence({
        status: 'online',
        activities: [{
          name: `${config.discord.prefix}help`,
          type: ActivityType.Playing,
        }],
      });
    });
    
    // Error handling
    this.client.on(Events.Error, (error) => {
      this.logger.error('Discord client error:', error);
    });
    
    // Warn
    this.client.on(Events.Warn, (message) => {
      this.logger.warn(`Discord client warning: ${message}`);
    });
    
    // Debug
    if (config.debug) {
      this.client.on(Events.Debug, (message) => {
        this.logger.debug(`Discord client debug: ${message}`);
      });
    }
    
    // Handle process signals
    process.on('SIGINT', () => this.shutdown(0));
    process.on('SIGTERM', () => this.shutdown(0));
    
    // Unhandled rejections
    process.on('unhandledRejection', (reason) => {
      this.logger.error('Unhandled promise rejection:', reason);
    });
    
    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception:', error);
      this.shutdown(1);
    });
  }
}

/**
 * Create and start the bot
 */
export async function createBot(): Promise<SerafinaBot> {
  const bot = new SerafinaBot();
  await bot.start();
  return bot;
}

// Start the bot if this file is run directly
if (require.main === module) {
  createBot().catch((error) => {
    console.error('Failed to start bot:', error);
    process.exit(1);
  });
}
