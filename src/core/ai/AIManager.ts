/**
 * 🎮 GameDin Discord Bot - AI Manager
 * 
 * Central AI management system that coordinates all AI providers (OpenAI, Mistral, AthenaMist)
 * and provides a unified interface for AI interactions with load balancing, fallback,
 * and comprehensive monitoring.
 * 
 * Features:
 * - Multi-provider support with load balancing
 * - Automatic fallback on provider failures
 * - Cost tracking and usage statistics
 * - Provider health monitoring
 * - TypeScript interfaces for type safety
 * - Quantum documentation and usage tracking
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import { AIProvider, AIRequestParams, AIResponse, AIProviderStats, AIErrorType, AIProviderError } from './AIProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { MistralProvider } from './providers/MistralProvider';
import { AthenaMistProvider } from './providers/AthenaMistProvider';
import { Logger } from '../Logger';

/**
 * AI Manager configuration
 */
export interface AIManagerConfig {
  openaiKey?: string;
  mistralKey?: string;
  athenaMistKey?: string;
  defaultProvider?: string;
  enableFallback?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  costLimit?: number;
  rateLimit?: number;
}

/**
 * AI Manager statistics
 */
export interface AIManagerStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
  errors: number;
  providerStats: Record<string, AIProviderStats>;
  lastUsed: Date | null;
}

/**
 * Provider health status
 */
export interface ProviderHealth {
  provider: string;
  available: boolean;
  lastCheck: Date;
  errorCount: number;
  averageLatency: number;
}

/**
 * Comprehensive AI manager for Discord bot
 */
export class AIManager {
  private providers: Map<string, AIProvider> = new Map();
  private logger: Logger;
  private config: AIManagerConfig;
  private stats: AIManagerStats;
  private healthChecks: Map<string, ProviderHealth> = new Map();

  constructor(config: AIManagerConfig, logger?: Logger) {
    this.config = {
      enableFallback: true,
      maxRetries: 3,
      retryDelay: 1000,
      costLimit: 100, // $100 limit
      rateLimit: 100, // 100 requests per minute
      ...config
    };
    
    this.logger = logger || new Logger('AIManager');
    
    this.stats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0,
      errors: 0,
      providerStats: {},
      lastUsed: null
    };

