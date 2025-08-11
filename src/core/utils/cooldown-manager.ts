import { Collection, Snowflake } from 'discord.js';
import { createLogger } from '../pino-logger';
import { config } from '../config';

const logger = createLogger('cooldown');

type CooldownType = 'user' | 'channel' | 'guild' | 'global';

interface CooldownOptions {
  /** The type of cooldown (user, channel, guild, or global) */
  type: CooldownType;
  
  /** Duration of the cooldown in milliseconds */
  duration: number;
  
  /** Maximum number of uses before cooldown is applied (for rate limiting) */
  maxUses?: number;
  
  /** Whether to reset the cooldown on each use (sliding window) */
  sliding?: boolean;
}

interface CooldownEntry {
  /** When the cooldown will expire */
  expiresAt: number;
  
  /** Number of times the command has been used */
  uses: number;
  
  /** When the cooldown was last used */
  lastUsed: number;
}

/**
 * Manages cooldowns for commands and other rate-limited actions
 */
export class CooldownManager {
  private cooldowns: Collection<string, Collection<string, CooldownEntry>>;
  
  constructor() {
    this.cooldowns = new Collection();
    
    // Clean up expired cooldowns every minute
    setInterval(() => this.cleanup(), 60000).unref();
  }
  
  /**
   * Get a cooldown key based on the type and ID
   */
  private getKey(type: CooldownType, id: string): string {
    return `${type}:${id}`;
  }
  
