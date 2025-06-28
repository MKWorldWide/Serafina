/**
 * 🧪 GameDin Discord Bot - Jest Setup
 * 
 * This file sets up the Jest testing environment for the GameDin Discord bot.
 * It configures mocks, test utilities, and global test settings.
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { jest } from '@jest/globals';

// ============================================================================
// GLOBAL TEST CONFIGURATION
// ============================================================================

// Set test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// ============================================================================
// DISCORD.JS MOCKS
// ============================================================================

// Mock discord.js
jest.mock('discord.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    login: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    user: {
      tag: 'TestBot#1234'
    },
    guilds: {
      cache: new Map()
    },
    users: {
      cache: new Map()
    }
  })),
  GatewayIntentBits: {
    Guilds: 1,
    GuildMessages: 2,
    GuildMembers: 4,
    GuildPresences: 8,
    MessageContent: 16,
    GuildVoiceStates: 32,
    GuildMessageReactions: 64
  },
  Events: {
    ClientReady: 'ready',
    InteractionCreate: 'interactionCreate',
    MessageCreate: 'messageCreate',
    VoiceStateUpdate: 'voiceStateUpdate',
    MessageReactionAdd: 'messageReactionAdd',
    MessageReactionRemove: 'messageReactionRemove',
    GuildMemberAdd: 'guildMemberAdd',
    Error: 'error'
  },
  Collection: jest.fn().mockImplementation(() => new Map()),
  EmbedBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setColor: jest.fn().mockReturnThis(),
    setTimestamp: jest.fn().mockReturnThis(),
    addFields: jest.fn().mockReturnThis(),
    toJSON: jest.fn().mockReturnValue({})
  })),
  ActionRowBuilder: jest.fn().mockImplementation(() => ({
    addComponents: jest.fn().mockReturnThis(),
    toJSON: jest.fn().mockReturnValue({})
  })),
  ButtonBuilder: jest.fn().mockImplementation(() => ({
    setCustomId: jest.fn().mockReturnThis(),
    setLabel: jest.fn().mockReturnThis(),
    setStyle: jest.fn().mockReturnThis(),
    toJSON: jest.fn().mockReturnValue({})
  })),
  SlashCommandBuilder: jest.fn().mockImplementation(() => ({
    setName: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    addUserOption: jest.fn().mockReturnThis(),
    addStringOption: jest.fn().mockReturnThis(),
    addIntegerOption: jest.fn().mockReturnThis(),
    addBooleanOption: jest.fn().mockReturnThis(),
    setDefaultMemberPermissions: jest.fn().mockReturnThis(),
    toJSON: jest.fn().mockReturnValue({})
  })),
  PermissionFlagsBits: {
    Administrator: 8n,
    ModerateMembers: 1099511627776n,
    ManageMessages: 8192n,
    ManageChannels: 16n
  },
  ChannelType: {
    GuildText: 0,
    GuildVoice: 2,
    GuildCategory: 4
  }
}));

// ============================================================================
// ENVIRONMENT MOCKS
// ============================================================================

// Mock environment variables
process.env.DISCORD_TOKEN = 'test-token';
process.env.DISCORD_CLIENT_ID = 'test-client-id';
process.env.DISCORD_GUILD_ID = 'test-guild-id';
process.env.NODE_ENV = 'testing';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a mock Discord interaction for testing
 * @param commandName - Name of the command
 * @param options - Additional options
 * @returns Mock interaction object
 */
