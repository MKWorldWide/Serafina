import { 
  PermissionFlagsBits, 
  PermissionsBitField, 
  GuildMember, 
  ChatInputCommandInteraction,
  Message,
  UserContextMenuCommandInteraction,
  Guild,
  GuildTextBasedChannel,
  DMChannel,
  PartialDMChannel,
  ThreadChannel,
  NewsChannel,
  TextChannel,
  VoiceChannel,
  CategoryChannel,
  ForumChannel,
  StageChannel,
  PermissionResolvable,
  ApplicationCommandPermissionData,
  Role,
  User
} from 'discord.js';
import { createLogger } from '../pino-logger';
import { config } from '../config';

const logger = createLogger('permissions');

type PermissionResult = {
  result: boolean;
  missing: string[];
};

/**
 * Check if a member has the required permissions
 */
export function hasPermissions(
  member: GuildMember,
  permissions: PermissionResolvable[],
  checkAdmin = true
): PermissionResult {
  const missing: string[] = [];
  
  // Check if the member has administrator permissions
  if (checkAdmin && member.permissions.has(PermissionFlagsBits.Administrator)) {
    return { result: true, missing: [] };
  }
  
  // Check each required permission
  for (const permission of permissions) {
    if (!member.permissions.has(permission)) {
      missing.push(
        typeof permission === 'string' 
          ? permission 
          : new PermissionsBitField([permission]).toArray()[0]
      );
    }
  }
  
  return {
    result: missing.length === 0,
    missing
  };
}

/**
 * Check if the bot has the required permissions in a channel
 */
export function botHasPermissions(
  channel: GuildTextBasedChannel | null,
  permissions: PermissionResolvable[],
  checkAdmin = true
): PermissionResult {
  if (!channel || !('guild' in channel)) {
    return { result: true, missing: [] }; // DMs don't have permissions
  }
  
  const me = channel.guild.members.me;
  if (!me) {
    return { result: false, missing: ['Bot not found in guild'] };
  }
  
  // Check if the bot has administrator permissions
  if (checkAdmin && me.permissions.has(PermissionFlagsBits.Administrator)) {
    return { result: true, missing: [] };
  }
  
  const missing: string[] = [];
  
  // Check each required permission
  for (const permission of permissions) {
    if (!channel.permissionsFor(me)?.has(permission)) {
      missing.push(
        typeof permission === 'string' 
          ? permission 
          : new PermissionsBitField([permission]).toArray()[0]
      );
    }
  }
  
  return {
    result: missing.length === 0,
    missing
  };
}

/**
 * Check if a user is a bot owner
 */
export function isOwner(userId: string): boolean {
  return config.owners.includes(userId);
}

/**
 * Check if a user is a guild admin
 */
export function isGuildAdmin(member: GuildMember): boolean {
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    isOwner(member.id) ||
    member.roles.cache.some(role => role.permissions.has(PermissionFlagsBits.Administrator))
  );
}

/**
 * Check if a channel is a DM channel
 */
export function isDMChannel(
  channel: GuildTextBasedChannel | DMChannel | PartialDMChannel | null | undefined
): channel is DMChannel | PartialDMChannel {
  return channel?.type === 'DM';
}

/**
 * Check if a channel is a guild text channel
 */
export function isGuildTextChannel(
  channel: GuildTextBasedChannel | DMChannel | PartialDMChannel | null | undefined
): channel is TextChannel | NewsChannel | ThreadChannel {
  if (!channel) return false;
  return [
    'GUILD_TEXT',
    'GUILD_NEWS',
    'GUILD_NEWS_THREAD',
    'GUILD_PUBLIC_THREAD',
    'GUILD_PRIVATE_THREAD'
  ].includes(channel.type);
}

/**
 * Check if a channel is a voice channel
 */
export function isVoiceChannel(
  channel: GuildTextBasedChannel | DMChannel | PartialDMChannel | VoiceChannel | StageChannel | null | undefined
): channel is VoiceChannel | StageChannel {
  if (!channel) return false;
  return ['GUILD_VOICE', 'GUILD_STAGE_VOICE'].includes(channel.type);
}

/**
 * Check if a channel is a category
 */
export function isCategoryChannel(
  channel: GuildTextBasedChannel | DMChannel | PartialDMChannel | CategoryChannel | null | undefined
): channel is CategoryChannel {
  return channel?.type === 'GUILD_CATEGORY';
}

