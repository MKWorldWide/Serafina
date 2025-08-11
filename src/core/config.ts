import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

// Define the schema for environment variables
const envSchema = z.object({
  // Required environment variables
  DISCORD_TOKEN: z.string().min(1, 'Discord token is required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'Discord client ID is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Optional environment variables with defaults
  COMMANDS_SCOPE: z.enum(['guild', 'global']).default('guild'),
  DEV_GUILD_ID: z.string().optional(),
  BOT_TAGLINE: z.string().default('Serafina — your comms layer.'),
  APP_DESCRIPTION: z.string().default(
    'Serafina routes messages and services across Shadow Nexus, AthenaCore, and Divina. Use /help to begin.'
  ),
  PORT_HTTP: z.coerce.number().int().positive().default(8787),
  ENABLE_MESSAGE_CONTENT: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),
  DATABASE_URL: z.string().default('./data/serafina.db'),
  
  // Heartbeat configuration
  HEARTBEAT_INTERVAL: z.coerce.number().int().positive().default(300000), // 5 minutes
  
  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

// Parse and validate environment variables
try {
  const env = envSchema.parse(process.env);
  
  // Export the validated configuration
  export const config = {
    // Core
    isDev: env.NODE_ENV !== 'production',
    isProd: env.NODE_ENV === 'production',
    nodeEnv: env.NODE_ENV,
    
    // Discord
    discord: {
      token: env.DISCORD_TOKEN,
      clientId: env.DISCORD_CLIENT_ID,
      commandsScope: env.COMMANDS_SCOPE,
      devGuildId: env.DEV_GUILD_ID,
      enableMessageContent: env.ENABLE_MESSAGE_CONTENT,
      intents: [
        'Guilds',
        'GuildMessages',
        'GuildMembers',
        'MessageContent',
        'GuildMessageReactions',
      ],
      partials: ['Message', 'Channel', 'Reaction'],
    },
    
    // Application
    app: {
      name: 'Serafina',
      tagline: env.BOT_TAGLINE,
      description: env.APP_DESCRIPTION,
      version: process.env.npm_package_version || '1.0.0',
    },
    
    // Server
    server: {
      port: env.PORT_HTTP,
      host: '0.0.0.0',
      baseUrl: process.env.BASE_URL || `http://localhost:${env.PORT_HTTP}`,
    },
    
    // Database
    database: {
      url: env.DATABASE_URL,
      options: {
        verbose: env.NODE_ENV === 'development' ? console.log : undefined,
      },
    },
    
    // Rate limiting
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
    },
    
    // Heartbeat
    heartbeat: {
      interval: env.HEARTBEAT_INTERVAL,
    },
    
    // Logging
    logging: {
      level: env.LOG_LEVEL,
      prettyPrint: env.NODE_ENV !== 'production',
    },
  };
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// Export the config object
export type Config = typeof config;

export default config;
