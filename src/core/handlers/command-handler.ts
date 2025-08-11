import { 
  ChatInputCommandInteraction, 
  UserContextMenuCommandInteraction, 
  Message, 
  Collection, 
  GuildMember,
  PermissionResolvable,
  PermissionsBitField,
  ApplicationCommandType,
  EmbedBuilder,
  Colors
} from 'discord.js';
import { createLogger } from '../pino-logger';
import { 
  IGuard, 
  allOf, 
  anyOf, 
  composeGuards, 
  OwnerOnlyGuard, 
  GuildOnlyGuard, 
  DMOnlyGuard,
  UserPermissionsGuard,
  BotPermissionsGuard,
  GuildAdminGuard,
  HasRoleGuard,
  HasAnyRoleGuard,
  HasAllRolesGuard,
  RateLimitGuard,
  CanModerateUserGuard,
  MaintenanceGuard
} from '../middleware/guards';
import { config } from '../config';
import { 
  CommandError, 
  CooldownError, 
  PermissionError, 
  OwnerOnlyError, 
  GuildOnlyError, 
  DmOnlyError, 
  MaintenanceError, 
  ValidationError, 
  NotFoundError,
  handleCommandError,
  withErrorHandling
} from '../utils/error-handler';
import { cooldownManager, CooldownOptions } from '../utils/cooldown-manager';

const logger = createLogger('command-handler');

type CommandCategory = 'utility' | 'moderation' | 'fun' | 'admin' | 'configuration' | 'information';

type CommandOptions = {
  name: string;
  description: string;
  category: CommandCategory;
  aliases?: string[];
  cooldown?: number | CooldownOptions; // in seconds or custom cooldown options
  guildOnly?: boolean;
  dmOnly?: boolean;
  ownerOnly?: boolean;
  userPermissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  requiredRoles?: string[];
  anyRole?: string[];
  allRoles?: string[];
  nsfw?: boolean;
  hidden?: boolean;
  enabled?: boolean;
  guards?: IGuard<any>[];
  errorHandler?: (error: unknown, context: CommandExecuteContext) => Promise<void> | void;
};

type CommandExecuteContext = {
  interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction;
  message?: never;
} | {
  interaction?: never;
  message: Message;
};

type CommandExecuteFunction = (context: CommandExecuteContext) => Promise<void> | void;

interface ICommand {
  options: CommandOptions;
  execute: CommandExecuteFunction;
  cooldowns: Collection<string, number>;
}

/**
 * Base command class
 */
export abstract class BaseCommand implements ICommand {
  public options: CommandOptions;
  public cooldowns = new Collection<string, number>();
  
  constructor(options: Partial<CommandOptions> & { name: string; description: string }) {
    this.options = {
      name: options.name,
      description: options.description,
      category: options.category || 'utility',
      aliases: options.aliases || [],
      cooldown: options.cooldown ?? 3, // Default 3 second cooldown
      guildOnly: options.guildOnly ?? false,
      dmOnly: options.dmOnly ?? false,
      ownerOnly: options.ownerOnly ?? false,
      userPermissions: options.userPermissions || [],
      botPermissions: options.botPermissions || [
        'ViewChannel',
        'SendMessages',
        'EmbedLinks',
      ],
      requiredRoles: options.requiredRoles || [],
      anyRole: options.anyRole || [],
      allRoles: options.allRoles || [],
      nsfw: options.nsfw ?? false,
      hidden: options.hidden ?? false,
      enabled: options.enabled ?? true,
      guards: options.guards || [],
    };
  }
  
  /**
   * Execute the command
   */
  public abstract execute(context: CommandExecuteContext): Promise<void> | void;
  
