/**
<<<<<<< HEAD
 * 🛡️ GameDin Discord Bot - Validation Utilities
 * 
 * This module provides comprehensive validation utilities for input sanitization,
 * type checking, and error handling throughout the bot application.
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { ValidationResult, ValidationError, ValidationRules, BotError, ErrorCode } from '../types/Bot';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates a string input with specified rules
 * @param value - The value to validate
 * @param fieldName - Name of the field being validated
 * @param rules - Validation rules to apply
 * @returns ValidationResult with validation status and errors
 */
export function validateString(
  value: any,
  fieldName: string,
  rules: ValidationRules = {}
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if value is required
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED_FIELD',
      expected: 'non-empty string',
      received: value
    });
    return { isValid: false, errors };
  }

  // If not required and value is empty, return success
  if (!rules.required && (value === undefined || value === null || value === '')) {
    return { isValid: true, errors: [], value: value || '' };
  }

  // Check if value is a string
  if (typeof value !== 'string') {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be a string`,
      code: 'INVALID_TYPE',
      expected: 'string',
      received: typeof value
    });
    return { isValid: false, errors };
  }

  // Check minimum length
  if (rules.minLength !== undefined && value.length < rules.minLength) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be at least ${rules.minLength} characters long`,
      code: 'MIN_LENGTH',
      expected: `>= ${rules.minLength} characters`,
      received: `${value.length} characters`
    });
  }

  // Check maximum length
  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be no more than ${rules.maxLength} characters long`,
      code: 'MAX_LENGTH',
      expected: `<= ${rules.maxLength} characters`,
      received: `${value.length} characters`
    });
  }

  // Check pattern match
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} does not match the required pattern`,
      code: 'PATTERN_MISMATCH',
      expected: `pattern: ${rules.pattern}`,
      received: value
    });
  }

  // Check allowed values
  if (rules.allowedValues && !rules.allowedValues.includes(value)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be one of: ${rules.allowedValues.join(', ')}`,
      code: 'INVALID_VALUE',
      expected: rules.allowedValues,
      received: value
    });
  }

  // Custom validation
  if (rules.custom) {
    const customResult = rules.custom(value);
    if (customResult !== true) {
      errors.push({
        field: fieldName,
        message: typeof customResult === 'string' ? customResult : `${fieldName} failed custom validation`,
        code: 'CUSTOM_VALIDATION',
        received: value
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: errors.length === 0 ? value : undefined
  };
}

/**
 * Validates a number input with specified rules
 * @param value - The value to validate
 * @param fieldName - Name of the field being validated
 * @param rules - Validation rules to apply
 * @returns ValidationResult with validation status and errors
 */
export function validateNumber(
  value: any,
  fieldName: string,
  rules: ValidationRules & {
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if value is required
  if (rules.required && (value === undefined || value === null)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED_FIELD',
      expected: 'number',
      received: value
    });
    return { isValid: false, errors };
  }

  // If not required and value is empty, return success
  if (!rules.required && (value === undefined || value === null)) {
    return { isValid: true, errors: [], value: value || 0 };
  }

  // Check if value is a number
  const numValue = Number(value);
  if (isNaN(numValue)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be a valid number`,
      code: 'INVALID_TYPE',
      expected: 'number',
      received: typeof value
    });
    return { isValid: false, errors };
  }

  // Check if integer is required
  if (rules.integer && !Number.isInteger(numValue)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be an integer`,
      code: 'INVALID_TYPE',
      expected: 'integer',
      received: numValue
    });
  }

  // Check minimum value
  if (rules.min !== undefined && numValue < rules.min) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be at least ${rules.min}`,
      code: 'MIN_VALUE',
      expected: `>= ${rules.min}`,
      received: numValue
    });
  }

  // Check maximum value
  if (rules.max !== undefined && numValue > rules.max) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be no more than ${rules.max}`,
      code: 'MAX_VALUE',
      expected: `<= ${rules.max}`,
      received: numValue
    });
  }

  // Check allowed values
  if (rules.allowedValues && !rules.allowedValues.includes(numValue)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be one of: ${rules.allowedValues.join(', ')}`,
      code: 'INVALID_VALUE',
      expected: rules.allowedValues,
      received: numValue
    });
  }

  // Custom validation
  if (rules.custom) {
    const customResult = rules.custom(numValue);
    if (customResult !== true) {
      errors.push({
        field: fieldName,
        message: typeof customResult === 'string' ? customResult : `${fieldName} failed custom validation`,
        code: 'CUSTOM_VALIDATION',
        received: numValue
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: errors.length === 0 ? numValue : undefined
  };
}

/**
 * Validates an array input with specified rules
 * @param value - The value to validate
 * @param fieldName - Name of the field being validated
 * @param rules - Validation rules to apply
 * @returns ValidationResult with validation status and errors
 */
export function validateArray(
  value: any,
  fieldName: string,
  rules: ValidationRules & {
    minItems?: number;
    maxItems?: number;
    itemType?: 'string' | 'number' | 'object';
  } = {}
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if value is required
  if (rules.required && (value === undefined || value === null)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED_FIELD',
      expected: 'array',
      received: value
    });
    return { isValid: false, errors };
  }

  // If not required and value is empty, return success
  if (!rules.required && (value === undefined || value === null)) {
    return { isValid: true, errors: [], value: value || [] };
  }

  // Check if value is an array
  if (!Array.isArray(value)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be an array`,
      code: 'INVALID_TYPE',
      expected: 'array',
      received: typeof value
    });
    return { isValid: false, errors };
  }

  // Check minimum items
  if (rules.minItems !== undefined && value.length < rules.minItems) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must have at least ${rules.minItems} items`,
      code: 'MIN_ITEMS',
      expected: `>= ${rules.minItems} items`,
      received: `${value.length} items`
    });
  }

  // Check maximum items
  if (rules.maxItems !== undefined && value.length > rules.maxItems) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must have no more than ${rules.maxItems} items`,
      code: 'MAX_ITEMS',
      expected: `<= ${rules.maxItems} items`,
      received: `${value.length} items`
    });
  }

  // Check item types if specified
  if (rules.itemType) {
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      let isValidType = false;

      switch (rules.itemType) {
        case 'string':
          isValidType = typeof item === 'string';
          break;
        case 'number':
          isValidType = typeof item === 'number' && !isNaN(item);
          break;
        case 'object':
          isValidType = typeof item === 'object' && item !== null;
          break;
      }

      if (!isValidType) {
        errors.push({
          field: `${fieldName}[${i}]`,
          message: `Item at index ${i} must be a ${rules.itemType}`,
          code: 'INVALID_ITEM_TYPE',
          expected: rules.itemType,
          received: typeof item
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: errors.length === 0 ? value : undefined
  };
}

// ============================================================================
// SANITIZATION UTILITIES
// ============================================================================

/**
 * Sanitizes a string by removing potentially dangerous content
 * @param input - The string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeString(
  input: string,
  options: {
    removeHtml?: boolean;
    removeScripts?: boolean;
    maxLength?: number;
    allowLinks?: boolean;
  } = {}
): string {
  let sanitized = input;

  // Remove HTML tags if requested
  if (options.removeHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Remove script tags and content
  if (options.removeScripts) {
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  // Remove or validate links
  if (!options.allowLinks) {
    sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[LINK]');
  }

  // Truncate if too long
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength) + '...';
  }

  return sanitized.trim();
}

/**
 * Sanitizes user input for Discord messages
 * @param input - The user input to sanitize
 * @returns Sanitized input safe for Discord
 */
export function sanitizeDiscordInput(input: string): string {
  return sanitizeString(input, {
    removeHtml: true,
    removeScripts: true,
    maxLength: 2000, // Discord message limit
    allowLinks: true
  });
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Creates a validation error from validation result
 * @param result - Validation result
 * @param context - Additional context
 * @returns BotError instance
 */
export function createValidationError(
  result: ValidationResult,
  context?: Record<string, any>
): BotError {
  const errorMessages = result.errors.map(error => `${error.field}: ${error.message}`).join('; ');
  
  return new BotError(
    `Validation failed: ${errorMessages}`,
    ErrorCode.VALIDATION_INVALID_INPUT,
    { ...context, validationErrors: result.errors },
    'Please check your input and try again.',
    true
  );
}

/**
 * Validates and sanitizes command arguments
 * @param args - Command arguments to validate
 * @param schema - Validation schema for arguments
 * @returns Sanitized and validated arguments
 */
export function validateCommandArgs(
  args: Record<string, any>,
  schema: Record<string, ValidationRules>
): { isValid: boolean; errors: ValidationError[]; sanitizedArgs: Record<string, any> } {
  const errors: ValidationError[] = [];
  const sanitizedArgs: Record<string, any> = {};

  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = args[fieldName];
    
    if (typeof value === 'string') {
      const result = validateString(value, fieldName, rules);
      if (!result.isValid) {
        errors.push(...result.errors);
      } else {
        sanitizedArgs[fieldName] = sanitizeDiscordInput(result.value);
      }
    } else if (typeof value === 'number') {
      const result = validateNumber(value, fieldName, rules);
      if (!result.isValid) {
        errors.push(...result.errors);
      } else {
        sanitizedArgs[fieldName] = result.value;
      }
    } else if (Array.isArray(value)) {
      const result = validateArray(value, fieldName, rules);
      if (!result.isValid) {
        errors.push(...result.errors);
      } else {
        sanitizedArgs[fieldName] = result.value;
      }
    } else if (rules.required) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        code: 'REQUIRED_FIELD',
        expected: 'valid value',
        received: value
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedArgs
  };
}

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

/**
 * Common validation schemas for frequently used patterns
 */
export const CommonSchemas = {
  /** Username validation schema */
  username: {
    minLength: 3,
    maxLength: 32,
    pattern: /^[a-zA-Z0-9_]+$/,
    required: true
  },

  /** Email validation schema */
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true
  },

  /** Discord ID validation schema */
  discordId: {
    pattern: /^\d{17,19}$/,
    required: true
  },

  /** Reason validation schema */
  reason: {
    minLength: 1,
    maxLength: 500,
    required: true
  },

  /** Duration validation schema */
  duration: {
    min: 1,
    max: 10080, // 1 week in minutes
    integer: true,
    required: true
=======
 * Validation Utility
 * 
 * This utility provides form validation using Zod schemas.
 * It includes predefined schemas for common input types
 * and helper functions for form validation.
 */

import { z } from 'zod';

// ========== Basic Input Schemas ==========

/**
 * Email validation schema
 * - Must be a valid email format
 * - Normalized to lowercase
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .transform(val => val.toLowerCase().trim());

/**
 * Username validation schema
 * - 3-20 characters
 * - Alphanumeric with underscores and hyphens only
 * - Must start with a letter
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username cannot exceed 20 characters')
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_-]*$/,
    'Username must start with a letter and contain only letters, numbers, underscores, and hyphens'
  )
  .transform(val => val.trim());

/**
 * Password validation schema
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Optional special character requirement
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
    'Password must include at least one uppercase letter, one lowercase letter, and one number'
  );

/**
 * Confirmation password validation schema
 * - Must match the password field
 */
export const confirmPasswordSchema = (passwordField: string) =>
  z.string().refine(val => val === passwordField, {
    message: 'Passwords do not match'
  });

/**
 * Display name validation schema
 * - 2-30 characters
 * - Allows letters, numbers, spaces, and common punctuation
 */
export const displayNameSchema = z
  .string()
  .min(2, 'Display name must be at least 2 characters')
  .max(30, 'Display name cannot exceed 30 characters')
  .regex(
    /^[a-zA-Z0-9\s.,'-]+$/,
    'Display name can only contain letters, numbers, spaces, and basic punctuation'
  )
  .transform(val => val.trim());

/**
 * Bio/About validation schema
 * - Up to 500 characters
 */
export const bioSchema = z
  .string()
  .max(500, 'Bio cannot exceed 500 characters')
  .optional()
  .transform(val => val?.trim() || '');

// ========== Form Schemas ==========

/**
 * Login form schema
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

/**
 * Registration form schema
 */
export const registrationFormSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: displayNameSchema.optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' })
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

/**
 * Profile update schema
 */
export const profileUpdateSchema = z.object({
  displayName: displayNameSchema,
  bio: bioSchema,
  email: emailSchema.optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional()
}).refine(data => {
  // If any password field is filled, all password fields must be filled
  const { currentPassword, newPassword, confirmNewPassword } = data;
  const somePasswordFieldFilled = currentPassword || newPassword || confirmNewPassword;
  const allPasswordFieldsFilled = currentPassword && newPassword && confirmNewPassword;
  
  return !somePasswordFieldFilled || allPasswordFieldsFilled;
}, {
  message: 'All password fields are required to change your password',
  path: ['currentPassword']
}).refine(data => {
  // If password fields are filled, new password must match confirmation
  const { newPassword, confirmNewPassword } = data;
  return !newPassword || newPassword === confirmNewPassword;
}, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword']
}).refine(data => {
  // If changing password, validate the new password format
  const { newPassword } = data;
  
  if (!newPassword) return true;
  
  try {
    passwordSchema.parse(newPassword);
    return true;
  } catch (error) {
    return false;
  }
}, {
  message: 'New password must include at least one uppercase letter, one lowercase letter, and one number',
  path: ['newPassword']
});

/**
 * Message submission schema
 */
export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long (max 2000 characters)'),
  attachments: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['image', 'video', 'audio', 'file']),
      url: z.string().url(),
      name: z.string(),
      size: z.number().positive(),
      mimeType: z.string()
    })
  ).optional()
});

/**
 * Conversation creation schema
 */
export const conversationSchema = z.object({
  title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
  participantIds: z.array(z.string()).min(1, 'At least one participant is required')
});

/**
 * Rate limiting and spam prevention schema
 * - For validating user actions against rate limits
 */
export const rateCheckSchema = z.object({
  userId: z.string(),
  action: z.enum(['message', 'friend_request', 'conversation_create']),
  timestamp: z.number()
});

// ========== Validation Helper Functions ==========

/**
 * Type for validation results
 */
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  errorMessage?: string;
};

/**
 * Validate data against a schema
 */
export function validateSchema<T>(schema: z.ZodType<T>, data: unknown): ValidationResult<T> {
  try {
    const validData = schema.parse(data);
    return {
      success: true,
      data: validData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert ZodError to a more usable format
      const errors: Record<string, string> = {};
      
      for (const issue of error.errors) {
        const path = issue.path.join('.');
        errors[path || 'form'] = issue.message;
      }
      
      return {
        success: false,
        errors,
        errorMessage: error.errors[0]?.message || 'Validation failed'
      };
    }
    
    // Handle non-Zod errors
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

/**
 * Validate a form asynchronously
 * - Useful for forms with async validation (e.g., checking if a username is taken)
 */
export async function validateFormAsync<T>(
  schema: z.ZodType<T>,
  data: unknown,
  asyncValidators?: Array<(data: T) => Promise<ValidationResult<T>>>
): Promise<ValidationResult<T>> {
  // First validate with schema
  const result = validateSchema(schema, data);
  
  if (!result.success || !result.data || !asyncValidators) {
    return result;
  }
  
  // Run async validators
  for (const validator of asyncValidators) {
    const asyncResult = await validator(result.data);
    
    if (!asyncResult.success) {
      return {
        success: false,
        data: result.data,
        errors: asyncResult.errors,
        errorMessage: asyncResult.errorMessage
      };
    }
  }
  
  return result;
}

/**
 * Check if a field has an error
 */
export function hasError(errors: Record<string, string> | undefined, field: string): boolean {
  return !!errors && !!errors[field];
}

/**
 * Get error message for a field
 */
export function getErrorMessage(errors: Record<string, string> | undefined, field: string): string | undefined {
  return errors?.[field];
}

/**
 * Validate email uniqueness
 */
export async function validateEmailUnique(email: string): Promise<ValidationResult<string>> {
  try {
    // Replace with actual API call
    const response = await fetch(`/api/validate/email?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    
    if (!data.available) {
      return {
        success: false,
        errors: { email: 'This email is already in use' },
        errorMessage: 'This email is already in use'
      };
    }
    
    return { success: true, data: email };
  } catch (error) {
    return {
      success: false,
      errorMessage: 'Could not verify email availability'
    };
  }
}

