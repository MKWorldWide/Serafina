import { z } from 'zod';
import { createLogger } from '../utils/logger';

const logger = createLogger({ service: 'config:env' });

// Define the service schema
const ServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  url: z.string().url('Service URL must be a valid URL'),
  owner: z.string().optional(),
  channelId: z.string().optional(),
  description: z.string().optional(),
  statusPageUrl: z.string().url('Status page URL must be a valid URL').optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // Add more service-specific configuration as needed
});

type Service = z.infer<typeof ServiceSchema>;

// Define the environment variables schema
const EnvSchema = z.object({
  // Discord
  DISCORD_TOKEN: z.string().min(1, 'Discord token is required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'Discord client ID is required'),
  DISCORD_GUILD_ID: z.string().optional(), // Optional for development
  
  // Services configuration
  SERVICES: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      const result = z.array(ServiceSchema).safeParse(parsed);
      
      if (!result.success) {
        result.error.issues.forEach(issue => {
          ctx.addIssue({
            ...issue,
            path: ['SERVICES', ...(issue.path || [])],
          });
        });
        return z.NEVER;
      }
      
      return result.data;
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SERVICES must be a valid JSON array of service configurations',
      });
      return z.NEVER;
    }
  }),
  
  // Heartbeat configuration
  HEARTBEAT_INTERVAL: z.coerce.number().int().positive().default(30000), // 30 seconds
  HEARTBEAT_TIMEOUT: z.coerce.number().int().positive().default(10000), // 10 seconds
  HEARTBEAT_CONCURRENCY: z.coerce.number().int().positive().default(5),
  
  // Circuit breaker configuration
  CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().int().positive().default(5),
  CIRCUIT_BREAKER_TIMEOUT: z.coerce.number().int().positive().default(60000), // 1 minute
  CIRCUIT_BREAKER_MAX_RETRIES: z.coerce.number().int().nonnegative().default(3),
  
  // Incident management
  INCIDENT_CHANNEL_ID: z.string().optional(),
  INCIDENT_ROLE_CRITICAL: z.string().optional(),
  INCIDENT_ROLE_MAJOR: z.string().optional(),
  INCIDENT_ROLE_MINOR: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Optional features
  ENABLE_STATUS_THREADS: z.coerce.boolean().default(false),
  STATUS_THREAD_CHANNEL_ID: z.string().optional(),
  STATUS_THREAD_UPDATE_INTERVAL: z.coerce.number().int().positive().default(300000), // 5 minutes
  
  // External integrations
  SENTRY_DSN: z.string().url().optional(),
  DATADOG_API_KEY: z.string().optional(),
  
  // Add more environment variables as needed
});

type Env = z.infer<typeof EnvSchema>;

// Parse and validate environment variables
let env: Env;

try {
  // Load environment variables from .env file if in development
  if (process.env.NODE_ENV !== 'production') {
    // Use dynamic import for dotenv to avoid loading it in production
    import('dotenv').then(dotenv => {
      dotenv.config();
      logger.info('Loaded environment variables from .env file');
    }).catch(() => {
      logger.warn('Failed to load dotenv. Proceeding with system environment variables.');
    });
  }
  
  // Parse and validate environment variables
  env = EnvSchema.parse(process.env);
  
  // Log startup information
  logger.info('Environment variables validated successfully', {
    nodeEnv: env.NODE_ENV,
    serviceCount: env.SERVICES.length,
    logLevel: env.LOG_LEVEL,
  });
  
} catch (error) {
  if (error instanceof z.ZodError) {
    // Format and log validation errors
    const errorMessages = error.issues.map(issue => {
      const path = issue.path.join('.');
      return `• ${path}: ${issue.message}`;
    });
    
    logger.error('❌ Invalid environment variables:', {
      errors: errorMessages,
      issues: error.issues,
    });
    
    console.error('\n❌ Invalid environment variables:');
    console.error(errorMessages.join('\n'));
    console.error('\nPlease check your .env file or environment variables and try again.\n');
  } else {
    logger.error('❌ Failed to validate environment variables', { error });
    console.error('❌ Failed to validate environment variables:', error);
  }
  
  // Exit with error code
  process.exit(1);
}

// Export validated environment variables
export default env;

// Re-export types for convenience
export type { Service };

/**
 * Get a service by name
 * @param name The name of the service to find
 * @returns The service configuration or undefined if not found
 */
export function getService(name: string): Service | undefined {
  return env.SERVICES.find(service => service.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get all services
 * @returns An array of all services
 */
export function getServices(): Service[] {
  return [...env.SERVICES];
}

/**
 * Get services by tag
 * @param tag The tag to filter by
 * @returns An array of services with the specified tag
 */
export function getServicesByTag(tag: string): Service[] {
  return env.SERVICES.filter(service => 
    service.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get services by category
 * @param category The category to filter by
 * @returns An array of services in the specified category
 */
export function getServicesByCategory(category: string): Service[] {
  return env.SERVICES.filter(service => 
    service.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get the incident role ID for a given severity
 * @param severity The severity level
 * @returns The role ID or undefined if not configured
 */
export function getIncidentRoleId(severity: 'critical' | 'major' | 'minor'): string | undefined {
  switch (severity) {
    case 'critical':
      return env.INCIDENT_ROLE_CRITICAL;
    case 'major':
      return env.INCIDENT_ROLE_MAJOR;
    case 'minor':
      return env.INCIDENT_ROLE_MINOR;
    default:
      return undefined;
  }
}
