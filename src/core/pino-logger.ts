import pino from 'pino';
import { config } from './config';

// Define log level type
type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

// Define the logger options
const pinoOptions: pino.LoggerOptions = {
  level: config.logging.level,
  transport: config.logging.prettyPrint
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
          messageFormat: '{module}: {msg}',
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({}),
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
};

// Create the base logger
const baseLogger = pino(pinoOptions);

// Create a child logger with the module name
const createLogger = (module: string) => {
  return baseLogger.child({ module });
};

// Export the logger instance
export const logger = createLogger('app');

// Export the createLogger function for module-specific loggers
export { createLogger };

export type { LogLevel };

// Export a function to change the log level at runtime
export const setLogLevel = (level: LogLevel) => {
  baseLogger.level = level;
};

// Export a function to get the current log level
export const getLogLevel = (): LogLevel => {
  return baseLogger.level as LogLevel;
};

// Export a function to check if a log level is enabled
export const isLevelEnabled = (level: LogLevel): boolean => {
  return baseLogger.levels.values[level] >= baseLogger.levels.values[baseLogger.level as LogLevel];
};

// Export a function to create a child logger with additional context
export const createChildLogger = (module: string, context: Record<string, unknown> = {}) => {
  return baseLogger.child({ module, ...context });
};
