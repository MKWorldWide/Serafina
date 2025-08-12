import { z } from 'zod';
import { createLogger } from '../utils/logger';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

const logger = createLogger({ service: 'config:env' });

// Define log levels for validation
const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;

// Schema for database configuration
const DatabaseSchema = z.object({
  // Backward compatibility: DATABASE_URL or DB_PATH
  url: z.string()
    .default('data/serafina.db')
    .describe('Path to SQLite database file'),
  
  // Backward compatibility: DB_DRIVER or empty (auto-detect)
  driver: z.enum(['native', 'wasm', 'auto'] as const)
    .default('auto')
    .describe('Database driver to use (native, wasm, or auto)'),
  
  // Backward compatibility: DB_MIGRATIONS_DIR or default
  migrationsDir: z.string()
    .default('migrations')
    .describe('Directory containing database migrations'),
  
  // Backward compatibility: DB_POOL_MIN/MAX or defaults
  pool: z.object({
    min: z.number().int().min(1).default(2),
    max: z.number().int().min(1).default(10),
  }).default({})
});

// Schema for web server configuration
const WebServerSchema = z.object({
  // Backward compatibility: PORT or PORT_HTTP
  port: z.number().int().min(1).max(65535).default(8787),
  
  // Backward compatibility: HOST or empty (all interfaces)
  host: z.string().default('0.0.0.0'),
  
  // Backward compatibility: TRUST_PROXY or default false
  trustProxy: z.boolean().default(false),
  
  // Backward compatibility: RATE_LIMIT_* or defaults
  rateLimit: z.object({
    windowMs: z.number().int().min(1000).default(15 * 60 * 1000), // 15 minutes
    max: z.number().int().min(1).default(100), // 100 requests per window
  }).default({}),
  
  // Backward compatibility: CORS_ORIGIN or default
  cors: z.union([
    z.string().url(),
    z.string().regex(/^\*$/),
    z.array(z.string())
  ]).default('*')
});

// Schema for Discord client configuration
const DiscordSchema = z.object({
  // Required: DISCORD_TOKEN or TOKEN
  token: z.string()
    .min(1, 'Discord bot token is required')
    .describe('Discord bot token from the Developer Portal'),
  
  // Required: DISCORD_CLIENT_ID or CLIENT_ID or APPLICATION_ID
  clientId: z.string()
    .min(1, 'Discord client ID is required')
    .describe('Discord application client ID'),
  
  // Optional: DEV_GUILD_ID or GUILD_ID
  devGuildId: z.string().optional()
    .describe('Guild ID for development (speeds up command registration)'),
  
  // Backward compatibility: COMMANDS_SCOPE or default 'guild'
  commandsScope: z.enum(['guild', 'global'])
    .default('guild')
    .describe('Where to register commands (guild or global)'),
  
  // Backward compatibility: ENABLE_MESSAGE_CONTENT or default false
  enableMessageContent: z.boolean()
    .default(false)
    .describe('Enable message content intent (requires bot approval)'),
  
  // Backward compatibility: OWNER_IDS or empty
  ownerIds: z.array(z.string())
    .default([])
    .describe('Array of Discord user IDs who have bot owner permissions')
});

// Schema for application configuration
const AppSchema = z.object({
  // Backward compatibility: NODE_ENV or default 'development'
  env: z.enum(['development', 'production', 'test'] as const)
    .default('development'),
  
  // Backward compatibility: LOG_LEVEL or default 'info'
  logLevel: z.enum([...LOG_LEVELS] as const)
    .default('info'),
  
  // Backward compatibility: MAINTENANCE_MODE or default false
  maintenance: z.boolean()
    .default(false)
    .describe('Enable maintenance mode (bot will only respond to owners)'),
  
  // Backward compatibility: BOT_TAGLINE or empty
  tagline: z.string()
    .optional()
    .describe('Bot tagline shown in /about command'),
  
  // Backward compatibility: APP_DESCRIPTION or default
  description: z.string()
    .default('A feature-rich Discord bot with slash commands and more')
    .describe('Bot description shown in /about command')
});