export function createMockInteraction(commandName: string, options: any = {}) {
  return {
    commandName,
    user: {
      id: 'test-user-id',
      tag: 'TestUser#1234',
      bot: false
    },
    member: {
      id: 'test-user-id',
      user: {
        id: 'test-user-id',
        tag: 'TestUser#1234'
      },
      roles: {
        cache: new Map()
      }
    },
    guild: {
      id: 'test-guild-id',
      name: 'Test Guild',
      channels: {
        cache: new Map()
      },
      roles: {
        cache: new Map()
      },
      members: {
        fetch: jest.fn().mockResolvedValue({
          id: 'test-user-id',
          user: { id: 'test-user-id', tag: 'TestUser#1234' },
          roles: { cache: new Map() }
        })
      }
    },
    channel: {
      id: 'test-channel-id',
      name: 'test-channel',
      send: jest.fn().mockResolvedValue({}),
      isTextBased: jest.fn().mockReturnValue(true)
    },
    options: {
      getUser: jest.fn().mockReturnValue(options.user || { id: 'test-user-id' }),
      getString: jest.fn().mockReturnValue(options.string || 'test'),
      getInteger: jest.fn().mockReturnValue(options.integer || 1),
      getBoolean: jest.fn().mockReturnValue(options.boolean || false)
    },
    reply: jest.fn().mockResolvedValue({}),
    editReply: jest.fn().mockResolvedValue({}),
    followUp: jest.fn().mockResolvedValue({}),
    deferReply: jest.fn().mockResolvedValue({}),
    replied: false,
    deferred: false,
    isChatInputCommand: jest.fn().mockReturnValue(true),
    ...options
  };
}

/**
 * Create a mock Discord message for testing
 * @param content - Message content
 * @param options - Additional options
 * @returns Mock message object
 */
export function createMockMessage(content: string, options: any = {}) {
  return {
    content,
    author: {
      id: 'test-user-id',
      tag: 'TestUser#1234',
      bot: false
    },
    member: {
      id: 'test-user-id',
      user: {
        id: 'test-user-id',
        tag: 'TestUser#1234'
      },
      roles: {
        cache: new Map()
      }
    },
    guild: {
      id: 'test-guild-id',
      name: 'Test Guild',
      channels: {
        cache: new Map()
      },
      roles: {
        cache: new Map()
      }
    },
    channel: {
      id: 'test-channel-id',
      name: 'test-channel',
      send: jest.fn().mockResolvedValue({}),
      isTextBased: jest.fn().mockReturnValue(true)
    },
    delete: jest.fn().mockResolvedValue({}),
    ...options
  };
}

/**
 * Create a mock Discord guild member for testing
 * @param options - Member options
 * @returns Mock guild member object
 */
export function createMockGuildMember(options: any = {}) {
  return {
    id: 'test-user-id',
    user: {
      id: 'test-user-id',
      tag: 'TestUser#1234'
    },
    guild: {
      id: 'test-guild-id',
      name: 'Test Guild',
      roles: {
        cache: new Map()
      }
    },
    roles: {
      cache: new Map(),
      add: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
      has: jest.fn().mockReturnValue(false)
    },
    ...options
  };
}

/**
 * Wait for a specified number of milliseconds
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock logger for testing
 * @returns Mock logger object
 */
export function createMockLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    log: jest.fn()
  };
}

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Reset all mocks between tests
 */
export function resetMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
}

/**
 * Mock the logger module
 */
export function mockLogger() {
  jest.mock('../utils/logger', () => createMockLogger());
}

/**
 * Mock the validation utilities
 */
export function mockValidation() {
  jest.mock('../utils/validation', () => ({
    validateString: jest.fn().mockReturnValue({ isValid: true, errors: [], value: 'test' }),
    validateNumber: jest.fn().mockReturnValue({ isValid: true, errors: [], value: 1 }),
    validateArray: jest.fn().mockReturnValue({ isValid: true, errors: [], value: [] }),
    sanitizeString: jest.fn().mockReturnValue('sanitized'),
    sanitizeDiscordInput: jest.fn().mockReturnValue('sanitized'),
    createValidationError: jest.fn(),
    validateCommandArgs: jest.fn().mockReturnValue({
      isValid: true,
      errors: [],
      sanitizedArgs: {}
    }),
    CommonSchemas: {
      username: {},
      email: {},
      discordId: {},
      reason: {},
      duration: {}
    }
  }));
}

// ============================================================================
// GLOBAL TEST UTILITIES
// ============================================================================

// Make utility functions available globally
(global as any).createMockInteraction = createMockInteraction;
(global as any).createMockMessage = createMockMessage;
(global as any).createMockGuildMember = createMockGuildMember;
(global as any).wait = wait;
(global as any).createMockLogger = createMockLogger;
(global as any).resetMocks = resetMocks;
(global as any).mockLogger = mockLogger;
(global as any).mockValidation = mockValidation; 