/**
 * Validate username uniqueness
 */
export async function validateUsernameUnique(username: string): Promise<ValidationResult<string>> {
  try {
    // Replace with actual API call
    const response = await fetch(`/api/validate/username?username=${encodeURIComponent(username)}`);
    const data = await response.json();
    
    if (!data.available) {
      return {
        success: false,
        errors: { username: 'This username is already taken' },
        errorMessage: 'This username is already taken'
      };
    }
    
    return { success: true, data: username };
  } catch (error) {
    return {
      success: false,
      errorMessage: 'Could not verify username availability'
    };
  }
}

/**
 * Check rate limit for actions
 */
export async function checkRateLimit(
  userId: string,
  action: 'message' | 'friend_request' | 'conversation_create'
): Promise<ValidationResult<boolean>> {
  try {
    // Replace with actual API call
    const response = await fetch('/api/ratelimit/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action,
        timestamp: Date.now()
      })
    });
    
    const data = await response.json();
    
    if (!data.allowed) {
      return {
        success: false,
        errorMessage: data.message || `You've reached the rate limit for this action. Please try again later.`
      };
    }
    
    return { success: true, data: true };
  } catch (error) {
    // In case of error, allow the action but log the issue
    console.error('Rate limit check failed:', error);
    return { success: true, data: true };
  }
}

export default {
  validateSchema,
  validateFormAsync,
  hasError,
  getErrorMessage,
  validateEmailUnique,
  validateUsernameUnique,
  checkRateLimit,
  schemas: {
    login: loginFormSchema,
    registration: registrationFormSchema,
    profileUpdate: profileUpdateSchema,
    message: messageSchema,
    conversation: conversationSchema
>>>>>>> upstream/main
  }
}; 