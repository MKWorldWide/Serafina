/**
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
  }
}; 