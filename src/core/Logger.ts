/**
 * 🎮 GameDin Discord Bot - Logger
 *
 * Comprehensive logging system for the Discord bot with multiple log levels,
 * formatting, and error handling capabilities.
 *
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Timestamp formatting
 * - Module-specific logging
 * - Error stack trace handling
 * - Performance tracking
 *
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

/**
 * Comprehensive logger for Discord bot
 */
export class Logger {
  private module: string;
  private level: LogLevel;
  private enableColors: boolean;

  constructor(module: string, level: LogLevel = LogLevel.INFO, enableColors: boolean = true) {
    this.module = module;
    this.level = level;
    this.enableColors = enableColors;
  }

  /**
   * Get current timestamp in ISO format
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format log level for display
   */
  private formatLevel(level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };

    const reset = '\x1b[0m';
    const levelNames = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.ERROR]: 'ERROR',
    };

    if (this.enableColors) {
      return `${colors[level]}${levelNames[level]}${reset}`;
    }

    return levelNames[level];
  }

  /**
   * Create log entry
   */
  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: this.getTimestamp(),
      level,
      module: this.module,
      message,
      data,
    };
  }

  /**
   * Output log entry to console
   */
  private output(entry: LogEntry): void {
    if (entry.level < this.level) return;

    const timestamp = entry.timestamp;
    const level = this.formatLevel(entry.level);
    const module = this.enableColors ? `\x1b[35m${entry.module}\x1b[0m` : entry.module;
    const message = entry.message;

    const logLine = `[${timestamp}] ${level} [${module}] ${message}`;

    if (entry.data) {
      console.log(logLine, entry.data);
    } else {
      console.log(logLine);
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: any): void {
    this.output(this.createLogEntry(LogLevel.DEBUG, message, data));
  }

  /**
   * Info level logging
   */
  info(message: string, data?: any): void {
    this.output(this.createLogEntry(LogLevel.INFO, message, data));
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: any): void {
    this.output(this.createLogEntry(LogLevel.WARN, message, data));
  }

  /**
   * Error level logging with stack trace
   */
  error(message: string, error?: any): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message);

    if (error instanceof Error) {
      entry.data = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      entry.data = error;
    }

    this.output(entry);
  }

  /**
   * Performance timing
   */
  time(label: string): void {
    console.time(`[${this.module}] ${label}`);
  }

  /**
   * End performance timing
   */
  timeEnd(label: string): void {
    console.timeEnd(`[${this.module}] ${label}`);
  }

  /**
   * Create a child logger with different module name
   */
  child(module: string): Logger {
    return new Logger(`${this.module}:${module}`, this.level, this.enableColors);
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Enable/disable colors
   */
  setColors(enabled: boolean): void {
    this.enableColors = enabled;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Get module name
   */
  getModule(): string {
    return this.module;
  }
}
