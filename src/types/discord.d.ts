/**
 * Type declarations for Discord.js
 * This file provides type information for Discord.js related code
 */

import { 
  Client, 
  GatewayIntentBits, 
  Guild, 
  Role, 
  ChannelType, 
  PermissionFlagsBits,
  PermissionResolvable,
  OverwriteResolvable,
  TextChannel,
  VoiceChannel,
  CategoryChannel,
  GuildBasedChannel,
  GuildEditOptions,
  GuildChannelCreateOptions,
  Locale,
  GuildChannelManager,
  GuildChannel,
  PermissionOverwriteOptions,
  ChannelResolvable,
  GuildChannelType
} from 'discord.js';

// Re-export Discord.js types for easy access
export {
  Client,
  GatewayIntentBits,
  Guild,
  Role,
  ChannelType,
  PermissionFlagsBits,
  PermissionResolvable,
  OverwriteResolvable,
  TextChannel,
  VoiceChannel,
  CategoryChannel,
  GuildBasedChannel,
  GuildEditOptions,
  GuildChannelCreateOptions,
  Locale,
  GuildChannelManager,
  GuildChannel,
  PermissionOverwriteOptions,
  ChannelResolvable,
  GuildChannelType
};

// Type for server roles
export interface ServerRoles {
  admin: Role;
  moderator: Role;
  member: Role;
  [key: string]: Role;
}

// Type for permission flags
export type PermissionFlags = {
  [K in keyof typeof PermissionFlagsBits]?: boolean | null | undefined;
};

// Type for channel configuration
export interface ChannelConfig {
  name: string;
  type: ChannelType;
  parent?: string | CategoryChannel;
  topic?: string;
  nsfw?: boolean;
  bitrate?: number;
  userLimit?: number;
  rateLimitPerUser?: number;
  permissionOverwrites?: OverwriteResolvable[];
  position?: number;
  reason?: string;
}

// Type for category configuration
export interface CategoryConfig {
  name: string;
  type?: ChannelType.GuildCategory;
  permissionOverwrites?: OverwriteResolvable[];
  position?: number;
  reason?: string;
  channels?: ChannelConfig[];
}
