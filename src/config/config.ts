/**
 * ⚙️ GameDin Discord Bot - Configuration Management
 * 
 * This module provides comprehensive configuration management for the GameDin Discord bot.
 * It handles environment variable loading, validation, and provides type-safe access to all settings.
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { config } from 'dotenv';
import { BotConfig, BotError, ErrorCode } from '../types/Bot';
import { validateString, validateNumber, CommonSchemas } from '../utils/validation';

// Load environment variables from .env file
config();

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

/**
 * Validates and loads bot configuration from environment variables
 * @returns Validated bot configuration
 * @throws BotError if required configuration is missing or invalid
 */
export function loadBotConfig(): BotConfig {
  const errors: string[] = [];

  // Validate required environment variables
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;
  const environment = process.env.NODE_ENV || 'development';

  // Validate token
  if (!token) {
    errors.push('DISCORD_TOKEN is required');
  }

  // Validate client ID
  if (!clientId) {
    errors.push('DISCORD_CLIENT_ID is required');
  }

  // Validate guild ID
  if (!guildId) {
    errors.push('DISCORD_GUILD_ID is required');
  }

  // Validate environment
  if (!['development', 'production', 'testing'].includes(environment)) {
    errors.push('NODE_ENV must be one of: development, production, testing');
  }

  // If there are validation errors, throw a comprehensive error
  if (errors.length > 0) {
    throw new BotError(
      `Configuration validation failed: ${errors.join('; ')}`,
      ErrorCode.CONFIG_MISSING_TOKEN,
      { missingFields: errors },
      'Please check your environment variables and .env file.',
      false
    );
  }

  // Build configuration object
  const botConfig: BotConfig = {
    token: token!,
    clientId: clientId!,
    guildId: guildId!,
    environment: environment as 'development' | 'production' | 'testing',
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    logLevel: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
    debug: process.env.DEBUG === 'true',
    maxConcurrency: parseInt(process.env.MAX_CONCURRENCY || '10'),
    rateLimit: {
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
    }
  };

  // Validate numeric configuration values
  validateNumericConfig(botConfig);

  return botConfig;
}

/**
 * Validates numeric configuration values
 * @param config - Bot configuration to validate
 * @throws BotError if numeric values are invalid
 */
function validateNumericConfig(config: BotConfig): void {
  const errors: string[] = [];

  // Validate max concurrency
  if (config.maxConcurrency < 1 || config.maxConcurrency > 100) {
    errors.push('MAX_CONCURRENCY must be between 1 and 100');
  }

  // Validate rate limit values
  if (config.rateLimit.maxRequests < 1 || config.rateLimit.maxRequests > 1000) {
    errors.push('RATE_LIMIT_MAX_REQUESTS must be between 1 and 1000');
  }

  if (config.rateLimit.windowMs < 1000 || config.rateLimit.windowMs > 3600000) {
    errors.push('RATE_LIMIT_WINDOW_MS must be between 1000 and 3600000 (1 hour)');
  }

  if (errors.length > 0) {
    throw new BotError(
      `Numeric configuration validation failed: ${errors.join('; ')}`,
      ErrorCode.CONFIG_INVALID_PERMISSIONS,
      { validationErrors: errors },
      'Please check your configuration values.',
      true
    );
  }
}

// ============================================================================
// ENVIRONMENT-SPECIFIC CONFIGURATION
// ============================================================================

/**
 * Gets environment-specific configuration overrides
 * @param environment - Current environment
 * @returns Environment-specific configuration
 */
export function getEnvironmentConfig(environment: string) {
  const baseConfig = {
    debug: false,
    logLevel: 'info' as const,
    maxConcurrency: 10,
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000
    }
  };

  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        debug: true,
        logLevel: 'debug' as const,
        maxConcurrency: 5,
        rateLimit: {
          maxRequests: 50,
          windowMs: 30000
        }
      };

    case 'production':
      return {
        ...baseConfig,
        debug: false,
        logLevel: 'warn' as const,
        maxConcurrency: 20,
        rateLimit: {
          maxRequests: 200,
          windowMs: 60000
        }
      };

    case 'testing':
      return {
        ...baseConfig,
        debug: true,
        logLevel: 'debug' as const,
        maxConcurrency: 1,
        rateLimit: {
          maxRequests: 10,
          windowMs: 10000
        }
      };

    default:
      return baseConfig;
  }
}

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

/**
 * Checks if the bot is running in development mode
 * @param config - Bot configuration
 * @returns True if in development mode
 */
export function isDevelopment(config: BotConfig): boolean {
  return config.environment === 'development';
}

/**
 * Checks if the bot is running in production mode
 * @param config - Bot configuration
 * @returns True if in production mode
 */
export function isProduction(config: BotConfig): boolean {
  return config.environment === 'production';
}

/**
 * Checks if the bot is running in testing mode
 * @param config - Bot configuration
 * @returns True if in testing mode
 */
export function isTesting(config: BotConfig): boolean {
  return config.environment === 'testing';
}

/**
 * Gets the appropriate log level for the current environment
 * @param config - Bot configuration
 * @returns Log level string
 */
export function getLogLevel(config: BotConfig): string {
  if (config.debug) {
    return 'debug';
  }
  return config.logLevel;
}

/**
 * Validates that all required services are configured
 * @param config - Bot configuration
 * @returns Array of missing service configurations
 */
export function validateServiceConfig(config: BotConfig): string[] {
  const missing: string[] = [];

  // Check database configuration for production
  if (isProduction(config) && !config.databaseUrl) {
    missing.push('DATABASE_URL is required for production environment');
  }

  // Check Redis configuration for production
  if (isProduction(config) && !config.redisUrl) {
    missing.push('REDIS_URL is required for production environment');
  }

  return missing;
}

// ============================================================================
// CONFIGURATION EXPORTS
// ============================================================================

// Load and export the bot configuration
export const botConfig = loadBotConfig();

// Export configuration utilities
export {
  loadBotConfig,
  getEnvironmentConfig,
  isDevelopment,
  isProduction,
  isTesting,
  getLogLevel,
  validateServiceConfig
}; 