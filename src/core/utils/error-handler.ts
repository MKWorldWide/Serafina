import { createLogger } from '../pino-logger';
import { config } from '../config';
import { 
  ChatInputCommandInteraction, 
  UserContextMenuCommandInteraction, 
  Message,
  EmbedBuilder,
  Colors,
  PermissionFlagsBits
} from 'discord.js';
import { isOwner } from './permissions';

const logger = createLogger('error-handler');

export class CommandError extends Error {
  public readonly userMessage: string;
  public readonly code: string;
  public readonly isUserFacing: boolean;
  public readonly context: Record<string, unknown>;
  
  constructor(
    message: string, 
    {
      userMessage = '❌ An error occurred while executing this command.',
      code = 'COMMAND_ERROR',
      isUserFacing = false,
      cause,
      context = {}
    }: {
      userMessage?: string;
      code?: string;
      isUserFacing?: boolean;
      cause?: unknown;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, { cause });
    this.name = 'CommandError';
    this.userMessage = userMessage;
    this.code = code;
    this.isUserFacing = isUserFacing;
    this.context = context;
  }
}

export class CooldownError extends CommandError {
  constructor(secondsLeft: number) {
    super('Command is on cooldown', {
      userMessage: `⏳ Please wait ${secondsLeft} more second(s) before using this command again.`,
      code: 'COOLDOWN_ACTIVE',
      isUserFacing: true,
      context: { secondsLeft }
    });
  }
}

export class PermissionError extends CommandError {
  constructor(permissions: string[]) {
    super('Insufficient permissions', {
      userMessage: `🔒 You need the following permissions to use this command: ${permissions.join(', ')}`,
      code: 'MISSING_PERMISSIONS',
      isUserFacing: true,
      context: { permissions }
    });
  }
}

export class OwnerOnlyError extends CommandError {
  constructor() {
    super('Owner only command', {
      userMessage: '🔒 This command can only be used by the bot owner.',
      code: 'OWNER_ONLY',
      isUserFacing: true
    });
  }
}

export class GuildOnlyError extends CommandError {
  constructor() {
    super('Guild only command', {
      userMessage: '🏰 This command can only be used in a server.',
      code: 'GUILD_ONLY',
      isUserFacing: true
    });
  }
}

export class DmOnlyError extends CommandError {
  constructor() {
    super('DM only command', {
      userMessage: '📨 This command can only be used in DMs.',
      code: 'DM_ONLY',
      isUserFacing: true
    });
  }
}

export class MaintenanceError extends CommandError {
  constructor() {
    super('Maintenance mode active', {
      userMessage: '🔧 The bot is currently under maintenance. Please try again later.',
      code: 'MAINTENANCE_MODE',
      isUserFacing: true
    });
  }
}

export class ValidationError extends CommandError {
  constructor(message: string, field?: string) {
    super('Validation error', {
      userMessage: `❌ ${message}`,
      code: 'VALIDATION_ERROR',
      isUserFacing: true,
      context: { field }
    });
  }
}

export class NotFoundError extends CommandError {
  constructor(resource: string) {
    super('Resource not found', {
      userMessage: `🔍 Could not find ${resource}.`,
      code: 'NOT_FOUND',
      isUserFacing: true,
      context: { resource }
    });
  }
}

/**
 * Global error handler for uncaught exceptions and unhandled rejections
 */
export function setupErrorHandlers(): void {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.fatal('Uncaught exception:', error);
    
    // If the error is not operational, we should probably exit
    if (!isOperationalError(error)) {
      logger.fatal('Non-operational error detected, shutting down...');
      process.exit(1);
    }
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  });
  
  // Handle process signals
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    process.exit(0);
  });
}

/**
 * Check if an error is operational (expected)
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof CommandError) {
    return true;
  }
  
  // Add other operational error types here
  
  return false;
}

/**
 * Handle command errors and send appropriate responses
 */
export async function handleCommandError(
  error: unknown,
  context: {
    interaction?: ChatInputCommandInteraction | UserContextMenuCommandInteraction;
    message?: Message;
  }
): Promise<void> {
  const { interaction, message } = context;
  
  // Log the error
  if (error instanceof CommandError) {
    logger.warn(`Command error [${error.code}]: ${error.message}`, {
      ...error.context,
      stack: error.stack
    });
  } else {
    logger.error('Unexpected command error:', error);
  }
  
  // Prepare error message
  let userMessage = '❌ An unexpected error occurred while executing this command.';
  let showErrorDetails = false;
  
  if (error instanceof CommandError) {
    userMessage = error.userMessage;
  }
  
  // Check if we should show error details to the user
  if (interaction) {
    const member = interaction.member;
    const userId = member?.user?.id || interaction.user?.id;
    
    // Show error details to bot owners in development
    if (userId && isOwner(userId) && (config.debug || config.env === 'development')) {
      showErrorDetails = true;
    }
  } else if (message) {
    // For message commands
    if (isOwner(message.author.id) && (config.debug || config.env === 'development')) {
      showErrorDetails = true;
    }
  }
  
  // Create error embed
  const embed = new EmbedBuilder()
    .setColor(Colors.Red)
    .setTitle('Error')
    .setDescription(userMessage);
  
  // Add error details if enabled
  if (showErrorDetails && error instanceof Error) {
    const details = [
      `**Name:** ${error.name}`,
      `**Message:** ${error.message}`,
      error.code && `**Code:** ${error.code}`,
      error.stack && `\`\`\`js\n${error.stack.split('\n').slice(0, 5).join('\n')}\n...\`\`\``
    ].filter(Boolean);
    
    embed.addFields({
      name: 'Debug Information',
      value: details.join('\n'),
      inline: false
    });
  }
  
  // Send the error message
  try {
    if (interaction) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          embeds: [embed],
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          embeds: [embed],
          ephemeral: true 
        });
      }
    } else if (message) {
      await message.reply({ embeds: [embed] });
    }
  } catch (replyError) {
    logger.error('Failed to send error message:', replyError);
  }
}

/**
 * Wrapper for async functions to handle errors properly
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: {
    interaction?: ChatInputCommandInteraction | UserContextMenuCommandInteraction;
    message?: Message;
  }
): (...args: Parameters<T>) => Promise<ReturnType<T> | void> {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | void> => {
    try {
      return await fn(...args);
    } catch (error) {
      await handleCommandError(error, context);
    }
  };
}

/**
 * Middleware to handle errors in command execution
 */
export function withErrorHandling(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      // Find the interaction or message in the arguments
      const interaction = args.find(arg => 
        arg?.isCommand?.() || arg?.isUserContextMenuCommand?.()
      );
      
      const message = args.find(arg => 
        arg?.author && arg?.channel && !arg?.isCommand?.()
      );
      
      await handleCommandError(error, { interaction, message });
      
      // Re-throw the error so it can be handled by the global error handler
      throw error;
    }
  };
  
  return descriptor;
}