  /**
   * Get the command's guards
   */
  public getGuards(): IGuard<unknown>[] {
    const guards: IGuard<unknown>[] = [];
    
    // Add maintenance guard
    if (config.maintenance.enabled) {
      guards.push(new MaintenanceGuard());
    }
    
    // Add owner-only guard
    if (this.options.ownerOnly) {
      guards.push(new OwnerOnlyGuard());
    }
    
    // Add guild-only guard
    if (this.options.guildOnly) {
      guards.push(new GuildOnlyGuard());
    }
    
    // Add DM-only guard
    if (this.options.dmOnly) {
      guards.push(new DMOnlyGuard());
    }
    
    // Add user permissions guard
    if (this.options.userPermissions && this.options.userPermissions.length > 0) {
      guards.push(
        new (class extends UserPermissionsGuard {
          async execute({ interaction, message }: CommandExecuteContext) {
            const member = interaction?.member as GuildMember || message?.member as GuildMember;
            if (!member) return { success: true }; // Skip if no member (DM)
            
            return super.execute({ 
              member, 
              permissions: this.options.userPermissions as PermissionResolvable[],
              checkAdmin: true
            });
          }
        })()
      );
    }
    
    // Add bot permissions guard
    if (this.options.botPermissions && this.options.botPermissions.length > 0) {
      guards.push(
        new (class extends BotPermissionsGuard {
          async execute({ interaction, message }: CommandExecuteContext) {
            const channel = interaction?.channel || message?.channel;
            if (!channel) return { success: true }; // Skip if no channel
            
            return super.execute({ 
              channel, 
              permissions: this.options.botPermissions as PermissionResolvable[],
              checkAdmin: true
            });
          }
        })()
      );
    }
    
    // Add required roles guard
    if (this.options.requiredRoles && this.options.requiredRoles.length > 0) {
      guards.push(
        new (class extends HasRoleGuard {
          async execute({ interaction, message }: CommandExecuteContext) {
            const member = interaction?.member as GuildMember || message?.member as GuildMember;
            if (!member) return { success: false, message: 'This command can only be used in a server.' };
            
            // Check each required role
            for (const roleId of this.options.requiredRoles as string[]) {
              const result = await super.execute({ member, roleId });
              if (!result.success) return result;
            }
            
            return { success: true };
          }
        })()
      );
    }
    
    // Add any role guard
    if (this.options.anyRole && this.options.anyRole.length > 0) {
      guards.push(
        new (class extends HasAnyRoleGuard {
          async execute({ interaction, message }: CommandExecuteContext) {
            const member = interaction?.member as GuildMember || message?.member as GuildMember;
            if (!member) return { success: false, message: 'This command can only be used in a server.' };
            
            return super.execute({ 
              member, 
              roleIds: this.options.anyRole as string[] 
            });
          }
        })()
      );
    }
    
    // Add all roles guard
    if (this.options.allRoles && this.options.allRoles.length > 0) {
      guards.push(
        new (class extends HasAllRolesGuard {
          async execute({ interaction, message }: CommandExecuteContext) {
            const member = interaction?.member as GuildMember || message?.member as GuildMember;
            if (!member) return { success: false, message: 'This command can only be used in a server.' };
            
            return super.execute({ 
              member, 
              roleIds: this.options.allRoles as string[] 
            });
          }
        })()
      );
    }
    
    // Add cooldown guard
    if (this.options.cooldown && this.options.cooldown > 0) {
      guards.push(
        new (class extends RateLimitGuard {
          async execute({ interaction, message }: CommandExecuteContext) {
            const userId = interaction?.user.id || message?.author.id;
            if (!userId) return { success: true }; // Shouldn't happen, but just in case
            
            return super.execute({ 
              userId, 
              commandName: this.options.name, 
              cooldown: this.options.cooldown as number,
              store: this.cooldowns
            });
          }
        })()
      );
    }
    
    // Add custom guards
    if (this.options.guards && this.options.guards.length > 0) {
      guards.push(...this.options.guards);
    }
    
    return guards;
  }
  
  /**
   * Check if the command is enabled
   */
  public isEnabled(): boolean {
    return this.options.enabled !== false;
  }
  
  /**
   * Check if the command can be used in DMs
   */
  public isDmAllowed(): boolean {
    return !this.options.guildOnly;
  }
  
  /**
   * Check if the command is owner-only
   */
  public isOwnerOnly(): boolean {
    return this.options.ownerOnly === true;
  }
  
  /**
   * Get the command's name
   */
  public getName(): string {
    return this.options.name;
  }
  
  /**
   * Get the command's description
   */
  public getDescription(): string {
    return this.options.description;
  }
  
  /**
   * Get the command's category
   */
  public getCategory(): CommandCategory {
    return this.options.category;
  }
  
  /**
   * Get the command's aliases
   */
  public getAliases(): string[] {
    return this.options.aliases || [];
  }
  
  /**
   * Get the command's cooldown
   */
  public getCooldown(): number {
    return this.options.cooldown || 0;
  }
  
  /**
   * Get the command's required user permissions
   */
  public getUserPermissions(): PermissionResolvable[] {
    return this.options.userPermissions || [];
  }
  
  /**
   * Get the command's required bot permissions
   */
  public getBotPermissions(): PermissionResolvable[] {
    return this.options.botPermissions || [];
  }
}