/**
 * Check if a channel is a forum channel
 */
export function isForumChannel(
  channel: GuildTextBasedChannel | DMChannel | PartialDMChannel | ForumChannel | null | undefined
): channel is ForumChannel {
  return channel?.type === 'GUILD_FORUM';
}

/**
 * Check if a command can be used in a DM
 */
export function isDMAllowed(interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction): boolean {
  return interaction.inGuild() ? false : true;
}

/**
 * Check if a command can be used in a guild
 */
export function isGuildOnly(interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction): boolean {
  return interaction.inGuild();
}

/**
 * Get the required permissions for a command
 */
export function getRequiredPermissions(interaction: ChatInputCommandInteraction): PermissionResolvable[] {
  // Default required permissions
  const defaultPermissions: PermissionResolvable[] = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
  ];
  
  // Add command-specific permissions here
  // Example:
  // if (interaction.commandName === 'ban') {
  //   return [...defaultPermissions, PermissionFlagsBits.BanMembers];
  // }
  
  return defaultPermissions;
}

/**
 * Format missing permissions for display
 */
export function formatMissingPermissions(permissions: string[]): string {
  return permissions
    .map(perm => {
      // Convert SNAKE_CASE to Title Case
      return perm
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    })
    .join(', ');
}

/**
 * Check if a user has a specific role
 */
export function hasRole(member: GuildMember, roleId: string): boolean {
  return member.roles.cache.has(roleId);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(member: GuildMember, roleIds: string[]): boolean {
  return roleIds.some(roleId => member.roles.cache.has(roleId));
}

/**
 * Check if a user has all of the specified roles
 */
export function hasAllRoles(member: GuildMember, roleIds: string[]): boolean {
  return roleIds.every(roleId => member.roles.cache.has(roleId));
}

/**
 * Check if a user can manage a specific role
 */
export function canManageRole(executor: GuildMember, targetRole: Role): boolean {
  // The owner can manage any role
  if (isOwner(executor.id)) {
    return true;
  }
  
  // Users can't manage roles higher than their highest role
  const highestExecutorRole = executor.roles.highest;
  if (targetRole.comparePositionTo(highestExecutorRole) >= 0) {
    return false;
  }
  
  // Check if the user has the ManageRoles permission
  return executor.permissions.has(PermissionFlagsBits.ManageRoles);
}

/**
 * Check if a user can moderate another user
 */
export function canModerateUser(
  moderator: GuildMember,
  target: GuildMember | User,
  action: 'warn' | 'mute' | 'kick' | 'ban' = 'warn'
): boolean {
  // Can't moderate the bot owner
  if (isOwner(target.id)) {
    return false;
  }
  
  // Bot owners can moderate anyone
  if (isOwner(moderator.id)) {
    return true;
  }
  
  // Can't moderate users in DMs
  if (!moderator.guild) {
    return false;
  }
  
  // If the target is not a GuildMember (DM), only owners can moderate
  if (!(target instanceof GuildMember)) {
    return isOwner(moderator.id);
  }
  
  // Can't moderate yourself
  if (moderator.id === target.id) {
    return false;
  }
  
  // Check if the target is a bot owner
  if (isOwner(target.id)) {
    return false;
  }
  
  // Check if the moderator has the required permissions
  switch (action) {
    case 'warn':
    case 'mute':
      return (
        moderator.permissions.has(PermissionFlagsBits.ModerateMembers) ||
        moderator.permissions.has(PermissionFlagsBits.KickMembers) ||
        moderator.permissions.has(PermissionFlagsBits.BanMembers) ||
        isGuildAdmin(moderator)
      );
      
    case 'kick':
      return (
        (moderator.permissions.has(PermissionFlagsBits.KickMembers) ||
         moderator.permissions.has(PermissionFlagsBits.BanMembers) ||
         isGuildAdmin(moderator)) &&
        moderator.roles.highest.position > target.roles.highest.position
      );
      
    case 'ban':
      return (
        (moderator.permissions.has(PermissionFlagsBits.BanMembers) ||
         isGuildAdmin(moderator)) &&
        moderator.roles.highest.position > target.roles.highest.position
      );
      
    default:
      return false;
  }
}
