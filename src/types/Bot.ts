/**
 * 🎮 GameDin Discord Bot - Core Type Definitions
 *
 * This file contains comprehensive TypeScript interfaces and types for the GameDin Discord bot.
 * These types ensure type safety, improve code organization, and provide better developer experience.
 *
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

// ============================================================================
// CORE BOT TYPES
// ============================================================================

/**
 * Bot configuration interface for environment-based settings
 * Contains all necessary configuration for the bot to operate
 */
export interface BotConfig {
  /** Discord bot token for authentication */
  token: string;
  /** Discord application client ID */
  clientId: string;
  /** Primary guild/server ID */
  guildId: string;
  /** Current environment (development, production, testing) */
  environment: 'development' | 'production' | 'testing';
  /** Database connection string */
  databaseUrl?: string;
  /** Redis connection string for caching */
  redisUrl?: string;
  /** OpenAI API key for AI features */
  openaiApiKey?: string;
  /** Logging level configuration */
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  /** Whether to enable debug mode */
  debug: boolean;
  /** Maximum number of concurrent operations */
  maxConcurrency: number;
  /** Rate limiting configuration */
  rateLimit: {
    /** Maximum requests per window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
  };
}

/**
 * Command interface for slash commands
 * Defines the structure of bot commands
 */
export interface Command {
  /** Command data for Discord API */
  data: any;
  /** Command execution function */
  execute: (interaction: any) => Promise<void>;
  /** Command cooldown in seconds */
  cooldown?: number;
  /** Required permissions for command */
  permissions?: string[];
  /** Whether command is enabled */
  enabled?: boolean;
}

/**
 * Event interface for Discord events
 * Defines the structure of event handlers
 */
export interface Event {
  /** Event name */
  name: string;
  /** Whether event should only fire once */
  once?: boolean;
  /** Event execution function */
  execute: (...args: any[]) => Promise<void> | void;
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

/**
 * Custom error codes for different types of bot errors
 * Provides consistent error handling across the application
 */
export enum ErrorCode {
  // Configuration Errors
  CONFIG_MISSING_TOKEN = 'CONFIG_MISSING_TOKEN',
  CONFIG_INVALID_PERMISSIONS = 'CONFIG_INVALID_PERMISSIONS',
  CONFIG_DATABASE_CONNECTION = 'CONFIG_DATABASE_CONNECTION',

  // Command Errors
  COMMAND_NOT_FOUND = 'COMMAND_NOT_FOUND',
  COMMAND_PERMISSION_DENIED = 'COMMAND_PERMISSION_DENIED',
  COMMAND_COOLDOWN_ACTIVE = 'COMMAND_COOLDOWN_ACTIVE',
  COMMAND_INVALID_ARGS = 'COMMAND_INVALID_ARGS',
  COMMAND_EXECUTION_FAILED = 'COMMAND_EXECUTION_FAILED',

  // Service Errors
  SERVICE_INITIALIZATION_FAILED = 'SERVICE_INITIALIZATION_FAILED',
  SERVICE_DATABASE_ERROR = 'SERVICE_DATABASE_ERROR',
  SERVICE_RATE_LIMIT_EXCEEDED = 'SERVICE_RATE_LIMIT_EXCEEDED',

  // Discord API Errors
  DISCORD_API_ERROR = 'DISCORD_API_ERROR',
  DISCORD_PERMISSION_ERROR = 'DISCORD_PERMISSION_ERROR',
  DISCORD_RATE_LIMIT = 'DISCORD_RATE_LIMIT',
  DISCORD_CHANNEL_NOT_FOUND = 'DISCORD_CHANNEL_NOT_FOUND',
  DISCORD_ROLE_NOT_FOUND = 'DISCORD_ROLE_NOT_FOUND',

  // Validation Errors
  VALIDATION_INVALID_INPUT = 'VALIDATION_INVALID_INPUT',
  VALIDATION_MISSING_REQUIRED = 'VALIDATION_MISSING_REQUIRED',
  VALIDATION_OUT_OF_RANGE = 'VALIDATION_OUT_OF_RANGE',

  // System Errors
  SYSTEM_MEMORY_ERROR = 'SYSTEM_MEMORY_ERROR',
  SYSTEM_NETWORK_ERROR = 'SYSTEM_NETWORK_ERROR',
  SYSTEM_UNKNOWN_ERROR = 'SYSTEM_UNKNOWN_ERROR',
}

/**
 * Custom bot error class with enhanced error information
 * Extends the base Error class with additional context and error codes
 */
export class BotError extends Error {
  /** Unique error code for categorization */
  public readonly code: ErrorCode;
  /** Additional context information */
  public readonly context?: Record<string, any>;
  /** Timestamp when the error occurred */
  public readonly timestamp: Date;
  /** Whether the error is recoverable */
  public readonly recoverable: boolean;
  /** Suggested user-friendly message */
  public readonly userMessage?: string;

  constructor(
    message: string,
    code: ErrorCode,
    context?: Record<string, any>,
    userMessage?: string,
    recoverable: boolean = true,
  ) {
    super(message);
    this.name = 'BotError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.recoverable = recoverable;
    this.userMessage = userMessage;
  }

  /**
   * Convert error to a user-friendly format
   * @returns Formatted error message for users
   */
  toUserMessage(): string {
    return this.userMessage || 'An unexpected error occurred. Please try again later.';
  }

  /**
   * Convert error to log format
   * @returns Formatted error for logging
   */
  toLogMessage(): string {
    return `[${this.code}] ${this.message} | Context: ${JSON.stringify(this.context)}`;
  }
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation result interface for input validation
 * Provides structured validation results with detailed error information
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of validation errors */
  errors: ValidationError[];
  /** Sanitized/processed value */
  value?: any;
}

/**
 * Individual validation error with detailed information
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string;
  /** Error message describing the validation failure */
  message: string;
  /** Expected value or format */
  expected?: any;
  /** Actual value received */
  received?: any;
  /** Error code for categorization */
  code: string;
}

/**
 * Validation rules for different input types
 * Defines validation patterns and constraints
 */
export interface ValidationRules {
  /** Minimum length requirement */
  minLength?: number;
  /** Maximum length requirement */
  maxLength?: number;
  /** Regular expression pattern */
  pattern?: RegExp;
  /** Required field flag */
  required?: boolean;
  /** Allowed values (for enums) */
  allowedValues?: any[];
  /** Custom validation function */
  custom?: (value: any) => boolean | string;
}

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

/**
 * Base service interface for all bot services
 * Provides common methods and properties for service classes
 */
export interface BaseService {
  /** Service name for identification */
  readonly name: string;
  /** Whether the service is initialized */
  readonly isInitialized: boolean;
  /** Service configuration */
  readonly config?: Record<string, any>;

  /**
   * Initialize the service
   * @param config Service configuration
   * @returns Promise that resolves when initialization is complete
   */
  initialize(config?: Record<string, any> | undefined): Promise<void>;

  /**
   * Shutdown the service gracefully
   * @returns Promise that resolves when shutdown is complete
   */
  shutdown(): Promise<void>;

  /**
   * Get service health status
   * @returns Service health information
   */
  getHealth(): ServiceHealth;
}

/**
 * Service health information
 * Provides status and metrics for service monitoring
 */
export interface ServiceHealth {
  /** Service name */
  name: string;
  /** Current status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Last health check timestamp */
  lastCheck: Date;
  /** Error count since last reset */
  errorCount: number;
  /** Response time in milliseconds */
  responseTime: number;
  /** Additional health metrics */
  metrics: Record<string, any>;
}

/**
 * Server Manager service interface
 * Handles server structure and channel management
 */
export interface ServerManager extends BaseService {
  /** Associated guild/server */
  readonly guild: any;

  /**
   * Initialize server structure
   * @returns Promise that resolves when initialization is complete
   */
  initializeServer(): Promise<void>;

  /**
   * Create or update server roles
   * @returns Promise that resolves when roles are created
   */
  createRoles(): Promise<void>;

  /**
   * Create or update server channels
   * @returns Promise that resolves when channels are created
   */
  createCategoriesAndChannels(): Promise<void>;

  /**
   * Get welcome message for new members
   * @returns Promise that resolves to welcome message
   */
  getWelcomeMessage(): Promise<string>;

  /**
   * Assign default role to member
   * @param memberId Discord member ID
   * @returns Promise that resolves when role is assigned
   */
  assignDefaultRole(memberId: string): Promise<void>;
}

/**
 * Auto Moderator service interface
 * Handles content moderation and spam protection
 */
export interface AutoModerator extends BaseService {
  /**
   * Handle incoming message for moderation
   * @param message Discord message to moderate
   * @returns Promise that resolves when moderation is complete
   */
  handleMessage(message: any): Promise<void>;

  /**
   * Check if message contains inappropriate content
   * @param content Message content to check
   * @returns Promise that resolves to moderation result
   */
  checkContent(content: string): Promise<ModerationResult>;

  /**
   * Check for spam patterns
   * @param userId User ID to check
   * @returns Promise that resolves to spam detection result
   */
  checkSpam(userId: string): Promise<SpamResult>;
}

/**
 * XP Manager service interface
 * Handles user experience points and leveling
 */
export interface XPManager extends BaseService {
  /**
   * Handle message for XP calculation
   * @param member Guild member who sent message
   * @returns Promise that resolves when XP is processed
   */
  handleMessage(member: any): Promise<void>;

  /**
   * Handle voice channel join
   * @param member Guild member who joined voice
   * @param channelId Voice channel ID
   * @returns Promise that resolves when voice XP is processed
   */
  handleVoiceJoin(member: any, channelId: string): Promise<void>;

  /**
   * Handle voice channel leave
   * @param member Guild member who left voice
   * @returns Promise that resolves when voice XP is processed
   */
  handleVoiceLeave(member: any): Promise<void>;

  /**
   * Get user XP and level information
   * @param userId User ID to get info for
   * @returns Promise that resolves to user XP data
   */
  getUserXP(userId: string): Promise<UserXPData>;
}

// ============================================================================
// MODERATION TYPES
// ============================================================================

/**
 * Moderation result from content checking
 * Provides detailed information about moderation actions
 */
export interface ModerationResult {
  /** Whether content is appropriate */
  isAppropriate: boolean;
  /** Moderation action taken */
  action: ModerationAction;
  /** Reason for moderation */
  reason: string;
  /** Confidence level (0-1) */
  confidence: number;
  /** Detected issues */
  issues: string[];
  /** Suggested user message */
  userMessage?: string;
}

/**
 * Spam detection result
 * Provides information about spam patterns
 */
export interface SpamResult {
  /** Whether user is spamming */
  isSpamming: boolean;
  /** Spam score (0-1) */
  spamScore: number;
  /** Number of messages in window */
  messageCount: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Suggested action */
  action: 'warn' | 'mute' | 'kick' | 'none';
}

/**
 * Available moderation actions
 */
export type ModerationAction = 'none' | 'warn' | 'delete' | 'mute' | 'kick' | 'ban';

// ============================================================================
// XP SYSTEM TYPES
// ============================================================================

/**
 * User XP data structure
 * Contains user experience points and level information
 */
export interface UserXPData {
  /** User ID */
  userId: string;
  /** Current XP points */
  xp: number;
  /** Current level */
  level: number;
  /** XP needed for next level */
  xpForNextLevel: number;
  /** Total XP earned */
  totalXP: number;
  /** Last activity timestamp */
  lastActivity: Date;
  /** Voice time in minutes */
  voiceTime: number;
  /** Message count */
  messageCount: number;
  /** Achievements earned */
  achievements: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Result wrapper for operations that may fail
 * Provides consistent error handling pattern
 */
export type Result<T, E = BotError> = { success: true; data: T } | { success: false; error: E };

/**
 * Async result wrapper for async operations
 */
export type AsyncResult<T, E = BotError> = Promise<Result<T, E>>;

/**
 * Partial type with all properties optional
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Deep partial type for nested objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Event handler function type
 * Provides consistent event handling pattern
 */
export type EventHandler<T = any> = (data: T) => Promise<void> | void;

/**
 * Command handler function type
 * Provides consistent command handling pattern
 */
export type CommandHandler = (interaction: any) => Promise<void>;