    this.initializeProviders();
  }

  /**
   * Initialize AI providers based on configuration
   */
  private initializeProviders(): void {
    // Initialize OpenAI provider
    if (this.config.openaiKey) {
      const openaiProvider = new OpenAIProvider(this.config.openaiKey, this.logger.child('OpenAI'));
      this.providers.set('openai', openaiProvider);
      this.healthChecks.set('openai', {
        provider: 'openai',
        available: openaiProvider.isAvailable(),
        lastCheck: new Date(),
        errorCount: 0,
        averageLatency: 0
      });
      this.logger.info('OpenAI provider initialized');
    }

    // Initialize Mistral provider
    if (this.config.mistralKey) {
      const mistralProvider = new MistralProvider(this.config.mistralKey, this.logger.child('Mistral'));
      this.providers.set('mistral', mistralProvider);
      this.healthChecks.set('mistral', {
        provider: 'mistral',
        available: mistralProvider.isAvailable(),
        lastCheck: new Date(),
        errorCount: 0,
        averageLatency: 0
      });
      this.logger.info('Mistral provider initialized');
    }

    // Initialize AthenaMist provider
    if (this.config.athenaMistKey) {
      const athenaMistProvider = new AthenaMistProvider(this.config.athenaMistKey, this.logger.child('AthenaMist'));
      this.providers.set('athenamist', athenaMistProvider);
      this.healthChecks.set('athenamist', {
        provider: 'athenamist',
        available: athenaMistProvider.isAvailable(),
        lastCheck: new Date(),
        errorCount: 0,
        averageLatency: 0
      });
      this.logger.info('AthenaMist provider initialized');
    }

    this.logger.info(`Initialized ${this.providers.size} AI providers`);
  }

  /**
   * Generate AI response with automatic provider selection and fallback
   */
  async generateResponse(params: AIRequestParams): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Generating response for user ${params.userId} in guild ${params.guildId}`);
      
      // Check cost limits
      if (!this.checkCostLimit(params)) {
        throw new AIProviderError('Cost limit exceeded', AIErrorType.QUOTA_EXCEEDED);
      }

      // Select provider
      const provider = this.selectProvider(params);
      if (!provider) {
        throw new AIProviderError('No available AI providers', AIErrorType.MODEL_UNAVAILABLE);
      }

      // Generate response with retries
      const response = await this.generateResponseWithRetry(provider, params);
      
      // Update statistics
      this.updateStats(response, Date.now() - startTime);
      
      this.logger.info(`Generated response using ${provider.name}, tokens: ${response.tokensUsed}, cost: $${response.cost.toFixed(4)}`);
      
      return response;
    } catch (error) {
      this.handleError(error, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Select the best available provider
   */
  private selectProvider(params: AIRequestParams): AIProvider | null {
    const availableProviders = Array.from(this.providers.values()).filter(provider => {
      const health = this.healthChecks.get(provider.name.toLowerCase());
      return provider.isAvailable() && health?.available;
    });

    if (availableProviders.length === 0) {
      return null;
    }

    // If specific provider is requested, try to use it
    if (params.provider && this.providers.has(params.provider)) {
      const provider = this.providers.get(params.provider)!;
      if (provider.isAvailable()) {
        return provider;
      }
    }

    // Use default provider if specified
    if (this.config.defaultProvider && this.providers.has(this.config.defaultProvider)) {
      const provider = this.providers.get(this.config.defaultProvider)!;
      if (provider.isAvailable()) {
        return provider;
      }
    }

    // Select provider based on health and cost
    return this.selectBestProvider(availableProviders);
  }

  /**
   * Select the best provider based on health and cost
   */
  private selectBestProvider(providers: AIProvider[]): AIProvider {
    // Sort by health score (lower error count, lower latency)
    const scoredProviders = providers.map(provider => {
      const health = this.healthChecks.get(provider.name.toLowerCase());
      if (!health) {
        return { provider, healthScore: 999999 }; // High score for unknown health
      }
      const healthScore = health.errorCount * 10 + health.averageLatency;
      return { provider, healthScore };
    });

    scoredProviders.sort((a, b) => a.healthScore - b.healthScore);
    if (scoredProviders.length === 0) {
      throw new AIProviderError('No available providers', AIErrorType.MODEL_UNAVAILABLE);
    }
    return scoredProviders[0]!.provider;
  }

  /**
   * Generate response with retry logic
   */
  private async generateResponseWithRetry(
    provider: AIProvider,
    params: AIRequestParams,
    retryCount: number = 0
  ): Promise<AIResponse> {
    try {
      return await provider.generateResponse(params);
    } catch (error) {
      if (error instanceof AIProviderError && error.retryable && retryCount < (this.config.maxRetries || 3)) {
        this.logger.warn(`Retrying ${provider.name} (attempt ${retryCount + 1}/${this.config.maxRetries})`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay || 1000));
        
        return this.generateResponseWithRetry(provider, params, retryCount + 1);
      }

      // If fallback is enabled and this isn't the last provider, try another
      if (this.config.enableFallback && retryCount === 0) {
        const fallbackProvider = this.selectFallbackProvider(provider);
        if (fallbackProvider) {
          this.logger.info(`Falling back to ${fallbackProvider.name}`);
          return this.generateResponseWithRetry(fallbackProvider, params, 0);
        }
      }

      throw error;
    }
  }

  /**
   * Select a fallback provider
   */
  private selectFallbackProvider(excludeProvider: AIProvider): AIProvider | null {
    const availableProviders = Array.from(this.providers.values()).filter(provider => 
      provider !== excludeProvider && provider.isAvailable()
    );

    if (availableProviders.length === 0) {
      return null;
    }

    return this.selectBestProvider(availableProviders);
  }

  /**
   * Check if request exceeds cost limit
   */
  private checkCostLimit(params: AIRequestParams): boolean {
    if (!this.config.costLimit) return true;

    const totalCost = this.stats.totalCost;
    const estimatedCost = this.estimateRequestCost(params);
    
    return totalCost + estimatedCost <= this.config.costLimit;
  }

  /**
   * Estimate cost for request
   */
  private estimateRequestCost(params: AIRequestParams): number {
    const provider = this.selectProvider(params);
    if (!provider) return 0;

    return provider.getCostEstimate(params);
  }

  /**
   * Update statistics after successful response
   */
  private updateStats(response: AIResponse, latency: number): void {
    this.stats.totalRequests++;
    this.stats.totalTokens += response.tokensUsed;
    this.stats.totalCost += response.cost;
    this.stats.lastUsed = new Date();
    
    // Update average latency
    this.stats.averageLatency = (this.stats.averageLatency + latency) / 2;

    // Update provider statistics
    for (const [name, provider] of this.providers) {
      this.stats.providerStats[name] = provider.getStats();
    }

    // Update health check
    const modelPrefix = response.model.split('-')[0];
    if (modelPrefix) {
      const health = this.healthChecks.get(modelPrefix);
      if (health) {
        health.lastCheck = new Date();
        health.averageLatency = (health.averageLatency + latency) / 2;
      }
    }
  }

  /**
   * Handle errors and update statistics
   */
  private handleError(error: any, latency: number): void {
    this.stats.errors++;
    this.stats.lastUsed = new Date();
    
    if (error instanceof AIProviderError) {
      this.logger.error(`AI manager error (${error.type}): ${error.message}`);
      
      // Update provider health
      const providerName = error.message.includes('OpenAI') ? 'openai' :
                          error.message.includes('Mistral') ? 'mistral' :
                          error.message.includes('AthenaMist') ? 'athenamist' : null;
      
      if (providerName) {
        const health = this.healthChecks.get(providerName);
        if (health) {
          health.errorCount++;
          if (health.errorCount > 5) {
            health.available = false;
            this.logger.warn(`Provider ${providerName} marked as unavailable due to errors`);
          }
        }
      }
    } else {
      this.logger.error('Unknown AI manager error:', error);
    }
  }

  /**
   * Get AI manager statistics
   */
  getStats(): AIManagerStats {
    return { ...this.stats };
  }

  /**
   * Get provider health information
   */
  getProviderHealth(): ProviderHealth[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys()).filter(name => {
      const provider = this.providers.get(name)!;
      const health = this.healthChecks.get(name)!;
      return provider.isAvailable() && health.available;
    });
  }

  /**
   * Get provider by name
   */
  getProvider(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Reset all statistics
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0,
      errors: 0,
      providerStats: {},
      lastUsed: null
    };

    for (const provider of this.providers.values()) {
      provider.resetStats();
    }

    this.logger.info('AI manager statistics reset');
  }

  /**
   * Perform health check on all providers
   */
  async performHealthCheck(): Promise<void> {
    this.logger.info('Performing health check on all providers...');
    
    for (const [name, provider] of this.providers) {
      const health = this.healthChecks.get(name)!;
      
      try {
        // Test with a simple prompt
        const testParams: AIRequestParams = {
          prompt: 'Hello',
          maxTokens: 10
        };
        
        const startTime = Date.now();
        await provider.generateResponse(testParams);
        const latency = Date.now() - startTime;
        
        health.available = true;
        health.lastCheck = new Date();
        health.averageLatency = (health.averageLatency + latency) / 2;
        health.errorCount = Math.max(0, health.errorCount - 1); // Reduce error count on success
        
        this.logger.info(`Provider ${name} health check passed (latency: ${latency}ms)`);
      } catch (error) {
        health.available = false;
        health.lastCheck = new Date();
        health.errorCount++;
        
        this.logger.warn(`Provider ${name} health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Get cost estimate for request
   */
  getCostEstimate(params: AIRequestParams): number {
    const provider = this.selectProvider(params);
    return provider ? provider.getCostEstimate(params) : 0;
  }

  /**
   * Get all available models
   */
  getAllModels(): Record<string, string[]> {
    const models: Record<string, string[]> = {};
    
    for (const [name, provider] of this.providers) {
      models[name] = provider.getModels().map(model => model.name);
    }
    
    return models;
  }
} 