// Main environment schema with all configurations
const EnvSchema = z.object({
  // Core configurations
  app: AppSchema,
  discord: DiscordSchema,
  database: DatabaseSchema,
  web: WebServerSchema,
  
  // Backward compatibility: REDIS_URL or empty
  redisUrl: z.string().url().optional()
    .describe('Redis URL for caching and rate limiting'),
  
  // Backward compatibility: SENTRY_DSN or empty
  sentryDsn: z.string().url().optional()
    .describe('Sentry DSN for error tracking'),
  
  // Backward compatibility: DEBUG or empty
  debug: z.union([
    z.boolean(),
    z.string().transform(s => s === 'true')
  ]).default(false)
});

// Type exports
export type DatabaseConfig = z.infer<typeof DatabaseSchema>;
export type WebServerConfig = z.infer<typeof WebServerSchema>;
export type DiscordConfig = z.infer<typeof DiscordSchema>;
export type AppConfig = z.infer<typeof AppSchema>;

export type Env = z.infer<typeof EnvSchema>;

// Helper function to parse environment variables
function parseEnv(): Env {
  // Transform environment variables to match our schema
  const envVars = {
    debug: process.env.DEBUG === 'true',
    app: {
      env: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
      maintenance: process.env.MAINTENANCE_MODE === 'true',
      description: process.env.APP_DESCRIPTION || 'A feature-rich Discord bot with slash commands and more',
      tagline: process.env.BOT_TAGLINE
    },
    discord: {
      token: process.env.DISCORD_TOKEN || process.env.TOKEN || '',
      clientId: process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || process.env.APPLICATION_ID || '',
      devGuildId: process.env.DEV_GUILD_ID || process.env.GUILD_ID,
      commandsScope: (process.env.COMMANDS_SCOPE as 'guild' | 'global') || 'guild',
      enableMessageContent: process.env.ENABLE_MESSAGE_CONTENT === 'true',
      ownerIds: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',').map(s => s.trim()) : []
    },
    database: {
      url: process.env.DATABASE_URL || process.env.DB_PATH || 'data/serafina.db',
      driver: (process.env.DB_DRIVER as 'native' | 'wasm' | 'auto') || 'auto',
      migrationsDir: process.env.DB_MIGRATIONS_DIR || 'migrations',
      pool: {
        min: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN, 10) : 2,
        max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 10
      }
    },
    web: {
      port: process.env.PORT_HTTP ? parseInt(process.env.PORT_HTTP, 10) : 8787,
      host: process.env.HOST || '0.0.0.0',
      trustProxy: process.env.TRUST_PROXY === 'true',
      rateLimit: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS 
          ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) 
          : 15 * 60 * 1000, // 15 minutes
        max: process.env.RATE_LIMIT_MAX 
          ? parseInt(process.env.RATE_LIMIT_MAX, 10) 
          : 100 // 100 requests per window
      },
      cors: process.env.CORS_ORIGIN || '*'
    },
    redisUrl: process.env.REDIS_URL,
    sentryDsn: process.env.SENTRY_DSN
  };

  // Parse and validate the environment variables
  const result = EnvSchema.safeParse(envVars);
  
  if (!result.success) {
    const errorMessage = '❌ Invalid environment variables:';
    const issues = result.error.issues.map(
      issue => `  - ${issue.path.join('.')}: ${issue.message}`
    ).join('\n');
    
    logger.error('Failed to parse environment variables', { error: result.error });
    console.error(`${errorMessage}\n${issues}`);
    process.exit(1);
  }

  return result.data;
}

// Parse the environment variables
const env = parseEnv();

// Log configuration on startup
const logContext = {
  nodeEnv: env.app.env,
  logLevel: env.app.logLevel,
  maintenance: env.app.maintenance,
  discord: {
    commandsScope: env.discord.commandsScope,
    devGuildId: env.discord.devGuildId
  },
  database: {
    url: env.database.url,
    driver: env.database.driver
  },
  web: {
    port: env.web.port,
    host: env.web.host
  }
};

logger.info('Environment configuration loaded', logContext);

// Export the validated environment variables
export { env };

// Export a default object with backward compatibility aliases
const config = {
  ...env,
  // Backward compatibility aliases
  NODE_ENV: env.app.env,
  LOG_LEVEL: env.app.logLevel,
  MAINTENANCE_MODE: env.app.maintenance,
  DISCORD_TOKEN: env.discord.token,
  DISCORD_CLIENT_ID: env.discord.clientId,
  DEV_GUILD_ID: env.discord.devGuildId,
  DATABASE_URL: env.database.url,
  PORT: env.web.port,
  HOST: env.web.host
};

export default config;
