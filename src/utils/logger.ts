/**
 * 🎮 Serafina Discord Bot - Logger
 * 
 * A simple, type-safe logger that supports metadata and works with TypeScript strict mode.
 * 
 * Usage:
 *   logger.info('Message')
 *   logger.warn('Warning message', { additional: 'data' })
 *   logger.error('Error message', error)
 *   logger.error('Error with context', { error, context: 'additional info' })
 * 
 * @author NovaSanctum
 * @version 2.0.0
 * @since 2025-08-12
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type Meta = Record<string, unknown> | Error | undefined;

function logWith(level: LogLevel, message: string, meta?: Meta) {
  const timestamp = new Date().toISOString();
  const logEntry: Record<string, unknown> = {
    timestamp,
    level,
    message,
  };

  // Handle Error objects and regular metadata
  if (meta instanceof Error) {
    logEntry.error = {
      message: meta.message,
      stack: meta.stack,
      name: meta.name,
    };
  } else if (meta && typeof meta === 'object') {
    // Add all properties from meta to the log entry
    Object.assign(logEntry, meta);
  }

  // Format the log line as JSON for structured logging
  const logLine = JSON.stringify(logEntry);

  // Output to console with appropriate log level
  switch (level) {
    case 'error':
      console.error(logLine);
      break;
    case 'warn':
      console.warn(logLine);
      break;
    case 'info':
      console.info(logLine);
      break;
    case 'debug':
      console.debug(logLine);
      break;
  }
}

// Create the logger object with type-safe methods
export const logger = {
  debug: (message: string, meta?: Meta) => logWith('debug', message, meta),
  info: (message: string, meta?: Meta) => logWith('info', message, meta),
  warn: (message: string, meta?: Meta) => logWith('warn', message, meta),
  error: (message: string, meta?: Meta) => logWith('error', message, meta),
};

// Export types for TypeScript consumers
export type { LogLevel, Meta };
