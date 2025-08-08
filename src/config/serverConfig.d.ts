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
import { ChannelType } from 'discord.js';
/**
 * Server categories configuration
 * Defines the structure and channels for each category
 */
export declare const serverCategories: {
    '\uD83C\uDF00 GameDin Core': {
        description: string;
        channels: {
            name: string;
            type: ChannelType;
            description: string;
            permissions: {
                everyone: {
                    SendMessages: boolean;
                    AddReactions: boolean;
                    ReadMessageHistory: boolean;
                };
            };
        }[];
    };
    '\uD83D\uDCAC Unity Circle': {
        description: string;
        channels: {
            name: string;
            type: ChannelType;
            description: string;
            permissions: {
                everyone: {
                    SendMessages: boolean;
                    AddReactions: boolean;
                    ReadMessageHistory: boolean;
                };
            };
        }[];
    };
    '\uD83C\uDFAE Game Rooms': {
        description: string;
        channels: {
            name: string;
            type: ChannelType;
            description: string;
            permissions: {
                everyone: {
                    SendMessages: boolean;
                    AddReactions: boolean;
                    ReadMessageHistory: boolean;
                };
            };
        }[];
    };
    '\uD83C\uDFA5 Spotlight': {
        description: string;
        channels: {
            name: string;
            type: ChannelType;
            description: string;
            permissions: {
                everyone: {
                    SendMessages: boolean;
                    AddReactions: boolean;
                    ReadMessageHistory: boolean;
                };
            };
        }[];
    };
    '\uD83D\uDD0A GameDin Voice': {
        description: string;
        channels: {
            name: string;
            type: ChannelType;
            description: string;
            permissions: {
                everyone: {
                    Connect: boolean;
                    Speak: boolean;
                    UseVAD: boolean;
                };
            };
        }[];
    };
    '\uD83D\uDEE1\uFE0F Moderation': {
        description: string;
        channels: {
            name: string;
            type: ChannelType;
            description: string;
            permissions: {
                everyone: {
                    ViewChannel: boolean;
                    SendMessages: boolean;
                    ReadMessageHistory: boolean;
                };
            };
        }[];
    };
};
/**
 * Server roles configuration
 * Defines the role hierarchy and permissions
 */
export declare const serverRoles: {
    '\uD83D\uDC51 Sovereign': {
        color: number;
        permissions: bigint;
        description: string;
        position: number;
        mentionable: boolean;
        hoist: boolean;
    };
    '\uD83D\uDEE1\uFE0F Guardian': {
        color: number;
        permissions: bigint;
        description: string;
        position: number;
        mentionable: boolean;
        hoist: boolean;
    };
    '\u2728 Seraph': {
        color: number;
        permissions: bigint;
        description: string;
        position: number;
        mentionable: boolean;
        hoist: boolean;
    };
    '\uD83C\uDF1F Trial Seraph': {
        color: number;
        permissions: bigint;
        description: string;
        position: number;
        mentionable: boolean;
        hoist: boolean;
    };
    '\uD83D\uDCAB Member': {
        color: number;
        permissions: bigint;
        description: string;
        position: number;
        mentionable: boolean;
        hoist: boolean;
    };
};
/**
 * Welcome message configuration
 */
export declare const welcomeMessage: {
    title: string;
    description: string;
    color: number;
    thumbnail: string;
    footer: string;
};
/**
 * Server settings configuration
 */
export declare const serverSettings: {
    name: string;
    description: string;
    verificationLevel: number;
    explicitContentFilter: number;
    defaultMessageNotifications: number;
    systemChannelFlags: number;
    preferredLocale: string;
};
/**
 * Auto-moderation settings
 */
export declare const autoModSettings: {
    enabled: boolean;
    spamThreshold: number;
    mentionThreshold: number;
    linkFilter: boolean;
    inviteFilter: boolean;
    profanityFilter: boolean;
    capsThreshold: number;
    emojiThreshold: number;
    actionOnViolation: string;
};
/**
 * XP system settings
 */