/**
 * Command handler class
 */
export class CommandHandler {
  private commands = new Collection<string, ICommand>();
  private aliases = new Collection<string, string>();
  private categories = new Set<string>();
  private logger = createLogger('command-handler');
  
  /**
   * Register a command
   */
  public register(command: ICommand): void {
    if (!command.isEnabled()) {
      this.logger.debug(`Skipping disabled command: ${command.options.name}`);
      return;
    }
    
    // Add the main command
    this.commands.set(command.options.name, command);
    this.categories.add(command.options.category);
    
    // Add aliases
    if (command.options.aliases && command.options.aliases.length > 0) {
      for (const alias of command.options.aliases) {
        this.aliases.set(alias, command.options.name);
      }
    }
    
    this.logger.debug(`Registered command: ${command.options.name}`);
  }
  
  /**
   * Register multiple commands
   */
  public registerAll(commands: ICommand[]): void {
    for (const command of commands) {
      this.register(command);
    }
  }
  
  /**
   * Get a command by name or alias
   */
  public getCommand(name: string): ICommand | undefined {
    // Check direct match first
    const command = this.commands.get(name);
    if (command) return command;
    
    // Check aliases
    const alias = this.aliases.get(name);
    if (alias) {
      return this.commands.get(alias);
    }
    
    return undefined;
  }
  
  /**
   * Get all commands
   */
  public getCommands(): ICommand[] {
    return Array.from(this.commands.values());
  }
  
  /**
   * Get commands by category
   */
  public getCommandsByCategory(category: string): ICommand[] {
    return Array.from(this.commands.values())
      .filter(cmd => cmd.options.category === category && !cmd.options.hidden);
  }
  
  /**
   * Get all categories
   */
  public getCategories(): string[] {
    return Array.from(this.categories);
  }
  
  /**
   * Handle a command interaction
   */
  public async handleInteraction(interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction): Promise<void> {
    if (!interaction.isCommand() && !interaction.isUserContextMenuCommand()) return;
    
    const command = this.getCommand(interaction.commandName);
    if (!command) {
      this.logger.warn(`Unknown command: ${interaction.commandName}`);
      
      // Send an ephemeral error message
      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle('❌ Unknown Command')
        .setDescription('The command you tried to use does not exist. Use `/help` to see available commands.');
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          embeds: [embed],
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          embeds: [embed],
          ephemeral: true 
        });
      }
      
      return;
    }
    
    // Log command execution attempt
    this.logger.info(`[${interaction.id}] Command executed: ${command.options.name} by ${interaction.user.tag} (${interaction.user.id})`);
    
    // Defer the reply if the command takes longer than 2 seconds
    const deferPromise = interaction.deferReply({ 
      ephemeral: command.options.ephemeral !== false 
    }).catch(error => {
      this.logger.error('Failed to defer reply:', error);
    });
    
    try {
      // Execute the command with guards and error handling
      await command.executeWithGuards({ interaction });
      
      // If the command didn't send any response, send a default success message
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: '✅ Command executed successfully!',
          ephemeral: true 
        });
      }
    } catch (error) {
      // Handle the error
      await handleCommandError(error, { interaction });
    } finally {
      // Make sure we don't leave any pending promises
      await deferPromise.catch(() => {});
    }
  }
  
  /**
   * Handle a message command
   */
  public async handleMessage(message: Message, prefix: string): Promise<void> {
    if (message.author.bot) return;
    
    // Check if the message starts with the prefix
    if (!message.content.startsWith(prefix)) return;
    
    // Parse the command name and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    
    if (!commandName) return;
    
    const command = this.getCommand(commandName);
    if (!command) {
      // Send a reply for unknown commands if the message starts with the bot's mention
      if (message.mentions.has(message.client.user!)) {
        const embed = new EmbedBuilder()
          .setColor(Colors.Red)
          .setTitle('❌ Unknown Command')
          .setDescription(`The command \`${commandName}\` does not exist. Use \`${prefix}help\` to see available commands.`);
        
        await message.reply({ embeds: [embed] });
      }
      return;
    }
    
    // Log command execution attempt
    this.logger.info(`[${message.id}] Command executed: ${command.options.name} by ${message.author.tag} (${message.author.id})`);
    
    try {
      // Execute the command with guards and error handling
      await command.executeWithGuards({ message });
    } catch (error) {
      // Handle the error
      await handleCommandError(error, { message });
    }
  }
  
  /**
   * Get the cooldown time remaining for a user
   */
  public getCooldownRemaining(
    commandName: string, 
    userId: string, 
    channelId?: string | null, 
    guildId?: string | null
  ): number | null {
    const command = this.getCommand(commandName);
    if (!command || !command.options.cooldown) return null;
    
    const cooldownMs = typeof command.options.cooldown === 'number'
      ? command.options.cooldown * 1000
      : command.options.cooldown.duration;
      
    const remaining = cooldownManager.getRemaining(
      commandName,
      typeof command.options.cooldown === 'number'
        ? { type: 'user', duration: cooldownMs }
        : command.options.cooldown,
      [userId, channelId || null, guildId || null]
    );
    
    return remaining > 0 ? Math.ceil(remaining / 1000) : null;
  }
  
  /**
   * Reset the cooldown for a user
   */
  public resetCooldown(
    commandName: string, 
    userId: string, 
    channelId?: string | null, 
    guildId?: string | null
  ): boolean {
    const command = this.getCommand(commandName);
    if (!command || !command.options.cooldown) return false;
    
    const cooldownType = typeof command.options.cooldown === 'number'
      ? 'user'
      : command.options.cooldown.type;
      
    return cooldownManager.resetCooldown(
      commandName,
      cooldownType,
      [userId, channelId || null, guildId || null]
    );
  }
}

