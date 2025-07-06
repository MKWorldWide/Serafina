/**
 * 🎮 GameDin Discord Bot - Command Manager
 * 
 * Comprehensive command management system that handles both slash commands and prefix commands
 * with dynamic loading, TypeScript interfaces, and extensible architecture.
 * 
 * Features:
 * - Dynamic command loading from directories
 * - Support for both slash and prefix commands
 * - TypeScript interfaces for type safety
 * - Error handling and logging
 * - Command cooldowns and permissions
 * - Quantum documentation and usage tracking
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { 
  Collection, 
  ChatInputCommandInteraction, 
  Message, 
  SlashCommandBuilder, 
  SlashCommandSubcommandsOnlyBuilder,
  PermissionResolvable,
  GuildMember,
  User
} from 'discord.js';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Logger } from './Logger';

/**
 * Command interface for slash commands
 */
export interface SlashCommand {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  cooldown?: number;
  permissions?: PermissionResolvable[];
  category?: string;
  description?: string;
  usage?: string;
  examples?: string[];
}

/**
 * Command interface for prefix commands
 */
export interface PrefixCommand {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  examples: string[];
  cooldown?: number;
  permissions?: PermissionResolvable[];
  category?: string;
  execute: (message: Message, args: string[]) => Promise<void>;
}

/**
 * Command cooldown tracking
 */
interface CooldownEntry {
  userId: string;
  timestamp: number;
}

/**
 * Comprehensive command manager for Discord bot
 */
export class CommandManager {
  private slashCommands: Collection<string, SlashCommand> = new Collection();
  private prefixCommands: Collection<string, PrefixCommand> = new Collection();
  private cooldowns: Collection<string, CooldownEntry[]> = new Collection();
  private logger: Logger;
  private prefix: string;

  constructor(prefix: string = '!', logger?: Logger) {
    this.prefix = prefix;
    this.logger = logger || new Logger('CommandManager');
  }

  /**
   * Load all commands from the commands directory
   * Supports both slash and prefix commands
   */
  async loadCommands(commandsPath: string): Promise<void> {
    try {
      this.logger.info('Loading commands from:', commandsPath);
      
      const commandFiles = this.getCommandFiles(commandsPath);
      
      for (const file of commandFiles) {
        await this.loadCommand(file);
      }
      
      this.logger.info(`Loaded ${this.slashCommands.size} slash commands and ${this.prefixCommands.size} prefix commands`);
    } catch (error) {
      this.logger.error('Error loading commands:', error);
      throw error;
    }
  }

  /**
   * Load a single command file
   */
  private async loadCommand(filePath: string): Promise<void> {
    try {
      const commandModule = await import(filePath);
      const command = commandModule.default || commandModule;

      // Handle slash commands
      if (command.data && command.execute) {
        this.slashCommands.set(command.data.name, command);
        this.logger.info(`Loaded slash command: ${command.data.name}`);
      }
      
      // Handle prefix commands
      if (command.name && command.execute && !command.data) {
        this.prefixCommands.set(command.name, command);
        
        // Register aliases
        if (command.aliases) {
          for (const alias of command.aliases) {
            this.prefixCommands.set(alias, command);
          }
        }
        
        this.logger.info(`Loaded prefix command: ${command.name}`);
      }
    } catch (error) {
      this.logger.error(`Error loading command from ${filePath}:`, error);
    }
  }

