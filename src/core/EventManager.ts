/**
 * 🎮 GameDin Discord Bot - Event Manager
 * 
 * Comprehensive event management system that handles dynamic event loading
 * and processing for the Discord bot with TypeScript interfaces and error handling.
 * 
 * Features:
 * - Dynamic event loading from directories
 * - Support for both once and on events
 * - TypeScript interfaces for type safety
 * - Error handling and logging
 * - Event statistics and monitoring
 * - Quantum documentation and usage tracking
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { Client, ClientEvents, Collection } from 'discord.js';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Logger } from './Logger';

/**
 * Event interface for Discord bot events
 */
export interface BotEvent<K extends keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
  description?: string;
  category?: string;
  enabled?: boolean;
}

/**
 * Event statistics tracking
 */
interface EventStats {
  name: string;
  executions: number;
  lastExecuted: Date | null;
  errors: number;
  averageExecutionTime: number;
}

/**
 * Comprehensive event manager for Discord bot
 */
export class EventManager {
  private events: Collection<string, BotEvent<any>> = new Collection();
  private stats: Collection<string, EventStats> = new Collection();
  private logger: Logger;
  private client: Client;

  constructor(client: Client, logger?: Logger) {
    this.client = client;
    this.logger = logger || new Logger('EventManager');
  }

  /**
   * Load all events from the events directory
   */
  async loadEvents(eventsPath: string): Promise<void> {
    try {
      this.logger.info('Loading events from:', eventsPath);
      
      const eventFiles = this.getEventFiles(eventsPath);
      
      for (const file of eventFiles) {
        await this.loadEvent(file);
      }
      
      this.logger.info(`Loaded ${this.events.size} events`);
    } catch (error) {
      this.logger.error('Error loading events:', error);
      throw error;
    }
  }

  /**
   * Load a single event file
   */
  private async loadEvent(filePath: string): Promise<void> {
    try {
      const eventModule = await import(filePath);
      
      // Handle both default exports and named exports
      let event = eventModule.default || eventModule.event || eventModule;
      
      // If it's an array of events, load each one
      if (Array.isArray(event)) {
        for (const evt of event) {
          if (evt.name && evt.execute) {
            this.events.set(evt.name, evt);
            this.initializeEventStats(evt.name);
            this.logger.info(`Loaded event: ${evt.name}`);
          }
        }
        return;
      }

      if (event.name && event.execute) {
        this.events.set(event.name, event);
        this.initializeEventStats(event.name);
        this.logger.info(`Loaded event: ${event.name}`);
      } else {
        this.logger.warn(`Event file ${filePath} is missing required properties`);
      }
    } catch (error) {
      this.logger.error(`Error loading event from ${filePath}:`, error);
    }
  }

