import { createLogger } from './logger';

/**
 * Circuit breaker state type
 */
export type CircuitState = 'closed' | 'open' | 'half-open';

/**
 * Circuit breaker configuration options
 */
export interface CircuitBreakerOptions {
  // Time in ms before attempting to close the circuit (default: 30000ms / 30s)
  resetTimeout: number;
  // Number of failures before opening the circuit (default: 5)
  failureThreshold: number;
  // Time in ms to wait before retrying after a failure (default: 1000ms / 1s)
  retryTimeout: number;
  // Maximum number of retry attempts (default: 3)
  maxRetries: number;
  // Base delay for exponential backoff in ms (default: 100ms)
  backoffBase: number;
  // Maximum delay for exponential backoff in ms (default: 5000ms / 5s)
  backoffMax: number;
}

/**
 * Default circuit breaker options
 */
const defaultOptions: CircuitBreakerOptions = {
  resetTimeout: 30000, // 30 seconds
  failureThreshold: 5,
  retryTimeout: 1000, // 1 second
  maxRetries: 3,
  backoffBase: 100, // 100ms
  backoffMax: 5000, // 5 seconds
};

/**
 * Circuit breaker state for a given key
 */
export interface CircuitStateData {
  state: CircuitState;
  failureCount: number;
  lastFailure: number | null;
  retryCount: number;
}

/**
 * Circuit breaker instance
 */
export class CircuitBreaker {
  public states: Map<string, CircuitStateData>;
  public options: CircuitBreakerOptions;
  public logger: ReturnType<typeof createLogger>;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.states = new Map();
    this.options = { ...defaultOptions, ...options };
    this.logger = createLogger({ service: 'circuit-breaker' });
  }

  /**
   * Get or create the state for a given key
   */
  public getState(key: string): CircuitStateData {
    if (!this.states.has(key)) {
      this.states.set(key, {
        state: 'closed',
        failureCount: 0,
        lastFailure: null,
        retryCount: 0,
      });
    }
    return this.states.get(key)!;
  }

  /**
   * Check if a request should be allowed
   */
  public isAvailable(state: CircuitStateData, key: string): boolean {
    const now = Date.now();
    
    // If circuit is closed, always allow
    if (state.state === 'closed') return true;
    
    // If circuit is half-open, allow with a retry
    if (state.state === 'half-open') {
      return state.retryCount < this.options.maxRetries && 
             (!state.lastFailure || now - state.lastFailure >= this.calculateBackoff(state.retryCount));
    }
    
    // If circuit is open, check if we should try to close it
    if (state.state === 'open') {
      if (state.lastFailure && now - state.lastFailure >= this.options.resetTimeout) {
        // Transition to half-open state
        state.state = 'half-open';
        state.retryCount = 0;
        this.logger.info(`Circuit half-open for ${key}`, { key });
        return true;
      }
      return false;
    }
    
    return false;
  }

  /**
   * Calculate exponential backoff delay
   */
  public calculateBackoff(attempt: number): number {
    return Math.min(
      this.options.backoffMax,
      this.options.backoffBase * Math.pow(2, attempt)
    );
  }

  /**
   * Record a success
   */
  public onSuccess(key: string): void {
    const state = this.getState(key);
    
    // Reset failure count and transition to closed state if needed
    if (state.state !== 'closed') {
      this.logger.info(`Circuit closed for ${key}`, { key });
    }
    
    state.state = 'closed';
    state.failureCount = 0;
    state.lastFailure = null;
    state.retryCount = 0;
  }

  /**
   * Record a failure
   */
  public onFailure(key: string, error: Error): void {
    const state = this.getState(key);
    const now = Date.now();
    
    state.failureCount++;
    state.lastFailure = now;
    
    if (state.state === 'half-open') {
      state.retryCount++;
      this.logger.warn(`Retry ${state.retryCount} failed for ${key}`, { 
        key, 
        error: error.message,
        retryCount: state.retryCount,
        maxRetries: this.options.maxRetries 
      });
      
      if (state.retryCount >= this.options.maxRetries) {
        state.state = 'open';
        this.logger.error(`Circuit opened for ${key} after ${state.retryCount} retries`, { 
          key, 
          failureCount: state.failureCount,
          lastFailure: state.lastFailure 
        });
      }
    } 
    // If we've hit the failure threshold, open the circuit
    else if (state.failureCount >= this.options.failureThreshold) {
      state.state = 'open';
      this.logger.error(`Circuit opened for ${key} after ${state.failureCount} failures`, { 
        key, 
        failureCount: state.failureCount,
        lastFailure: state.lastFailure 
      });
    }
  }

  /**
   * Execute a function with circuit breaker and retry logic
   */
  public async execute<T>(
    key: string,
    fn: () => Promise<T>,
    context: Record<string, unknown> = {}
  ): Promise<T> {
    const state = this.getState(key);
    
    // Check if the circuit is available
    if (!this.isAvailable(state, key)) {
      this.logger.warn(`Circuit breaker is open for ${key}`, { 
        key, 
        state: state.state,
        lastFailure: state.lastFailure,
        failureCount: state.failureCount 
      });
      throw new Error(`Service ${key} is temporarily unavailable (circuit ${state.state})`);
    }

    // If we're in half-open state, increment the retry counter
    if (state.state === 'half-open') {
      state.retryCount++;
      this.logger.info(`Attempting retry ${state.retryCount} for ${key}`, { 
        key, 
        retryCount: state.retryCount,
        maxRetries: this.options.maxRetries,
        ...context 
      });
    }

    try {
      const result = await fn();
      this.onSuccess(key);
      return result;
    } catch (error) {
      this.onFailure(key, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get the current state of a circuit
   */
  public getCircuitState(key: string): CircuitStateData | undefined {
    return this.states.get(key);
  }

  /**
   * Reset the circuit for a given key
   */
  public reset(key: string): void {
    this.states.delete(key);
    this.logger.info(`Circuit reset for ${key}`, { key });
  }

  /**
   * Reset all circuits
   */
  public resetAll(): void {
    const keys = Array.from(this.states.keys());
    this.states.clear();
    this.logger.info(`Reset all circuits`, { count: keys.length });
  }
}

// Export a singleton instance
export const circuitBreaker = new CircuitBreaker();

/**
 * Wrapper function for circuit breaker with retry logic
 */
export async function withCircuitBreaker<T>(
  key: string,
  fn: () => Promise<T>,
  options: Partial<CircuitBreakerOptions> = {},
  context: Record<string, unknown> = {}
): Promise<T> {
  const breaker = options ? new CircuitBreaker(options) : circuitBreaker;
  return breaker.execute(key, fn, context);
}