  /**
   * Get a cooldown bucket for a command and key
   */
  private getBucket(commandName: string, key: string): Collection<string, CooldownEntry> {
    const commandCooldowns = this.cooldowns.get(commandName) || new Collection();
    
    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, commandCooldowns);
    }
    
    return commandCooldowns;
  }
  
  /**
   * Check if a cooldown is active and get time remaining
   * @param commandName Name of the command
   * @param options Cooldown options
   * @param ids Array of IDs in order: [userId, channelId, guildId]
   * @returns Time remaining in milliseconds (0 if no cooldown)
   */
  public getRemaining(
    commandName: string,
    options: CooldownOptions,
    [userId, channelId, guildId]: [Snowflake, Snowflake | null, Snowflake | null]
  ): number {
    const { type, duration } = options;
    
    // Determine which ID to use based on cooldown type
    let id: string;
    
    switch (type) {
      case 'user':
        id = userId;
        break;
      case 'channel':
        id = channelId || 'dm';
        break;
      case 'guild':
        id = guildId || 'dm';
        break;
      case 'global':
        id = 'global';
        break;
      default:
        throw new Error(`Invalid cooldown type: ${type}`);
    }
    
    const key = this.getKey(type, id);
    const bucket = this.getBucket(commandName, key);
    const now = Date.now();
    
    // Get or create the cooldown entry
    let entry = bucket.get(key);
    
    // If no entry or the cooldown has expired, return 0
    if (!entry || entry.expiresAt <= now) {
      return 0;
    }
    
    // Check max uses if specified
    if (options.maxUses && entry.uses >= options.maxUses) {
      return entry.expiresAt - now;
    }
    
    // If sliding window is enabled, update the last used time
    if (options.sliding) {
      entry.lastUsed = now;
      entry.uses++;
    }
    
    return entry.expiresAt - now;
  }
  
  /**
   * Set a cooldown for a command
   */
  public setCooldown(
    commandName: string,
    options: CooldownOptions,
    [userId, channelId, guildId]: [Snowflake, Snowflake | null, Snowflake | null],
    customDuration?: number
  ): void {
    const { type, duration } = options;
    const actualDuration = customDuration || duration;
    const now = Date.now();
    
    // Determine which ID to use based on cooldown type
    let id: string;
    
    switch (type) {
      case 'user':
        id = userId;
        break;
      case 'channel':
        id = channelId || 'dm';
        break;
      case 'guild':
        id = guildId || 'dm';
        break;
      case 'global':
        id = 'global';
        break;
      default:
        throw new Error(`Invalid cooldown type: ${type}`);
    }
    
    const key = this.getKey(type, id);
    const bucket = this.getBucket(commandName, key);
    
    // Get or create the cooldown entry
    let entry = bucket.get(key);
    
    if (!entry) {
      entry = {
        expiresAt: now + actualDuration,
        uses: 1,
        lastUsed: now
      };
    } else {
      // If sliding window is enabled, extend the cooldown
      if (options.sliding) {
        entry.expiresAt = now + actualDuration;
        entry.uses++;
        entry.lastUsed = now;
      } else {
        // Otherwise, just update the expiration time
        entry.expiresAt = now + actualDuration;
        entry.uses = 1;
        entry.lastUsed = now;
      }
    }
    
    bucket.set(key, entry);
    
    logger.debug(`Set cooldown for ${commandName} (${type}:${id}) for ${actualDuration}ms`);
  }
  
  /**
   * Reset a cooldown
   */
  public resetCooldown(
    commandName: string,
    type: CooldownType,
    [userId, channelId, guildId]: [Snowflake, Snowflake | null, Snowflake | null]
  ): boolean {
    // Determine which ID to use based on cooldown type
    let id: string;
    
    switch (type) {
      case 'user':
        id = userId;
        break;
      case 'channel':
        id = channelId || 'dm';
        break;
      case 'guild':
        id = guildId || 'dm';
        break;
      case 'global':
        id = 'global';
        break;
      default:
        throw new Error(`Invalid cooldown type: ${type}`);
    }
    
    const key = this.getKey(type, id);
    const bucket = this.getBucket(commandName, key);
    
    return bucket.delete(key);
  }
  
  /**
   * Get all cooldowns for a command
   */
  public getCooldowns(commandName: string): Map<string, CooldownEntry> {
    const commandCooldowns = this.cooldowns.get(commandName);
    if (!commandCooldowns) {
      return new Map();
    }
    
    return new Map(commandCooldowns);
  }
  
  /**
   * Clear all cooldowns for a command
   */
  public clearCooldowns(commandName: string): number {
    const commandCooldowns = this.cooldowns.get(commandName);
    
    if (!commandCooldowns) {
      return 0;
    }
    
    const count = commandCooldowns.size;
    commandCooldowns.clear();
    
    return count;
  }
  
  /**
   * Clear all cooldowns
   */
  public clearAllCooldowns(): void {
    this.cooldowns.clear();
  }
  
  /**
   * Clean up expired cooldowns
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;
    
    for (const [commandName, cooldowns] of this.cooldowns) {
      for (const [key, entry] of cooldowns) {
        if (entry.expiresAt <= now) {
          cooldowns.delete(key);
          removed++;
        }
      }
      
      // Remove empty command entries
      if (cooldowns.size === 0) {
        this.cooldowns.delete(commandName);
      }
    }
    
    if (removed > 0 && config.debug) {
      logger.debug(`Cleaned up ${removed} expired cooldowns`);
    }
  }
}

// Export a singleton instance
export const cooldownManager = new CooldownManager();

/**
 * Decorator for applying cooldowns to command methods
 */
export function Cooldown(options: CooldownOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      // Find the interaction or message in the arguments
      const interaction = args.find(arg => 
        arg?.isCommand?.() || arg?.isUserContextMenuCommand?.()
      );
      
      const message = args.find(arg => 
        arg?.author && arg?.channel && !arg?.isCommand?.()
      );
      
      if (!interaction && !message) {
        return originalMethod.apply(this, args);
      }
      
      const userId = interaction?.user?.id || message?.author?.id;
      const channelId = interaction?.channelId || message?.channelId;
      const guildId = interaction?.guildId || message?.guildId;
      
      if (!userId) {
        return originalMethod.apply(this, args);
      }
      
      // Get the command name from the class name and method name
      const commandName = `${target.constructor.name}.${propertyKey}`;
      
      // Check if there's an active cooldown
      const remaining = cooldownManager.getRemaining(
        commandName,
        options,
        [userId, channelId, guildId]
      );
      
      if (remaining > 0) {
        throw new Error(`Command is on cooldown. Please wait ${Math.ceil(remaining / 1000)} more seconds.`);
      }
      
      // Set the cooldown
      cooldownManager.setCooldown(
        commandName,
        options,
        [userId, channelId, guildId]
      );
      
      // Call the original method
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}