  /**
   * Get all event files recursively
   */
  private getEventFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getEventFiles(fullPath));
        } else if (item.endsWith('.ts') || item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.logger.warn(`Could not read directory ${dir}:`, error);
    }
    
    return files;
  }

  /**
   * Initialize event statistics
   */
  private initializeEventStats(eventName: string): void {
    this.stats.set(eventName, {
      name: eventName,
      executions: 0,
      lastExecuted: null,
      errors: 0,
      averageExecutionTime: 0
    });
  }

  /**
   * Register all events with the Discord client
   */
  registerEvents(): void {
    this.logger.info('Registering events with Discord client...');
    
    for (const [name, event] of this.events) {
      if (event.enabled === false) {
        this.logger.debug(`Skipping disabled event: ${name}`);
        continue;
      }

      const wrappedExecute = async (...args: any[]) => {
        const startTime = Date.now();
        const stats = this.stats.get(name);
        
        try {
          await event.execute(...args);
          
          // Update statistics
          if (stats) {
            stats.executions++;
            stats.lastExecuted = new Date();
            const executionTime = Date.now() - startTime;
            stats.averageExecutionTime = (stats.averageExecutionTime + executionTime) / 2;
          }
          
          this.logger.debug(`Event ${name} executed successfully`);
        } catch (error) {
          this.logger.error(`Error in event ${name}:`, error);
          
          // Update error statistics
          if (stats) {
            stats.errors++;
          }
        }
      };

      if (event.once) {
        this.client.once(event.name, wrappedExecute);
        this.logger.debug(`Registered once event: ${name}`);
      } else {
        this.client.on(event.name, wrappedExecute);
        this.logger.debug(`Registered event: ${name}`);
      }
    }
    
    this.logger.info(`Registered ${this.events.size} events`);
  }

  /**
   * Get event by name
   */
  getEvent(name: string): BotEvent<any> | undefined {
    return this.events.get(name);
  }

  /**
   * Get all events
   */
  getAllEvents(): BotEvent<any>[] {
    return Array.from(this.events.values());
  }

  /**
   * Get events by category
   */
  getEventsByCategory(): Record<string, BotEvent<any>[]> {
    const categories: Record<string, BotEvent<any>[]> = {};
    
    for (const event of this.events.values()) {
      const category = event.category || 'General';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(event);
    }
    
    return categories;
  }

  /**
   * Enable an event
   */
  enableEvent(name: string): boolean {
    const event = this.events.get(name);
    if (event) {
      event.enabled = true;
      this.logger.info(`Enabled event: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Disable an event
   */
  disableEvent(name: string): boolean {
    const event = this.events.get(name);
    if (event) {
      event.enabled = false;
      this.logger.info(`Disabled event: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Get event statistics
   */
  getEventStats(name: string): EventStats | undefined {
    return this.stats.get(name);
  }

  /**
   * Get all event statistics
   */
  getAllEventStats(): EventStats[] {
    return Array.from(this.stats.values());
  }

  /**
   * Get overall event statistics
   */
  getOverallStats(): {
    totalEvents: number;
    totalExecutions: number;
    totalErrors: number;
    averageExecutionTime: number;
  } {
    const stats = this.getAllEventStats();
    const totalExecutions = stats.reduce((sum, stat) => sum + stat.executions, 0);
    const totalErrors = stats.reduce((sum, stat) => sum + stat.errors, 0);
    const avgExecutionTime = stats.reduce((sum, stat) => sum + stat.averageExecutionTime, 0) / stats.length || 0;
    
    return {
      totalEvents: this.events.size,
      totalExecutions,
      totalErrors,
      averageExecutionTime: avgExecutionTime
    };
  }

  /**
   * Reset event statistics
   */
  resetStats(): void {
    this.stats.clear();
    for (const event of this.events.values()) {
      this.initializeEventStats(event.name);
    }
    this.logger.info('Event statistics reset');
  }

  /**
   * Get event help information
   */
  getEventHelp(eventName: string): string | null {
    const event = this.events.get(eventName);
    if (!event) return null;
    
    const help = [
      `**${eventName}**`,
      `Description: ${event.description || 'No description available'}`,
      `Category: ${event.category || 'General'}`,
      `Type: ${event.once ? 'Once' : 'On'}`,
      `Enabled: ${event.enabled !== false ? 'Yes' : 'No'}`
    ];
    
    const stats = this.stats.get(eventName);
    if (stats) {
      help.push(
        `Executions: ${stats.executions}`,
        `Errors: ${stats.errors}`,
        `Average Execution Time: ${stats.averageExecutionTime.toFixed(2)}ms`
      );
    }
    
    return help.join('\n');
  }

  /**
   * List all events with their status
   */
  listEvents(): string[] {
    const eventList: string[] = [];
    
    for (const [name, event] of this.events) {
      const status = event.enabled !== false ? '✅' : '❌';
      const type = event.once ? 'Once' : 'On';
      const category = event.category || 'General';
      
      eventList.push(`${status} **${name}** (${type}) - ${category}`);
    }
    
    return eventList;
  }
} 