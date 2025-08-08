import { Client, Message, TextBasedChannel } from 'discord.js';
import axios, { AxiosError, AxiosInstance } from 'axios';
import dotenv from 'dotenv';

declare module 'axios' {
  interface AxiosRequestConfig {
    timeout?: number;
  }
}

dotenv.config();

type ServiceEndpoint = {
  name: string;
  url: string;
  description: string;
};

export class SerafinaRouter {
  private client: Client;
  private http: AxiosInstance;
  private services: Record<string, ServiceEndpoint>;
  private defaultService: string;

  constructor(client: Client) {
    this.client = client;
    this.http = axios.create({
      timeout: 10000, // 10 second timeout
      headers: { 'Content-Type': 'application/json' }
    });

    // Initialize service endpoints from environment variables
    this.services = {
      shadow: {
        name: 'Shadow Nexus',
        url: process.env.SHADOW_NEXUS_URL || 'http://localhost:8000',
        description: 'Core game logic and state management'
      },
      athena: {
        name: 'AthenaCore',
        url: process.env.ATHENACORE_URL || 'http://localhost:8001',
        description: 'AI and decision making'
      },
      divina: {
        name: 'Divina',
        url: process.env.DIVINA_URL || 'http://localhost:8002',
        description: 'Creative content generation'
      }
    };

    this.defaultService = 'athena'; // Default service for direct messages
  }

  /**
   * Initialize the router and register commands/event listeners
   */
  public initialize(): void {
    console.log('[SerafinaRouter] Initializing router service');
    this.registerCommands();
  }

  /**
   * Register router commands
   */
  private registerCommands(): void {
    this.client.on('messageCreate', async (message: Message) => {
      if (message.author.bot) return;
      
      // Handle relay commands
      if (message.content.startsWith('!relay ')) {
        await this.handleRelayCommand(message);
      }
      
      // Handle status command
      if (message.content === '!status') {
        await this.handleStatusCommand(message);
      }
    });
  }

  /**
   * Handle the relay command
   */
  private async handleRelayCommand(message: Message): Promise<void> {
    // Ensure we're in a text channel or DM channel
    if (!message.channel.isTextBased()) {
      await message.reply('This command is only available in text channels or DMs.');
      return;
    }

    const args = message.content.split(' ').slice(1);
    if (args.length < 2) {
      await message.reply('Usage: `!relay <target> <message>`');
      return;
    }

    const target = args[0].toLowerCase();
    const content = args.slice(1).join(' ');
    
    try {
      // Get the channel ID, using the channel ID if available, otherwise use a default
      const channelId = message.channel.isDMBased() ? 'dm' : 
                       'id' in message.channel ? message.channel.id : 'unknown';
      
      // Get the guild ID if available, otherwise use 'dm'
      const guildId = message.guild?.id || 'dm';
      
      const response = await this.relayMessage(target, {
        content,
        author: message.author.username,
        channel: channelId,
        guild: guildId
      });
      
      await message.reply(`📨 Message relayed to ${target}: ${response}`);
    } catch (error: unknown) {
      console.error(`[SerafinaRouter] Error relaying message:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await message.reply(`⚠️ Failed to relay message: ${errorMessage}`);
    }
  }

  /**
   * Handle the status command
   */
  private async handleStatusCommand(message: Message): Promise<void> {
    const statuses = await Promise.all(
      Object.entries(this.services).map(async ([key, service]) => {
        try {
          const response = await this.http.get(`${service.url}/health`, { timeout: 3000 });
          return `✅ **${service.name}**: Online (${response.status})`;
        } catch (error) {
          return `❌ **${service.name}**: Offline`;
        }
      })
    );

    const statusMessage = [
      '📡 **Serafina Communication Status**',
      '```',
      ...statuses,
      '```',
      `Default service: ${this.services[this.defaultService]?.name || 'None'}`
    ].join('\n');

    await message.reply(statusMessage);
  }

  /**
   * Relay a message to a specific service
   */
  public async relayMessage(target: string, message: any): Promise<string> {
    const service = this.services[target];
    if (!service) {
      throw new Error(`Unknown service: ${target}`);
    }

    try {
      const response = await this.http.post(`${service.url}/message`, {
        ...message,
        timestamp: new Date().toISOString()
      });
      
      return (response.data as { ack?: string }).ack || 'Message received';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(`Service error: ${axiosError.response?.status} - ${axiosError.response?.data?.message || 'Unknown error'}`);
      }
      throw error;
    }
  }

  /**
   * Get the current status of all services
   */
  public async getServiceStatus(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};
    
    await Promise.all(
      Object.entries(this.services).map(async ([key, service]) => {
        try {
          await this.http.get(`${service.url}/health`, { timeout: 3000 });
          status[key] = true;
        } catch (error) {
          status[key] = false;
        }
      })
    );
    
    return status;
  }
}
