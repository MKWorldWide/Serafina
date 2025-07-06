/**
 * 🎮 GameDin Discord Bot - AthenaMist Provider
 * 
 * AthenaMist AI API provider implementation for the Discord bot AI system.
 * Supports AthenaMist models with comprehensive error handling, rate limiting,
 * and cost tracking.
 * 
 * Features:
 * - Support for AthenaMist models
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
 * AthenaMist API response structure
 */
interface AthenaMistResponse {
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
 * AthenaMist API request structure
 */
interface AthenaMistRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * AthenaMist provider implementation
 */
export class AthenaMistProvider extends BaseAIProvider {
  private readonly baseUrl = 'https://api.athenamist.ai/v1/chat/completions';
  private readonly defaultModel = 'athena-mist-7b';

  constructor(apiKey: string, logger?: Logger) {
    super('AthenaMist', apiKey, logger);
    this.initializeModels();
  }

  /**
   * Check if AthenaMist provider is available
   */
  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('athena-');
  }

  /**
   * Initialize available models
   */
  private initializeModels(): void {
    // AthenaMist 7B
    this.models.set('athena-mist-7b', {
      name: 'athena-mist-7b',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      costPerToken: 0.000001 // $0.001 per 1K tokens (estimated)
    });

    // AthenaMist 13B
    this.models.set('athena-mist-13b', {
      name: 'athena-mist-13b',
      maxTokens: 8192,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      costPerToken: 0.000002 // $0.002 per 1K tokens (estimated)
    });

    // AthenaMist 70B
    this.models.set('athena-mist-70b', {
      name: 'athena-mist-70b',
      maxTokens: 16384,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      costPerToken: 0.000005 // $0.005 per 1K tokens (estimated)
    });

    this.logger.info(`Initialized ${this.models.size} AthenaMist models`);
  }

  /**
   * Generate response using AthenaMist API
   */
  protected async generateResponseInternal(
    params: AIRequestParams,
    model: AIModelConfig
  ): Promise<AIResponse> {
    const requestBody: AthenaMistRequest = {
      model: model.name,
      messages: this.buildMessages(params),
      max_tokens: params.maxTokens || model.maxTokens,
      temperature: params.temperature ?? model.temperature,
      top_p: params.topP ?? model.topP,
      frequency_penalty: params.frequencyPenalty ?? model.frequencyPenalty,
      presence_penalty: params.presencePenalty ?? model.presencePenalty
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

      const data = await response.json() as AthenaMistResponse;
      
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
        `AthenaMist API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        AIErrorType.NETWORK_ERROR,
        true
      );
    }
  }

  /**
   * Build messages array for AthenaMist API
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
   * Handle AthenaMist API errors
   */
  private async handleAPIError(response: Response): Promise<never> {
    let errorMessage = 'AthenaMist API error';
    let errorType = AIErrorType.UNKNOWN;
    let retryable = false;

    try {
      const errorData = await response.json() as any;
      errorMessage = errorData?.error?.message || errorMessage;
      
      // Map AthenaMist error codes to our error types
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