/**
 * 🧪 GameDin Discord Bot - Test Environment Setup
 * 
 * This file sets up the test environment variables and configurations for Jest tests.
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

// Set test environment variables
process.env.NODE_ENV = 'testing';
process.env.DISCORD_TOKEN = 'test-token';
process.env.DISCORD_CLIENT_ID = 'test-client-id';
process.env.DISCORD_GUILD_ID = 'test-guild-id';
process.env.LOG_LEVEL = 'error';
process.env.DEBUG = 'false';
process.env.MAX_CONCURRENCY = '1';
process.env.RATE_LIMIT_MAX_REQUESTS = '10';
process.env.RATE_LIMIT_WINDOW_MS = '1000';

// Disable console output during tests
const originalConsole = { ...console };
console.log = jest.fn();
console.debug = jest.fn();
console.info = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();

// Restore console after tests
afterAll(() => {
  console.log = originalConsole.log;
  console.debug = originalConsole.debug;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
}); 