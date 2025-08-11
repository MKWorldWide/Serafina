import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { config } from './config';
import { createLogger } from './pino-logger';

const logger = createLogger('client');

/**
 * Extended Discord client with additional functionality
 */
class SerafinaClient extends Client {
  public commands = new Collection<string, any>();
  public cooldowns = new Collection<string, Collection<string, number>>();
  public logger = logger;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        ...(config.discord.enableMessageContent ? [GatewayIntentBits.MessageContent] : []),
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
      ],
      // Enable all events, we'll handle them in the events directory
      failIfNotExists: false,
      // Enable the message cache for message commands (if needed)
      makeCache: {
        ...Client.defaultMakeCacheSettings,
        MessageManager: 200, // Cache up to 200 messages per channel
      },
    });
  }

  /**
   * Initialize the client with event handlers and commands
   */
  public async initialize() {
    try {
      // Load events and commands
      await this.loadEvents();
      await this.loadCommands();
      
      // Login to Discord
      await this.login(config.discord.token);
      
      logger.info(`Logged in as ${this.user?.tag}`);
      return this;
    } catch (error) {
      logger.error('Failed to initialize client:', error);
      process.exit(1);
    }
  }

  /**
   * Load event handlers from the events directory
   */
  private async loadEvents() {
    const { glob } = await import('glob');
    const path = await import('path');
    
    const eventFiles = await glob(
      path.join(__dirname, '../events/**/*.{js,ts}').replace(/\\/g, '/'),
      { ignore: '**/*.d.ts' }
    );

    for (const file of eventFiles) {
      try {
        const { default: event } = await import(path.resolve(file));
        
        if (event.once) {
          this.once(event.name, (...args) => event.execute(this, ...args));
        } else {
          this.on(event.name, (...args) => event.execute(this, ...args));
        }
        
        logger.debug(`Loaded event: ${event.name}`);
      } catch (error) {
        logger.error(`Error loading event ${file}:`, error);
      }
    }
    
    logger.info(`Loaded ${eventFiles.length} event handlers`);
  }

  /**
   * Load commands from the commands directory
   */
  private async loadCommands() {
    const { glob } = await import('glob');
    const path = await import('path');
    
    const commandFiles = await glob(
      path.join(__dirname, '../commands/**/*.{js,ts}').replace(/\\/g, '/'),
      { ignore: '**/*.d.ts' }
    );

    for (const file of commandFiles) {
      try {
        const { default: command } = await import(path.resolve(file));
        
        if (!command.data?.name) {
          logger.warn(`Command at ${file} is missing a name, skipping...`);
          continue;
        }
        
        this.commands.set(command.data.name, command);
        logger.debug(`Loaded command: ${command.data.name}`);
        
        // Initialize cooldowns for this command if it has a cooldown
        if (command.cooldown) {
          this.cooldowns.set(command.data.name, new Collection());
        }
      } catch (error) {
        logger.error(`Error loading command ${file}:`, error);
      }
    }
    
    logger.info(`Loaded ${this.commands.size} application commands`);
  }
}

// Create and export a singleton instance
export const client = new SerafinaClient();

export default client;