export declare const xpSettings: {
    enabled: boolean;
    messageXp: number;
    voiceXpPerMinute: number;
    maxDailyXp: number;
    levelMultiplier: number;
    bonusXpChannels: string[];
    excludedChannels: string[];
};
export type PermissionConfig = Record<string, boolean>;
export interface ChannelConfig {
    name: string;
    type: ChannelType;
    description: string;
    permissions: Record<string, PermissionConfig>;
}
export interface CategoryConfig {
    description: string;
    channels: ChannelConfig[];
}
export interface RoleConfig {
    color: number;
    permissions: bigint;
    description: string;
    position: number;
    mentionable: boolean;
    hoist: boolean;
}
export declare const SERVER_CONFIG: {
    categories: {
        '\uD83C\uDF00 GameDin Core': {
            description: string;
            channels: {
                name: string;
                type: ChannelType;
                description: string;
                permissions: {
                    everyone: {
                        SendMessages: boolean;
                        AddReactions: boolean;
                        ReadMessageHistory: boolean;
                    };
                };
            }[];
        };
        '\uD83D\uDCAC Unity Circle': {
            description: string;
            channels: {
                name: string;
                type: ChannelType;
                description: string;
                permissions: {
                    everyone: {
                        SendMessages: boolean;
                        AddReactions: boolean;
                        ReadMessageHistory: boolean;
                    };
                };
            }[];
        };
        '\uD83C\uDFAE Game Rooms': {
            description: string;
            channels: {
                name: string;
                type: ChannelType;
                description: string;
                permissions: {
                    everyone: {
                        SendMessages: boolean;
                        AddReactions: boolean;
                        ReadMessageHistory: boolean;
                    };
                };
            }[];
        };
        '\uD83C\uDFA5 Spotlight': {
            description: string;
            channels: {
                name: string;
                type: ChannelType;
                description: string;
                permissions: {
                    everyone: {
                        SendMessages: boolean;
                        AddReactions: boolean;
                        ReadMessageHistory: boolean;
                    };
                };
            }[];
        };
        '\uD83D\uDD0A GameDin Voice': {
            description: string;
            channels: {
                name: string;
                type: ChannelType;
                description: string;
                permissions: {
                    everyone: {
                        Connect: boolean;
                        Speak: boolean;
                        UseVAD: boolean;
                    };
                };
            }[];
        };
        '\uD83D\uDEE1\uFE0F Moderation': {
            description: string;
            channels: {
                name: string;
                type: ChannelType;
                description: string;
                permissions: {
                    everyone: {
                        ViewChannel: boolean;
                        SendMessages: boolean;
                        ReadMessageHistory: boolean;
                    };
                };
            }[];
        };
    };
    roles: {
        '\uD83D\uDC51 Sovereign': {
            color: number;
            permissions: bigint;
            description: string;
            position: number;
            mentionable: boolean;
            hoist: boolean;
        };
        '\uD83D\uDEE1\uFE0F Guardian': {
            color: number;
            permissions: bigint;
            description: string;
            position: number;
            mentionable: boolean;
            hoist: boolean;
        };
        '\u2728 Seraph': {
            color: number;
            permissions: bigint;
            description: string;
            position: number;
            mentionable: boolean;
            hoist: boolean;
        };
        '\uD83C\uDF1F Trial Seraph': {
            color: number;
            permissions: bigint;
            description: string;
            position: number;
            mentionable: boolean;
            hoist: boolean;
        };
        '\uD83D\uDCAB Member': {
            color: number;
            permissions: bigint;
            description: string;
            position: number;
            mentionable: boolean;
            hoist: boolean;
        };
    };
    welcomeMessage: {
        title: string;
        description: string;
        color: number;
        thumbnail: string;
        footer: string;
    };
    serverSettings: {
        name: string;
        description: string;
        verificationLevel: number;
        explicitContentFilter: number;
        defaultMessageNotifications: number;
        systemChannelFlags: number;
        preferredLocale: string;
    };
    autoMod: {
        enabled: boolean;
        spamThreshold: number;
        mentionThreshold: number;
        linkFilter: boolean;
        inviteFilter: boolean;
        profanityFilter: boolean;
        capsThreshold: number;
        emojiThreshold: number;
        actionOnViolation: string;
    };
    xp: {
        enabled: boolean;
        messageXp: number;
        voiceXpPerMinute: number;
        maxDailyXp: number;
        levelMultiplier: number;
        bonusXpChannels: string[];
        excludedChannels: string[];
    };
};
//# sourceMappingURL=serverConfig.d.ts.map