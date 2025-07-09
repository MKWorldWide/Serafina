/**
 * 🎮 GameDin Discord Bot - AI Provider Base
 *
 * Base interface and abstract class for AI providers that will be extended
 * by specific implementations (AthenaMist, Mistral, OpenAI).
 *
 * Features:
 * - Abstract base class for AI providers
 * - TypeScript interfaces for type safety
 * - Error handling and logging
 * - Rate limiting and cost tracking
 * - Quantum documentation and usage tracking
 *
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { Logger } from '../Logger';

/**
 * AI model configuration
 */
export interface AIModelConfig {
  name: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  costPerToken: number;
}

/**
 * AI request parameters
 */
export interface AIRequestParams {
  prompt: string;
  model?: string;
  provider?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
  context?: string;
  userId?: string;
  guildId?: string;
}

/**
 * AI response structure
 */
export interface AIResponse {
  content: string;
  model: string;
  tokensUsed: number;
  cost: number;
  latency: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * AI provider statistics
 */
export interface AIProviderStats {
  provider: string;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
  errors: number;
  lastUsed: Date | null;
}

/**
 * AI provider error types
 */
export enum AIErrorType {
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_REQUEST = 'INVALID_REQUEST',
  AUTHENTICATION = 'AUTHENTICATION',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  MODEL_UNAVAILABLE = 'MODEL_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * AI provider error
 */
export class AIProviderError extends Error {
  public type: AIErrorType;
  public retryable: boolean;
  public cost: number;

  constructor(
    message: string,
    type: AIErrorType = AIErrorType.UNKNOWN,
    retryable: boolean = false,
    cost: number = 0,
  ) {
    super(message);
    this.name = 'AIProviderError';
    this.type = type;
    this.retryable = retryable;
    this.cost = cost;
  }
}

/**
 * Base AI provider interface
 */
export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  getModels(): AIModelConfig[];
  generateResponse(params: AIRequestParams): Promise<AIResponse>;
  getStats(): AIProviderStats;
  resetStats(): void;
  getCostEstimate(params: AIRequestParams): number;
}

/**
 * Abstract base class for AI providers
 */
export abstract class BaseAIProvider implements AIProvider {
  protected logger: Logger;
  protected stats: AIProviderStats;
  protected models: Map<string, AIModelConfig> = new Map();
  protected apiKey: string;
  private _name: string;

  constructor(name: string, apiKey: string, logger?: Logger) {
    this._name = name;
    this.apiKey = apiKey;
    this.logger = logger || new Logger(`AIProvider:${name}`);

    this.stats = {
      provider: name,
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0,
      errors: 0,
      lastUsed: null,
    };
  }

  /**
   * Get provider name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Check if provider is available
   */
  abstract isAvailable(): boolean;

  /**
   * Get available models
   */
  getModels(): AIModelConfig[] {
    return Array.from(this.models.values());
  }

  /**
   * Generate AI response
   */
  async generateResponse(params: AIRequestParams): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Generating response for user ${params.userId} in guild ${params.guildId}`);

      // Validate request
      this.validateRequest(params);

      // Get model configuration
      const model = this.getModelConfig(params.model);

      // Generate response
      const response = await this.generateResponseInternal(params, model);

      // Update statistics
      this.updateStats(response, Date.now() - startTime);

      this.logger.info(
        `Generated response using ${model.name}, tokens: ${response.tokensUsed}, cost: $${response.cost.toFixed(4)}`,
      );

      return response;
    } catch (error) {
      this.handleError(error, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Get provider statistics
   */
  getStats(): AIProviderStats {
    return { ...this.stats };
  }

  /**
   * Reset provider statistics
   */
  resetStats(): void {
    this.stats = {
      provider: this.name,
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0,
      errors: 0,
      lastUsed: null,
    };
    this.logger.info('Statistics reset');
  }

  /**
   * Get cost estimate for request
   */
  getCostEstimate(params: AIRequestParams): number {
    const model = this.getModelConfig(params.model);
    const estimatedTokens = this.estimateTokenCount(params.prompt);
    return estimatedTokens * model.costPerToken;
  }

  /**
   * Validate request parameters
   */
  protected validateRequest(params: AIRequestParams): void {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new AIProviderError('Prompt cannot be empty', AIErrorType.INVALID_REQUEST);
    }

    if (params.maxTokens && params.maxTokens <= 0) {
      throw new AIProviderError('Max tokens must be positive', AIErrorType.INVALID_REQUEST);
    }

    if (params.temperature && (params.temperature < 0 || params.temperature > 2)) {
      throw new AIProviderError('Temperature must be between 0 and 2', AIErrorType.INVALID_REQUEST);
    }
  }

  /**
   * Get model configuration
   */
  protected getModelConfig(modelName?: string): AIModelConfig {
    const defaultModel = Array.from(this.models.values())[0];
    if (!defaultModel) {
      throw new AIProviderError('No models available', AIErrorType.MODEL_UNAVAILABLE);
    }

    if (!modelName) {
      return defaultModel;
    }

    const model = this.models.get(modelName);
    if (!model) {
      throw new AIProviderError(`Model ${modelName} not found`, AIErrorType.MODEL_UNAVAILABLE);
    }

    return model;
  }

  /**
   * Update statistics after successful response
   */
  protected updateStats(response: AIResponse, latency: number): void {
    this.stats.totalRequests++;
    this.stats.totalTokens += response.tokensUsed;
    this.stats.totalCost += response.cost;
    this.stats.lastUsed = new Date();

    // Update average latency
    this.stats.averageLatency = (this.stats.averageLatency + latency) / 2;
  }

  /**
   * Handle errors and update statistics
   */
  protected handleError(error: any, latency: number): void {
    this.stats.errors++;
    this.stats.lastUsed = new Date();

    if (error instanceof AIProviderError) {
      this.logger.error(`AI provider error (${error.type}): ${error.message}`);
    } else {
      this.logger.error('Unknown AI provider error:', error);
    }
  }

  /**
   * Estimate token count for prompt
   * This is a rough estimation - actual tokenization may vary
   */
  protected estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Abstract method for actual response generation
   * Must be implemented by concrete providers
   */
  protected abstract generateResponseInternal(
    params: AIRequestParams,
    model: AIModelConfig,
  ): Promise<AIResponse>;
}