  /**
   * Get all command files recursively
   */
  private getCommandFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getCommandFiles(fullPath));
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
   * Handle slash command interaction
   */
  async handleSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this.slashCommands.get(interaction.commandName);
    
    if (!command) {
      this.logger.warn(`Slash command not found: ${interaction.commandName}`);
      await interaction.reply({ 
        content: '❌ This command is not available.', 
        ephemeral: true 
      });
      return;
    }

    // Check cooldown
    if (!this.checkCooldown(command, interaction.user.id)) {
      const cooldownTime = command.cooldown || 3;
      await interaction.reply({ 
        content: `⏰ Please wait ${cooldownTime} seconds before using this command again.`, 
        ephemeral: true 
      });
      return;
    }

    // Check permissions
    if (!this.checkPermissions(command, interaction.member as GuildMember)) {
      await interaction.reply({ 
        content: '❌ You do not have permission to use this command.', 
        ephemeral: true 
      });
      return;
    }

    try {
      await command.execute(interaction);
      this.setCooldown(command, interaction.user.id);
    } catch (error) {
      this.logger.error(`Error executing slash command ${interaction.commandName}:`, error);
      
      const errorMessage = '❌ There was an error while executing this command!';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }

  /**
   * Handle prefix command message
   */
  async handlePrefixCommand(message: Message): Promise<void> {
    if (!message.content.startsWith(this.prefix)) return;
    
    const args = message.content.slice(this.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    
    if (!commandName) return;
    
    const command = this.prefixCommands.get(commandName);
    
    if (!command) {
      this.logger.debug(`Prefix command not found: ${commandName}`);
      return;
    }

    // Check cooldown
    if (!this.checkCooldown(command, message.author.id)) {
      const cooldownTime = command.cooldown || 3;
      await message.reply(`⏰ Please wait ${cooldownTime} seconds before using this command again.`);
      return;
    }

    // Check permissions
    if (!this.checkPermissions(command, message.member)) {
      await message.reply('❌ You do not have permission to use this command.');
      return;
    }

    try {
      await command.execute(message, args);
      this.setCooldown(command, message.author.id);
    } catch (error) {
      this.logger.error(`Error executing prefix command ${commandName}:`, error);
      await message.reply('❌ There was an error while executing this command!');
    }
  }

  /**
   * Check command cooldown
   */
  private checkCooldown(command: SlashCommand | PrefixCommand, userId: string): boolean {
    const cooldown = command.cooldown || 3;
    const now = Date.now();
    const commandName = this.getCommandName(command);
    const cooldownKey = `${commandName}-${userId}`;
    
    const userCooldowns = this.cooldowns.get(cooldownKey) || [];
    const validCooldowns = userCooldowns.filter(entry => now - entry.timestamp < cooldown * 1000);
    
    if (validCooldowns.length > 0) {
      return false;
    }
    
    return true;
  }

  /**
   * Set command cooldown
   */
  private setCooldown(command: SlashCommand | PrefixCommand, userId: string): void {
    const commandName = this.getCommandName(command);
    const cooldownKey = `${commandName}-${userId}`;
    const now = Date.now();
    
    const userCooldowns = this.cooldowns.get(cooldownKey) || [];
    userCooldowns.push({ userId, timestamp: now });
    
    // Clean old cooldowns
    const cooldown = command.cooldown || 3;
    const validCooldowns = userCooldowns.filter(entry => now - entry.timestamp < cooldown * 1000);
    
    this.cooldowns.set(cooldownKey, validCooldowns);
  }

  /**
   * Get command name from either slash or prefix command
   */
  private getCommandName(command: SlashCommand | PrefixCommand): string {
    if ('name' in command) {
      return command.name;
    } else if ('data' in command) {
      return command.data.name;
    }
    return 'unknown';
  }

  /**
   * Check user permissions for command
   */
  private checkPermissions(command: SlashCommand | PrefixCommand, member?: GuildMember | null): boolean {
    if (!command.permissions || !member) return true;
    
    return member.permissions.has(command.permissions);
  }

  /**
   * Get all slash commands for registration
   */
  getSlashCommands(): SlashCommand[] {
    return Array.from(this.slashCommands.values());
  }

  /**
   * Get command help information
   */
  getCommandHelp(commandName: string): string | null {
    const slashCommand = this.slashCommands.get(commandName);
    const prefixCommand = this.prefixCommands.get(commandName);
    
    const command = slashCommand || prefixCommand;
    if (!command) return null;
    
    const help = [
      `**${commandName}**`,
      `Description: ${command.description || 'No description available'}`,
      `Usage: ${command.usage || 'No usage information'}`,
      `Cooldown: ${command.cooldown || 3} seconds`
    ];
    
    if (command.examples && command.examples.length > 0) {
      help.push(`Examples: ${command.examples.join(', ')}`);
    }
    
    return help.join('\n');
  }

  /**
   * Get all commands by category
   */
  getCommandsByCategory(): Record<string, string[]> {
    const categories: Record<string, string[]> = {};
    
    // Add slash commands
    for (const [name, command] of this.slashCommands) {
      const category = command.category || 'General';
      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
    }
    
    // Add prefix commands
    for (const [name, command] of this.prefixCommands) {
      const category = command.category || 'General';
      if (!categories[category]) categories[category] = [];
      if (!categories[category].includes(name)) {
        categories[category].push(name);
      }
    }
    
    return categories;
  }

  /**
   * Clear all cooldowns
   */
  clearCooldowns(): void {
    this.cooldowns.clear();
    this.logger.info('All command cooldowns cleared');
  }

  /**
   * Get command statistics
   */
  getStats(): { slashCommands: number; prefixCommands: number; categories: number } {
    const categories = this.getCommandsByCategory();
    return {
      slashCommands: this.slashCommands.size,
      prefixCommands: this.prefixCommands.size,
      categories: Object.keys(categories).length
    };
  }
} 