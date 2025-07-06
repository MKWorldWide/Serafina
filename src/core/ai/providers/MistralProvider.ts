/**
 * 🎮 GameDin Discord Bot - Mistral Provider
 * 
 * Mistral AI API provider implementation for the Discord bot AI system.
 * Supports Mistral-7B, Mixtral-8x7B, and other Mistral models with comprehensive
 * error handling, rate limiting, and cost tracking.
 * 
 * Features:
 * - Support for Mistral-7B, Mixtral-8x7B, and other Mistral models
 * - Rate limiting and error handling
 * - Cost tracking and usage statistics
 * - TypeScript interfaces for type safety
 * - Quantum documentation and usage tracking
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { BaseAIProvider, AIRequestParams, AIResponse, AIModelConfig, AIErrorType, AIProviderError } from '../AIProvider';
import { Logger } from '../../Logger';

/**
 * Mistral API response structure
 */
interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Mistral API request structure
 */
interface MistralRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  random_seed?: number;
  safe_prompt?: boolean;
}

/**
 * Mistral provider implementation
 */
export class MistralProvider extends BaseAIProvider {
  private readonly baseUrl = 'https://api.mistral.ai/v1/chat/completions';
  private readonly defaultModel = 'mistral-tiny';

  constructor(apiKey: string, logger?: Logger) {
    super('Mistral', apiKey, logger);
    this.initializeModels();
  }

  /**
   * Check if Mistral provider is available
   */
  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('mist-');
  }

  /**
   * Initialize available models
   */
  private initializeModels(): void {
    // Mistral Tiny (7B)
    this.models.set('mistral-tiny', {
      name: 'mistral-tiny',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      costPerToken: 0.0000014 // $0.0014 per 1K tokens
    });

    // Mistral Small (Mixtral-8x7B)
    this.models.set('mistral-small', {
      name: 'mistral-small',
      maxTokens: 32768,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      costPerToken: 0.0000042 // $0.0042 per 1K tokens
    });

    // Mistral Medium
    this.models.set('mistral-medium', {
      name: 'mistral-medium',
      maxTokens: 32768,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      costPerToken: 0.000014 // $0.014 per 1K tokens
    });

    // Mistral Large
    this.models.set('mistral-large', {
      name: 'mistral-large',
      maxTokens: 32768,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      costPerToken: 0.000042 // $0.042 per 1K tokens
    });

    this.logger.info(`Initialized ${this.models.size} Mistral models`);
  }

  /**
   * Generate response using Mistral API
   */
  protected async generateResponseInternal(
    params: AIRequestParams,
    model: AIModelConfig
  ): Promise<AIResponse> {
    const requestBody: MistralRequest = {
      model: model.name,
      messages: this.buildMessages(params),
      max_tokens: params.maxTokens || model.maxTokens,
      temperature: params.temperature ?? model.temperature,
      top_p: params.topP ?? model.topP,
      safe_prompt: true
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        await this.handleAPIError(response);
      }

      const data = await response.json() as MistralResponse;
      
      if (!data.choices || data.choices.length === 0) {
        throw new AIProviderError('No response generated', AIErrorType.UNKNOWN);
      }

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new AIProviderError('Invalid response format', AIErrorType.UNKNOWN);
      }

      const tokensUsed = data.usage?.total_tokens || 0;
      const cost = this.calculateCost(tokensUsed, model);

      return {
        content,
        model: model.name,
        tokensUsed,
        cost,
        latency: 0, // Will be set by base class
        timestamp: new Date(),
        metadata: {
          finishReason: data.choices[0]?.finish_reason || 'unknown',
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0
        }
      };
    } catch (error) {
      if (error instanceof AIProviderError) {
        throw error;
      }
      
      throw new AIProviderError(
        `Mistral API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        AIErrorType.NETWORK_ERROR,
        true
      );
    }
  }

  /**
   * Build messages array for Mistral API
   */
  private buildMessages(params: AIRequestParams): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    // Add system prompt if provided
    if (params.systemPrompt) {
      messages.push({
        role: 'system',
        content: params.systemPrompt
      });
    }

    // Add context if provided
    if (params.context) {
      messages.push({
        role: 'system',
        content: `Context: ${params.context}`
      });
    }

    // Add user prompt
    messages.push({
      role: 'user',
      content: params.prompt
    });

    return messages;
  }

  /**
   * Handle Mistral API errors
   */
  private async handleAPIError(response: Response): Promise<never> {
    let errorMessage = 'Mistral API error';
    let errorType = AIErrorType.UNKNOWN;
    let retryable = false;

    try {
      const errorData = await response.json() as any;
      errorMessage = errorData?.error?.message || errorMessage;
      
      // Map Mistral error codes to our error types
      switch (response.status) {
        case 401:
          errorType = AIErrorType.AUTHENTICATION;
          break;
        case 429:
          errorType = AIErrorType.RATE_LIMIT;
          retryable = true;
          break;
        case 400:
          errorType = AIErrorType.INVALID_REQUEST;
          break;
        case 402:
          errorType = AIErrorType.QUOTA_EXCEEDED;
          break;
        case 503:
          errorType = AIErrorType.MODEL_UNAVAILABLE;
          retryable = true;
          break;
        default:
          errorType = AIErrorType.NETWORK_ERROR;
          retryable = response.status >= 500;
      }
    } catch {
      // If we can't parse the error response, use status-based error
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    throw new AIProviderError(errorMessage, errorType, retryable);
  }

  /**
   * Calculate cost based on tokens used
   */
  private calculateCost(tokensUsed: number, model: AIModelConfig): number {
    return tokensUsed * model.costPerToken;
  }

  /**
   * Get provider-specific information
   */
  getProviderInfo(): {
    name: string;
    models: string[];
    baseUrl: string;
    defaultModel: string;
  } {
    return {
      name: this.name,
      models: Array.from(this.models.keys()),
      baseUrl: this.baseUrl,
      defaultModel: this.defaultModel
    };
  }
} 