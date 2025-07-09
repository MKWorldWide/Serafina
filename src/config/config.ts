/**
 * Configuration management for GameDin Discord Bot
 * Handles environment variables, validation, and type-safe configuration
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration schemas for validation
const EnvironmentSchema = z.enum(['development', 'production', 'testing']);
const LogLevelSchema = z.enum(['error', 'warn', 'info', 'debug']);

// Bot configuration interface
export interface BotConfig {
  token: string;
  clientId: string;
  guildId: string;
  environment: 'development' | 'production' | 'testing';
  databaseUrl?: string;
  redisUrl?: string;
  openaiApiKey?: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  debug: boolean;
  maxConcurrency: number;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * Load and validate bot configuration from environment variables
 * @returns Validated bot configuration object
 * @throws Error if required configuration is missing or invalid
 */
export function loadBotConfig(): BotConfig {
  // Load required environment variables
  const token = process.env['DISCORD_TOKEN'];
  const clientId = process.env['DISCORD_CLIENT_ID'];
  const guildId = process.env['DISCORD_GUILD_ID'];
  const environment = process.env['NODE_ENV'] || 'development';

  // Validate required fields
  if (!token) {
    throw new Error('DISCORD_TOKEN is required');
  }
  if (!clientId) {
    throw new Error('DISCORD_CLIENT_ID is required');
  }
  if (!guildId) {
    throw new Error('DISCORD_GUILD_ID is required');
  }

  // Validate environment
  const validatedEnvironment = EnvironmentSchema.safeParse(environment);
  if (!validatedEnvironment.success) {
    throw new Error(
      `Invalid NODE_ENV: ${environment}. Must be one of: development, production, testing`,
    );
  }

  // Load optional environment variables
  const databaseUrl = process.env['DATABASE_URL'];
  const redisUrl = process.env['REDIS_URL'];
  const openaiApiKey = process.env['OPENAI_API_KEY'];
  const logLevel = (process.env['LOG_LEVEL'] as 'error' | 'warn' | 'info' | 'debug') || 'info';
  const debug = process.env['DEBUG'] === 'true';
  const maxConcurrency = parseInt(process.env['MAX_CONCURRENCY'] || '10');

  const rateLimitMaxRequests = parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100');
  const rateLimitWindowMs = parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000');

  // Validate log level
  const validatedLogLevel = LogLevelSchema.safeParse(logLevel);
  if (!validatedLogLevel.success) {
    throw new Error(`Invalid LOG_LEVEL: ${logLevel}. Must be one of: error, warn, info, debug`);
  }

  // Create configuration object
  const botConfig: BotConfig = {
    token,
    clientId,
    guildId,
    environment: validatedEnvironment.data,
    databaseUrl,
    redisUrl,
    openaiApiKey,
    logLevel: validatedLogLevel.data,
    debug,
    maxConcurrency,
    rateLimit: {
      maxRequests: rateLimitMaxRequests,
      windowMs: rateLimitWindowMs,
    },
  };

  return botConfig;
}

/**
 * Get environment-specific configuration
 * @param environment - The environment to get configuration for
 * @returns Environment-specific configuration object
 */
export function getEnvironmentConfig(environment: string) {
  const baseConfig = {
    logLevel: 'info' as const,
    debug: false,
    maxConcurrency: 10,
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000,
    },
  };

  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        logLevel: 'debug' as const,
        debug: true,
        maxConcurrency: 5,
        rateLimit: {
          maxRequests: 1000,
          windowMs: 60000,
        },
      };

    case 'production':
      return {
        ...baseConfig,
        logLevel: 'warn' as const,
        debug: false,
        maxConcurrency: 20,
        rateLimit: {
          maxRequests: 50,
          windowMs: 60000,
        },
      };

    case 'testing':
      return {
        ...baseConfig,
        logLevel: 'error' as const,
        debug: false,
        maxConcurrency: 1,
        rateLimit: {
          maxRequests: 10,
          windowMs: 1000,
        },
      };

    default:
      return baseConfig;
  }
}

/**
 * Check if the current environment is development
 * @param config - Bot configuration object
 * @returns True if in development environment
 */
export function isDevelopment(config: BotConfig): boolean {
  return config.environment === 'development';
}

/**
 * Check if the current environment is production
 * @param config - Bot configuration object
 * @returns True if in production environment
 */
export function isProduction(config: BotConfig): boolean {
  return config.environment === 'production';
}

/**
 * Check if the current environment is testing
 * @param config - Bot configuration object
 * @returns True if in testing environment
 */
export function isTesting(config: BotConfig): boolean {
  return config.environment === 'testing';
}

/**
 * Get the appropriate log level for the current environment
 * @param config - Bot configuration object
 * @returns Log level string
 */
export function getLogLevel(config: BotConfig): string {
  if (isDevelopment(config)) {
    return 'debug';
  } else if (isProduction(config)) {
    return 'warn';
  } else {
    return 'error';
  }
}

/**
 * Validate service-specific configuration
 * @param config - Bot configuration object
 * @returns Array of validation errors (empty if valid)
 */
export function validateServiceConfig(config: BotConfig): string[] {
  const errors: string[] = [];

  // Validate database configuration for production
  if (isProduction(config) && !config.databaseUrl) {
    errors.push('DATABASE_URL is required in production environment');
  }

  // Validate Redis configuration for production
  if (isProduction(config) && !config.redisUrl) {
    errors.push('REDIS_URL is required in production environment');
  }

  // Validate OpenAI configuration if using AI features
  if (config.openaiApiKey && config.openaiApiKey.length < 10) {
    errors.push('OPENAI_API_KEY appears to be invalid');
  }

  // Validate rate limiting configuration
  if (config.rateLimit.maxRequests <= 0) {
    errors.push('RATE_LIMIT_MAX_REQUESTS must be greater than 0');
  }

  if (config.rateLimit.windowMs <= 0) {
    errors.push('RATE_LIMIT_WINDOW_MS must be greater than 0');
  }

  return errors;
}
