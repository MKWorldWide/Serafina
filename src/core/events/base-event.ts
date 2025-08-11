import { Client, Events } from 'discord.js';
import { createLogger } from '../pino-logger';

const logger = createLogger('events');

export interface EventHandler {
  name: string;
  once?: boolean;
  execute: (client: Client, ...args: any[]) => Promise<void> | void;
}

export abstract class BaseEvent implements EventHandler {
  public abstract name: string;
  public once: boolean = false;
  protected logger = logger;

  public abstract execute(client: Client, ...args: any[]): Promise<void> | void;

  protected logEvent(data: any = {}) {
    this.logger.info(`[${this.name}] Event triggered`, data);
  }

  protected logError(error: Error, data: any = {}) {
    this.logger.error(`[${this.name}] Error in event handler`, { error, ...data });
  }
}
