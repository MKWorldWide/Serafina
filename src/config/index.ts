import { z } from 'zod';
import dotenvFlow from 'dotenv-flow';

// Load environment variables
dotenvFlow.config();

// Define the schema for environment variables
const envSchema = z.object({
  // Required Discord variables
  DISCORD_TOKEN: z.string().min(1, 'Discord token is required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'Discord client ID is required'),
  
  // Optional Discord variables
  DEV_GUILD_ID: z.string().optional(),
  COMMANDS_SCOPE: z.enum(['guild', 'global']).default('guild'),
  
  // Bot configuration
  BOT_TAGLINE: z.string().default('Serafina — your comms layer.'),
  APP_DESCRIPTION: z.string().default('Serafina routes messages and services. Use /help.'),
  
  // Database configuration
  DB_DRIVER: z.enum(['wasm', 'postgres']).default(process.platform === 'win32' ? 'wasm' : 'postgres'),
  DATABASE_URL: z.string().default('./data/serafina.db'),
  POSTGRES_URL: z.string().optional(),
  
  // Web server configuration
  PORT_HTTP: z.coerce.number().default(8787),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  
  // Optional OAuth configuration
  DISCORD_CLIENT_SECRET: z.string().optional(),
  
  // Optional: Add any other environment variables your app needs
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse and validate environment variables
const env = envSchema.safeParse(process.env);

// Throw an error if validation fails
if (!env.success) {
  const errorMessage = '❌ Invalid environment variables:\n' +
    Object.entries(env.error.format())
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => `  ${key}: ${(value as any)._errors.join(', ')}`)
      .join('\n');
  
  throw new Error(errorMessage);
}

// Export the validated environment variables
export const config = env.data;

// Log the current environment (except sensitive data)
if (process.env.NODE_ENV !== 'test') {
  console.log(`🚀 Environment: ${config.NODE_ENV}`);
  console.log(`💾 Database: ${config.DB_DRIVER}${config.DB_DRIVER === 'postgres' ? ' (PostgreSQL)' : ' (SQLite in-memory with persistence)'}`);
  console.log(`🌐 Web server: http://localhost:${config.PORT_HTTP}`);
}

// Export types
export type Config = typeof config;

export default config;
