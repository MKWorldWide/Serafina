// Simple logger implementation to replace winston temporarily
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

const logLevels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};

const currentLogLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

const shouldLog = (level: LogLevel): boolean => {
  return logLevels[level] <= logLevels[currentLogLevel];
};

const log = (level: LogLevel, message: string, meta: Record<string, unknown> = {}) => {
  if (!shouldLog(level)) return;
  
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 
    ? ' ' + JSON.stringify(meta, null, 2)
    : '';
  
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  
  if (level === 'error') {
    console.error(logMessage);
  } else if (level === 'warn') {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }
};

export default {
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  trace: (message: string, meta?: Record<string, unknown>) => log('trace', message, meta),
};
