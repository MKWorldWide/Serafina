import { 
  ChatInputCommandInteraction, 
  UserContextMenuCommandInteraction,
  Message,
  GuildMember,
  PermissionResolvable,
  PermissionsBitField
} from 'discord.js';
import { createLogger } from '../pino-logger';
import { 
  hasPermissions, 
  botHasPermissions, 
  isOwner, 
  isGuildAdmin, 
  isDMChannel,
  isGuildTextChannel,
  formatMissingPermissions,
  isGuildOnly,
  isDMAllowed,
  canModerateUser,
  hasRole,
  hasAnyRole,
  hasAllRoles
} from '../utils/permissions';
import { config } from '../config';

type GuardFunction<T> = (context: T) => Promise<boolean> | boolean;

type GuardResult = {
  success: boolean;
  message?: string;
  code?: string;
};

const logger = createLogger('guards');

/**
 * Base guard interface
 */
export interface IGuard<T> {
  execute(context: T): Promise<GuardResult>;
}

/**
 * Base guard class
 */
export abstract class BaseGuard<T> implements IGuard<T> {
  abstract execute(context: T): Promise<GuardResult>;
  
  protected success(): GuardResult {
    return { success: true };
  }
  
  protected failure(message: string, code?: string): GuardResult {
    return { success: false, message, code };
  }
}

/**
 * Guard for checking if a command is owner-only
 */
export class OwnerOnlyGuard extends BaseGuard<{
  userId: string;
  interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction | Message;
}> {
  async execute({ userId, interaction }): Promise<GuardResult> {
    if (!isOwner(userId)) {
      return this.failure(
        'This command can only be used by the bot owner.',
        'OWNER_ONLY'
      );
    }
    
    return this.success();
  }
}

/**
 * Guard for checking if a command is guild-only
 */
export class GuildOnlyGuard extends BaseGuard<{
  interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction;
}> {
  async execute({ interaction }): Promise<GuardResult> {
    if (!isGuildOnly(interaction)) {
      return this.failure(
        'This command can only be used in a server.',
        'GUILD_ONLY'
      );
    }
    
    return this.success();
  }
}

/**
 * Guard for checking if a command is DM-only
 */
export class DMOnlyGuard extends BaseGuard<{
  interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction;
}> {
  async execute({ interaction }): Promise<GuardResult> {
    if (!isDMAllowed(interaction)) {
      return this.failure(
        'This command can only be used in DMs.',
        'DM_ONLY'
      );
    }
    
    return this.success();
  }
}

/**
 * Guard for checking user permissions
 */
export class UserPermissionsGuard extends BaseGuard<{
  member: GuildMember;
  permissions: PermissionResolvable[];
  checkAdmin?: boolean;
}> {
  async execute({ member, permissions, checkAdmin = true }): Promise<GuardResult> {
    const { result, missing } = hasPermissions(member, permissions, checkAdmin);
    
    if (!result) {
      return this.failure(
        `You need the following permissions to use this command: ${formatMissingPermissions(missing)}`,
        'MISSING_PERMISSIONS'
      );
    }
    
    return this.success();
  }
}

/**
 * Guard for checking bot permissions
 */
export class BotPermissionsGuard extends BaseGuard<{
  channel: any; // GuildTextBasedChannel | DMChannel | null
  permissions: PermissionResolvable[];
  checkAdmin?: boolean;
}> {
  async execute({ channel, permissions, checkAdmin = true }): Promise<GuardResult> {
    const { result, missing } = botHasPermissions(channel, permissions, checkAdmin);
    
    if (!result) {
      return this.failure(
        `I need the following permissions to execute this command: ${formatMissingPermissions(missing)}`,
        'BOT_MISSING_PERMISSIONS'
      );
    }
    
    return this.success();
  }
}

/**
 * Guard for checking if a user is a guild admin
 */
export class GuildAdminGuard extends BaseGuard<{
  member: GuildMember;
}> {
  async execute({ member }): Promise<GuardResult> {
    if (!isGuildAdmin(member)) {
      return this.failure(
        'This command can only be used by server administrators.',
        'GUILD_ADMIN_REQUIRED'
      );
    }
    
    return this.success();
  }
}

/**
 * Guard for checking if a user has a specific role
 */
export class HasRoleGuard extends BaseGuard<{
  member: GuildMember;
  roleId: string;
}> {
  async execute({ member, roleId }): Promise<GuardResult> {
    if (!hasRole(member, roleId)) {
      const role = member.guild.roles.cache.get(roleId);
      return this.failure(
        `You need the ${role?.name || 'required'} role to use this command.`,
        'MISSING_ROLE'
      );
    }
    
    return this.success();
  }
}

/**
 * Guard for checking if a user has any of the specified roles
 */
