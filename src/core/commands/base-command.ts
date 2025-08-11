import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { createLogger } from '../pino-logger';
import { config } from '../config';

const logger = createLogger('commands');

/**
 * Represents a command that can be executed by the bot
 */
export interface Command {
  /**
   * The data for the command (name, description, options, etc.)
   */
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  
  /**
   * Whether the command is only available in guilds (default: true)
   */
  guildOnly?: boolean;
  
  /**
   * Whether the command is only available to the bot owner (default: false)
   */
  ownerOnly?: boolean;
  
  /**
   * Cooldown in seconds (default: 0 = no cooldown)
   */
  cooldown?: number;
  
  /**
   * Whether the command is enabled (default: true)
   */
  enabled?: boolean;
  
  /**
   * Required permissions for the user to use this command
   */
  permissions?: bigint[];
  
  /**
   * Executes the command
   * @param interaction The interaction that triggered the command
   */
  execute(interaction: any): Promise<void>;
  
  /**
   * Handles autocomplete for the command
   * @param interaction The autocomplete interaction
   */
  autocomplete?(interaction: any): Promise<void>;
}

/**
 * Base command class that all commands should extend
 */
export abstract class BaseCommand implements Command {
  public data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  public guildOnly: boolean = true;
  public ownerOnly: boolean = false;
  public cooldown: number = 0;
  public enabled: boolean = true;
  public permissions: bigint[] = [];
  protected logger = logger;

  constructor() {
    // Initialize the command data
    this.data = this.initialize();
    
    // Apply default permissions if none are set
    if (this.permissions.length === 0 && this.guildOnly) {
      // Default to requiring no specific permissions
      this.permissions = [];
    }
  }

  /**
   * Initialize the command data
   */
  protected abstract initialize(): SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

  /**
   * Execute the command
   * @param interaction The interaction that triggered the command
   */
  public abstract execute(interaction: any): Promise<void>;

  /**
   * Handle autocomplete for the command
   * @param interaction The autocomplete interaction
   */
  public async autocomplete(interaction: any): Promise<void> {
    // Default implementation does nothing
    // Override in child classes to provide autocomplete functionality
  }

  /**
   * Check if the command can be executed in the current context
   * @param interaction The interaction that triggered the command
   */
  public async canExecute(interaction: any): Promise<{ canExecute: boolean; reason?: string }> {
    // Check if the command is enabled
    if (!this.enabled) {
      return { canExecute: false, reason: 'This command is currently disabled.' };
    }

    // Check if the command is guild-only and being used in a DM
    if (this.guildOnly && !interaction.inGuild()) {
      return { canExecute: false, reason: 'This command can only be used in a server.' };
    }

    // Check if the command is owner-only
    if (this.ownerOnly && interaction.user.id !== config.discord.ownerId) {
      return { canExecute: false, reason: 'This command can only be used by the bot owner.' };
    }

    // Check if the user has the required permissions
    if (interaction.inGuild() && this.permissions.length > 0) {
      const member = interaction.member;
      const hasPermission = this.permissions.some(permission => 
        member.permissions.has(permission)
      );

      if (!hasPermission) {
        return { 
          canExecute: false, 
          reason: 'You do not have permission to use this command.' 
        };
      }
    }

    // All checks passed
    return { canExecute: true };
  }
}
