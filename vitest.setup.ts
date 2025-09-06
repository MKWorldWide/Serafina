// Global setup for tests
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock global objects
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock console methods
const consoleError = console.error;
const consoleWarn = console.warn;

// Setup before each test
beforeEach(() => {
  // Reset all mocks before each test
  vi.resetAllMocks();
  
  // Mock console.error and console.warn to fail tests
  console.error = (message) => {
    consoleError(message);
    throw new Error(`Console error: ${message}`);
  };

  console.warn = (message) => {
    consoleWarn(message);
    throw new Error(`Console warning: ${message}`);
  };
});

// Cleanup after each test
afterEach(() => {
  // Restore console methods
  console.error = consoleError;
  console.warn = consoleWarn;
  
  // Clean up the DOM
  cleanup();
  
  // Clear all mocks
  vi.clearAllMocks();
});

// Global teardown
afterAll(() => {
  // Restore all mocks to their original state
  vi.restoreAllMocks();
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.DISCORD_TOKEN = 'test-token';
process.env.DISCORD_CLIENT_ID = 'test-client-id';
process.env.DISCORD_CLIENT_SECRET = 'test-client-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';

// Mock modules
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock Discord.js
vi.mock('discord.js', async () => {
  const actual = await vi.importActual('discord.js');
  return {
    ...actual,
    Client: vi.fn().mockImplementation(() => ({
      login: vi.fn(),
      on: vi.fn(),
      user: {
        setPresence: vi.fn(),
        setActivity: vi.fn(),
        setStatus: vi.fn(),
      },
    })),
  };
});