export class HasAnyRoleGuard extends BaseGuard<{
  member: GuildMember;
  roleIds: string[];
}> {
  async execute({ member, roleIds }): Promise<GuardResult> {
    if (!hasAnyRole(member, roleIds)) {
      const roles = roleIds
        .map(id => member.guild.roles.cache.get(id)?.name || id)
        .join(' or ');
      
      return this.failure(
        `You need one of the following roles to use this command: ${roles}`,
        'MISSING_ANY_ROLE'
      );
    }
    
    return this.success();
  }
}

/**
 * Guard for checking if a user has all of the specified roles
 */
export class HasAllRolesGuard extends BaseGuard<{
  member: GuildMember;
  roleIds: string[];
}> {
  async execute({ member, roleIds }): Promise<GuardResult> {
    if (!hasAllRoles(member, roleIds)) {
      const roles = roleIds
        .map(id => member.guild.roles.cache.get(id)?.name || id)
        .join(' and ');
      
      return this.failure(
        `You need all of the following roles to use this command: ${roles}`,
        'MISSING_ALL_ROLES'
      );
    }
    
    return this.success();
  }
}

/**
 * Guard for rate limiting commands
 */
export class RateLimitGuard extends BaseGuard<{
  userId: string;
  commandName: string;
  cooldown: number; // in seconds
  store: Map<string, number>;
}> {
  async execute({ userId, commandName, cooldown, store }): Promise<GuardResult> {
    const key = `${userId}:${commandName}`;
    const now = Date.now();
    const cooldownMs = cooldown * 1000;
    
    const lastUsed = store.get(key) || 0;
    const remaining = Math.ceil((lastUsed + cooldownMs - now) / 1000);
    
    if (now < lastUsed + cooldownMs) {
      return this.failure(
        `Please wait ${remaining} more second(s) before using this command again.`,
        'RATE_LIMITED'
      );
    }
    
    // Update the last used timestamp
    store.set(key, now);
    
    // Schedule cleanup of the store to prevent memory leaks
    setTimeout(() => {
      if (store.get(key) === now) {
        store.delete(key);
      }
    }, cooldownMs);
    
    return this.success();
  }
}

/**
 * Guard for checking if a user can moderate another user
 */
export class CanModerateUserGuard extends BaseGuard<{
  moderator: GuildMember;
  target: GuildMember;
  action: 'warn' | 'mute' | 'kick' | 'ban';
}> {
  async execute({ moderator, target, action }): Promise<GuardResult> {
    if (!canModerateUser(moderator, target, action)) {
      return this.failure(
        `You don't have permission to ${action} this user.`,
        `CANNOT_${action.toUpperCase()}`
      );
    }
    
    return this.success();
  }
}

/**
 * Guard for checking if the bot is in maintenance mode
 */
export class MaintenanceGuard extends BaseGuard<{
  interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction | Message;
}> {
  async execute({ interaction }): Promise<GuardResult> {
    if (config.maintenance.enabled && !config.owners.includes(interaction.user.id)) {
      return this.failure(
        config.maintenance.message || 'The bot is currently under maintenance. Please try again later.',
        'MAINTENANCE_MODE'
      );
    }
    
    return this.success();
  }
}

/**
 * Composes multiple guards into a single guard
 */
export function composeGuards<T>(...guards: Array<new () => IGuard<T>>): IGuard<T> {
  return {
    async execute(context: T): Promise<GuardResult> {
      for (const Guard of guards) {
        const guard = new Guard();
        const result = await guard.execute(context);
        
        if (!result.success) {
          return result;
        }
      }
      
      return { success: true };
    },
  };
}

/**
 * Creates a guard from a function
 */
export function createGuard<T>(fn: GuardFunction<T>): IGuard<T> {
  return {
    async execute(context: T): Promise<GuardResult> {
      try {
        const result = await fn(context);
        return {
          success: result,
          message: result ? undefined : 'Guard check failed',
          code: 'GUARD_CHECK_FAILED',
        };
      } catch (error) {
        logger.error('Error in guard function:', error);
        return {
          success: false,
          message: 'An error occurred while checking permissions.',
          code: 'GUARD_ERROR',
        };
      }
    },
  };
}

/**
 * Creates a guard that requires all conditions to be true
 */
export function allOf<T>(...guards: Array<IGuard<T>>): IGuard<T> {
  return {
    async execute(context: T): Promise<GuardResult> {
      for (const guard of guards) {
        const result = await guard.execute(context);
        if (!result.success) {
          return result;
        }
      }
      return { success: true };
    },
  };
}

/**
 * Creates a guard that requires at least one condition to be true
 */
export function anyOf<T>(...guards: Array<IGuard<T>>): IGuard<T> {
  return {
    async execute(context: T): Promise<GuardResult> {
      const errors: GuardResult[] = [];
      
      for (const guard of guards) {
        const result = await guard.execute(context);
        if (result.success) {
          return { success: true };
        }
        errors.push(result);
      }
      
      // If we get here, all guards failed
      return {
        success: false,
        message: errors.map(e => e.message).join(' OR '),
        code: errors.map(e => e.code || 'GUARD_FAILED').join('_OR_'),
      };
    },
  };
}