/**
 * Command class
 */
export class Command {
  public options: CommandOptions;
  private guards: Guard[];
  
  constructor(options: CommandOptions) {
    this.options = options;
    this.guards = [];
  }
  
  /**
   * Check if the command is enabled
   */
  public isEnabled(): boolean {
    return this.options.enabled !== false;
  }
  
  /**
   * Get the command's required user permissions
   */
  public getUserPermissions(): PermissionResolvable[] {
    return this.options.userPermissions || [];
  }
  
  /**
   * Get the command's required bot permissions
   */
  public getBotPermissions(): PermissionResolvable[] {
    return this.options.botPermissions || [];
  }
  
  /**
   * Execute the command with all guards and error handling
   */
  @withErrorHandling
  public async executeWithGuards(context: CommandExecuteContext): Promise<void> {
    const { interaction, message } = context;
    const userId = interaction?.user.id || message?.author.id;
    const channelId = interaction?.channelId || message?.channelId;
    const guildId = interaction?.guildId || message?.guildId;
    
    if (!userId) {
      throw new CommandError('Could not determine user ID', {
        code: 'INVALID_USER',
        isUserFacing: false
      });
    }
    
    // Check cooldown if applicable
    if (this.options.cooldown) {
      const cooldownMs = typeof this.options.cooldown === 'number' 
        ? this.options.cooldown * 1000 
        : this.options.cooldown.duration;
        
      const remaining = cooldownManager.getRemaining(
        this.options.name,
        typeof this.options.cooldown === 'number' 
          ? { type: 'user', duration: cooldownMs }
          : this.options.cooldown,
        [userId, channelId, guildId]
      );
      
      if (remaining > 0) {
        throw new CooldownError(Math.ceil(remaining / 1000));
      }
    }
    
    // Execute all guards
    const guards = this.getGuards();
    for (const guard of guards) {
      const result = await guard.execute(context);
      if (!result.success) {
        throw new CommandError(result.message || 'Command execution not allowed', {
          code: result.code || 'GUARD_FAILED',
          isUserFacing: true
        });
      }
    }
    
    try {
      // Execute the command
      await this.execute(context);
      
      // Set cooldown after successful execution
      if (this.options.cooldown) {
        const cooldownMs = typeof this.options.cooldown === 'number' 
          ? this.options.cooldown * 1000 
          : this.options.cooldown.duration;
          
        cooldownManager.setCooldown(
          this.options.name,
          typeof this.options.cooldown === 'number'
            ? { type: 'user', duration: cooldownMs }
            : this.options.cooldown,
          [userId, channelId, guildId]
        );
      }
    } catch (error) {
      // If the command has a custom error handler, use it
      if (this.options.errorHandler) {
        await this.options.errorHandler(error, context);
      }
      
      // Re-throw the error to be handled by the global error handler
      throw error;
    }
  }
  
  /**
   * Get the guards for this command
   */
  public getGuards(): Guard[] {
    return this.guards;
  }
  
  /**
   * Add a guard to this command
   */
  public addGuard(guard: Guard): void {
    this.guards.push(guard);
  }
  
  /**
   * Execute the command
   */
  public async execute(context: CommandExecuteContext): Promise<void> {
    // To be implemented by subclasses
  }
}
