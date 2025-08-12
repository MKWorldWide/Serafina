import { Client } from 'discord.js';

export interface TaskOptions {
  enabled?: boolean;
  schedule: string;
  timezone?: string;
  runOnStart?: boolean;
  maxConcurrent?: number;
  queue?: boolean;
}

export abstract class BaseTask {
  public abstract readonly name: string;
  protected readonly options: TaskOptions;
  protected client: Client;

  constructor(client: Client, options: TaskOptions) {
    this.client = client;
    this.options = {
      enabled: true,
      timezone: 'UTC',
      runOnStart: false,
      maxConcurrent: 1,
      queue: false,
      ...options
    };
  }

  protected abstract run(client: Client): Promise<void>;

  public async execute(): Promise<void> {
    if (!this.options.enabled) return;
    try {
      await this.run(this.client);
    } catch (error) {
      console.error(`Error in task ${this.name}:`, error);
      throw error;
    }
  }
}
