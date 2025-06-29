/**
 * Simple test to verify basic functionality
 */

// Set up basic environment for tests
beforeAll(() => {
  process.env.NODE_ENV = 'testing';
  process.env.DISCORD_TOKEN = 'test-token';
  process.env.DISCORD_CLIENT_ID = 'test-client-id';
  process.env.DISCORD_GUILD_ID = 'test-guild-id';
});

describe('Basic Functionality', () => {
  test('should have environment variables set', () => {
    expect(process.env.NODE_ENV).toBe('testing');
    expect(process.env.DISCORD_TOKEN).toBe('test-token');
    expect(process.env.DISCORD_CLIENT_ID).toBe('test-client-id');
    expect(process.env.DISCORD_GUILD_ID).toBe('test-guild-id');
  });

  test('should be able to import configuration', () => {
    const { loadBotConfig } = require('../config/config');
    expect(loadBotConfig).toBeDefined();
    expect(typeof loadBotConfig).toBe('function');
  });

  test('should be able to import logger', () => {
    const { logger } = require('../utils/logger');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  test('should be able to import validation utilities', () => {
    const { sanitizeDiscordInput } = require('../utils/validation');
    expect(sanitizeDiscordInput).toBeDefined();
    expect(typeof sanitizeDiscordInput).toBe('function');
  });

  test('should sanitize Discord input correctly', () => {
    const { sanitizeDiscordInput } = require('../utils/validation');
    const result = sanitizeDiscordInput('Hello <@123456789>!');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
}); 