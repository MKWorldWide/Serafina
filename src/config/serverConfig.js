"use strict";
/**
 * 🎮 GameDin Discord Server Configuration
 *
 * This file contains all the configuration for the Discord server structure,
 * including categories, channels, roles, and permissions.
 *
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_CONFIG = exports.xpSettings = exports.autoModSettings = exports.serverSettings = exports.welcomeMessage = exports.serverRoles = exports.serverCategories = void 0;
const discord_js_1 = require("discord.js");
/**
 * Server categories configuration
 * Defines the structure and channels for each category
 */
exports.serverCategories = {
    '🌀 GameDin Core': {
        description: 'Core channels for community management and announcements',
        channels: [
            {
                name: 'welcome',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Welcome new members to the community',
                permissions: {
                    everyone: {
                        SendMessages: false,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'rules-and-purpose',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Server rules and community guidelines',
                permissions: {
                    everyone: {
                        SendMessages: false,
                        AddReactions: false,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'introduce-yourself',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Introduce yourself to the community',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'announcements',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Important server announcements',
                permissions: {
                    everyone: {
                        SendMessages: false,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'role-select',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Select your gaming preferences and roles',
                permissions: {
                    everyone: {
                        SendMessages: false,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
        ],
    },
    '💬 Unity Circle': {
        description: 'Community interaction and social channels',
        channels: [
            {
                name: 'gaming-chat',
                type: discord_js_1.ChannelType.GuildText,
                description: 'General gaming discussion',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'memes-and-chaos',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Share memes and have fun',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'vent-channel',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Safe space to vent and get support',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: false,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'coven-circle',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Close-knit community discussions',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'after-dark',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Late night gaming and chat',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'holy-quotes',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Share inspiring quotes and wisdom',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
        ],
    },
    '🎮 Game Rooms': {
        description: 'Game-specific channels and matchmaking',
        channels: [
            {
                name: 'matchmaking',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Find teammates for your favorite games',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'roblox-din',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Roblox gaming community',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'fortnite-legion',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Fortnite players unite',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'fighting-games',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Fighting game enthusiasts',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'suggest-a-game',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Suggest new games to play together',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
        ],
    },
    '🎥 Spotlight': {
        description: 'Showcase your content and achievements',
        channels: [
            {
                name: 'your-streams',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Share your gaming streams',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'epic-moments',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Share your epic gaming moments',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
            {
                name: 'art-and-mods',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Share your gaming art and mods',
                permissions: {
                    everyone: {
                        SendMessages: true,
                        AddReactions: true,
                        ReadMessageHistory: true,
                    },
                },
            },
        ],
    },
    '🔊 GameDin Voice': {
        description: 'Voice channels for gaming and socializing',
        channels: [
            {
                name: '🎤 General Vibe',
                type: discord_js_1.ChannelType.GuildVoice,
                description: 'General voice chat',
                permissions: {
                    everyone: {
                        Connect: true,
                        Speak: true,
                        UseVAD: true,
                    },
                },
            },
            {
                name: '🎮 Game Night VC',
                type: discord_js_1.ChannelType.GuildVoice,
                description: 'Dedicated gaming voice channel',
                permissions: {
                    everyone: {
                        Connect: true,
                        Speak: true,
                        UseVAD: true,
                    },
                },
            },
            {
                name: '🕊️ Chill Lounge',
                type: discord_js_1.ChannelType.GuildVoice,
                description: 'Relaxed voice chat',
                permissions: {
                    everyone: {
                        Connect: true,
                        Speak: true,
                        UseVAD: true,
                    },
                },
            },
            {
                name: '🔒 The Throne Room',
                type: discord_js_1.ChannelType.GuildVoice,
                description: 'Private voice channel for special events',
                permissions: {
                    everyone: {
                        Connect: false,
                        Speak: false,
                        UseVAD: false,
                    },
                },
            },
            {
                name: '🔥 Sacred Flame VC',
                type: discord_js_1.ChannelType.GuildVoice,
                description: 'High energy gaming voice channel',
                permissions: {
                    everyone: {
                        Connect: true,
                        Speak: true,
                        UseVAD: true,
                    },
                },
            },
        ],
    },
    '🛡️ Moderation': {
        description: 'Moderation and staff channels',
        channels: [
            {
                name: 'mod-logs',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Moderation action logs',
                permissions: {
                    everyone: {
                        ViewChannel: false,
                        SendMessages: false,
                        ReadMessageHistory: false,
                    },
                },
            },
            {
                name: 'mod-chat',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Moderator discussions',
                permissions: {
                    everyone: {
                        ViewChannel: false,
                        SendMessages: false,
                        ReadMessageHistory: false,
                    },
                },
            },
            {
                name: 'reports',
                type: discord_js_1.ChannelType.GuildText,
                description: 'User reports and issues',
                permissions: {
                    everyone: {
                        ViewChannel: false,
                        SendMessages: false,
                        ReadMessageHistory: false,
                    },
                },
            },
            {
                name: 'trial-moderators',
                type: discord_js_1.ChannelType.GuildText,
                description: 'Trial moderator discussions',
                permissions: {
                    everyone: {
                        ViewChannel: false,
                        SendMessages: false,
                        ReadMessageHistory: false,
                    },
                },
            },
        ],
    },
};
/**
 * Server roles configuration
 * Defines the role hierarchy and permissions
 */
exports.serverRoles = {
    '👑 Sovereign': {
        color: 0xffd700, // Gold
        permissions: discord_js_1.PermissionFlagsBits.Administrator,
        description: 'Server Owner - Full administrative control',
        position: 5,
        mentionable: true,
        hoist: true,
    },
    '🛡️ Guardian': {
        color: 0xff0000, // Red
        permissions: discord_js_1.PermissionFlagsBits.ModerateMembers |
            discord_js_1.PermissionFlagsBits.ManageMessages |
            discord_js_1.PermissionFlagsBits.ManageChannels |
            discord_js_1.PermissionFlagsBits.KickMembers |
            discord_js_1.PermissionFlagsBits.BanMembers,
        description: 'Senior Moderator - Advanced moderation powers',
        position: 4,
        mentionable: true,
        hoist: true,
    },
    '✨ Seraph': {
        color: 0xff69b4, // Hot Pink
        permissions: discord_js_1.PermissionFlagsBits.ModerateMembers |
            discord_js_1.PermissionFlagsBits.ManageMessages |
            discord_js_1.PermissionFlagsBits.KickMembers,
        description: 'Moderator - Standard moderation powers',
        position: 3,
        mentionable: true,
        hoist: true,
    },
    '🌟 Trial Seraph': {
        color: 0x9370db, // Medium Purple
        permissions: discord_js_1.PermissionFlagsBits.ModerateMembers | discord_js_1.PermissionFlagsBits.ManageMessages,
        description: 'Trial Moderator - Learning moderation',
        position: 2,
        mentionable: true,
        hoist: true,
    },
    '💫 Member': {
        color: 0x00ff00, // Green
        permissions: 0n,
        description: 'Regular Member - Community participant',
        position: 1,
        mentionable: false,
        hoist: false,
    },
};
/**
 * Welcome message configuration
 */
exports.welcomeMessage = {
    title: '🌟 Welcome to GameDin! 🌟',
    description: `Welcome to our sacred gaming community! We're more than just a gaming server - we're a family where unity, laughter, and friendship thrive.

## 🎮 About Us
GameDin is a divine gaming community where players from all walks of life come together to share their passion for gaming, build lasting friendships, and create unforgettable memories.

## 📜 Quick Links
• **Rules**: Check out <#rules-and-purpose> for our community guidelines
• **Introduce Yourself**: Say hello in <#introduce-yourself>
• **Gaming Chat**: Join the conversation in <#gaming-chat>
• **Matchmaking**: Find teammates in <#matchmaking>

## 🎯 Getting Started
1. Read our rules and guidelines
2. Introduce yourself to the community
3. Join voice channels for gaming sessions
4. Participate in community events
5. Make new friends!

## 🛡️ Our Values
• **Respect**: Treat everyone with kindness and respect
• **Unity**: We're stronger together as a community
• **Fun**: Gaming should be enjoyable for everyone
• **Growth**: Help each other improve and learn

We're excited to have you join our family! 🎮✨`,
    color: 0x00ff00,
    thumbnail: 'https://example.com/gamedin-logo.png',
    footer: 'GameDin - Where Gaming Meets Community',
};
/**
 * Server settings configuration
 */
exports.serverSettings = {
    name: 'GameDin - Sacred Gaming Community',
    description: 'A divine gaming community where unity, laughter, and friendship thrive',
    verificationLevel: 1, // Medium
    explicitContentFilter: 1, // Medium
    defaultMessageNotifications: 1, // Mentions only
    systemChannelFlags: 0,
    preferredLocale: 'en-US',
};
/**
 * Auto-moderation settings
 */
exports.autoModSettings = {
    enabled: true,
    spamThreshold: 5,
    mentionThreshold: 5,
    linkFilter: true,
    inviteFilter: true,
    profanityFilter: true,
    capsThreshold: 0.7,
    emojiThreshold: 10,
    actionOnViolation: 'warn', // 'warn', 'mute', 'kick', 'ban'
};
/**
 * XP system settings
 */
exports.xpSettings = {
    enabled: true,
    messageXp: 1,
    voiceXpPerMinute: 2,
    maxDailyXp: 1000,
    levelMultiplier: 100,
    bonusXpChannels: ['gaming-chat', 'memes-and-chaos'],
    excludedChannels: ['mod-logs', 'mod-chat', 'reports'],
};
// Unified server config export
exports.SERVER_CONFIG = {
    categories: exports.serverCategories,
    roles: exports.serverRoles,
    welcomeMessage: exports.welcomeMessage,
    serverSettings: exports.serverSettings,
    autoMod: exports.autoModSettings,
    xp: exports.xpSettings,
};
//# sourceMappingURL=serverConfig.js.map