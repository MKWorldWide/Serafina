import winston from 'winston';
import { randomUUID } from 'crypto';

// Request context type
type RequestContext = {
  rid: string;  // Request ID
  service?: string; // Service name (if applicable)
  command?: string; // Command name (if applicable)
  userId?: string;  // Discord user ID (if applicable)
};

// Extend the default winston logger format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format,
  defaultMeta: { service: 'serafina-bot' },
  transports: [
    // Console transport with colorized output for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const { rid, service, command, userId, ...restMeta } = meta as RequestContext & Record<string, unknown>;
          let logMessage = `[${timestamp}] ${level}: ${message}`;
          if (rid) logMessage += ` [rid:${rid}]`;
          if (service) logMessage += ` [svc:${service}]`;
          if (command) logMessage += ` [cmd:${command}]`;
          if (userId) logMessage += ` [user:${userId}]`;
          
          // Add any additional metadata
          const metaString = Object.entries(restMeta)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
            .join(' ');
          
          return metaString ? `${logMessage} - ${metaString}` : logMessage;
        })
      ),
    }),
    // File transport with JSON format
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
  ],
});

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from 'fs';
if (!existsSync('logs')) {
  mkdirSync('logs');
}

/**
 * Create a child logger with request context
 * @param context Context to add to all logs from this logger
 * @returns A child logger instance with the provided context
 */
export function createLogger(context: Partial<RequestContext> = {}) {
  // Ensure we have a request ID
  const rid = context.rid || randomUUID();
  
  return logger.child({ 
    ...context,
    rid,
  });
}

/**
 * Log a message with the default logger
 * @param level Log level
 * @param message Message to log
 * @param meta Additional metadata
 */
function log(level: string, message: string, meta: Record<string, unknown> = {}) {
  logger.log(level, message, meta);
}

/**
 * Log an info message
 * @param message Message to log
 * @param meta Additional metadata
 */
export function info(message: string, meta: Record<string, unknown> = {}) {
  log('info', message, meta);
}

/**
 * Log a warning message
 * @param message Message to log
 * @param meta Additional metadata
 */
export function warn(message: string, meta: Record<string, unknown> = {}) {
  log('warn', message, meta);
}

/**
 * Log an error message
 * @param message Message to log
 * @param error Error object or additional metadata
 * @param meta Additional metadata
 */
export function error(
  message: string, 
  error?: Error | unknown,
  meta: Record<string, unknown> = {}
) {
  const errorMeta = error instanceof Error 
    ? { error: error.message, stack: error.stack, ...meta }
    : { error, ...meta };
  
  log('error', message, errorMeta);
}

/**
 * Log a debug message (only shown when LOG_LEVEL=debug)
 * @param message Message to log
 * @param meta Additional metadata
 */
export function debug(message: string, meta: Record<string, unknown> = {}) {
  log('debug', message, meta);
}

// Export the default logger instance
export default logger;
