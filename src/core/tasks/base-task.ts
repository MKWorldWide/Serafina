import { Client } from 'discord.js';
import { createLogger } from '../pino-logger';
import { config } from '../config';

export interface TaskOptions {
  /**
   * Whether the task is enabled
   * @default true
   */
  enabled?: boolean;
  
  /**
   * The cron schedule for this task
   * @example '*/5 * * * *' - Every 5 minutes
   */
  schedule: string;
  
  /**
   * Timezone for the cron schedule
   * @default 'UTC'
   */
  timezone?: string;
  
  /**
   * Whether to run the task immediately when the bot starts
   * @default false
   */
  runOnStart?: boolean;
  
  /**
   * Maximum number of concurrent executions allowed
   * @default 1
   */
  maxConcurrent?: number;
  
  /**
   * Whether to queue tasks if they overlap
   * @default false
   */
  queue?: boolean;
}

/**
 * Base class for all scheduled tasks
 */
export abstract class BaseTask {
  /**
   * Task name (must be unique)
   */
  public abstract readonly name: string;
  
  /**
   * Task options
   */
  protected readonly options: TaskOptions;
  
  /**
   * Logger instance
   */
  protected readonly logger = createLogger(`task:${this.constructor.name.toLowerCase()}`);
  
  /**
   * Discord client instance
   */
  protected client: Client | null = null;
  
  constructor(options: TaskOptions) {
    this.options = {
      enabled: true,
      timezone: 'UTC',
      runOnStart: false,
      maxConcurrent: 1,
      queue: false,
      ...options,
    };
  }
  
  /**
   * Initialize the task with the Discord client
   */
  public initialize(client: Client): void {
    this.client = client;
    this.logger.info(`Initialized task: ${this.name}`);
  }
  
  /**
   * Execute the task
   */
  public async execute(): Promise<void> {
    if (!this.client) {
      throw new Error('Task has not been initialized with a Discord client');
    }
    
    if (!this.options.enabled) {
      this.logger.debug(`Skipping disabled task: ${this.name}`);
      return;
    }
    
    const startTime = Date.now();
    this.logger.debug(`Starting task: ${this.name}`);
    
    try {
      await this.run(this.client);
      const duration = Date.now() - startTime;
      this.logger.debug(`Completed task: ${this.name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Task failed after ${duration}ms: ${this.name}`, { error });
      
      // Rethrow to allow task manager to handle the error
      throw error;
    }
  }
  
  /**
   * Task execution logic to be implemented by subclasses
   */
  protected abstract run(client: Client): Promise<void>;
  
  /**
   * Clean up resources when the task is being destroyed
   */
  public async destroy(): Promise<void> {
    this.logger.debug(`Destroying task: ${this.name}`);
    // Can be overridden by subclasses
  }
  
  /**
   * Get the task's schedule
   */
  public getSchedule(): string {
    return this.options.schedule;
  }
  
  /**
   * Check if the task should run on start
   */
  public shouldRunOnStart(): boolean {
    return this.options.runOnStart === true;
  }
  
  /**
   * Check if the task is enabled
   */
  public isEnabled(): boolean {
    return this.options.enabled === true;
  }
  
  /**
   * Get the task's timezone
   */
  public getTimezone(): string | undefined {
    return this.options.timezone;
  }
  
  /**
   * Get the task's max concurrent executions
   */
  public getMaxConcurrent(): number {
    return this.options.maxConcurrent ?? 1;
  }
  
  /**
   * Check if the task should be queued if it overlaps
   */
  public shouldQueue(): boolean {
    return this.options.queue === true;
  }
}
