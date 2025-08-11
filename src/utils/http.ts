import { URL } from 'url';
import { createLogger } from './logger';
import { circuitBreaker, withCircuitBreaker } from './circuit';

const logger = createLogger({ service: 'http' });

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

interface FetchResult<T = any> {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  data: T;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Extracts the domain from a URL to use as a circuit breaker key
 */
function getDomainKey(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Fetches data from a URL with timeout, retry, and circuit breaker
 * @param url The URL to fetch from
 * @param options Fetch options including timeout and retries
 * @returns Object containing response status and parsed data
 */
export async function fetchWithRetry<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const {
    timeout = 4000,
    retries = 3,
    headers = {},
    ...fetchOptions
  } = options;

  const domainKey = getDomainKey(url);
  const requestId = Math.random().toString(36).substring(2, 9);
  const requestLogger = logger.child({ requestId, url, domainKey });

  // Default headers
  const defaultHeaders = {
    'accept': 'application/json',
    'user-agent': 'SerafinaBot/1.0',
    ...headers,
  };

  // Prepare fetch options
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const fetchOptionsWithSignal = {
    ...fetchOptions,
    signal: controller.signal,
    headers: defaultHeaders,
  };

  try {
    requestLogger.debug('Initiating request', { 
      method: fetchOptions.method || 'GET',
      timeout,
      retries,
    });

    // Use circuit breaker for the request
    const response = await withCircuitBreaker(
      domainKey,
      async () => {
        const startTime = Date.now();
        const response = await fetch(url, fetchOptionsWithSignal);
        const duration = Date.now() - startTime;
        
        requestLogger.debug('Received response', {
          status: response.status,
          statusText: response.statusText,
          duration,
        });
        
        return response;
      },
      { maxRetries: retries },
      { requestId }
    );

    // Process response
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data: any;
    const text = await response.text();
    
    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      // If JSON parsing fails, return raw text
      data = { _raw: text };
    }

    const result: FetchResult<T> = {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data,
    };

    // Log non-OK responses
    if (!response.ok) {
      requestLogger.warn('Request completed with non-OK status', {
        status: response.status,
        statusText: response.statusText,
        data: result.data,
      });
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'RequestError';
    
    requestLogger.error('Request failed', {
      error: errorMessage,
      name: errorName,
      stack: error instanceof Error ? error.stack : undefined,
      attempt: options.retries !== undefined ? retries - options.retries + 1 : 1,
    });

    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      headers: new Headers(),
      data: {} as T,
      error: {
        name: errorName,
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches JSON from a URL with timeout and retry logic
 * @param url The URL to fetch from
 * @param options Fetch options including timeout and retries
 * @returns Parsed JSON data
 */
export async function getJson<T = any>(
  url: string, 
  options: Omit<FetchOptions, 'headers'> & { 
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
  } = {}
): Promise<FetchResult<T>> {
  const response = await fetchWithRetry<T>(url, {
    ...options,
    headers: {
      'accept': 'application/json',
      ...options.headers,
    },
  });

  return response;
}

/**
 * Makes a GET request to a JSON API endpoint
 */
export async function get<T = any>(
  url: string,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<FetchResult<T>> {
  return fetchWithRetry<T>(url, { ...options, method: 'GET' });
}

/**
 * Makes a POST request to a JSON API endpoint
 */
export async function post<T = any>(
  url: string,
  data: any,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<FetchResult<T>> {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Makes a PUT request to a JSON API endpoint
 */
export async function put<T = any>(
  url: string,
  data: any,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<FetchResult<T>> {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'PUT',
    body,
    headers: {
      'content-type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Makes a DELETE request to a JSON API endpoint
 */
export async function del<T = any>(
  url: string,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<FetchResult<T>> {
  return fetchWithRetry<T>(url, { ...options, method: 'DELETE' });
}

export default {
  get,
  post,
  put,
  delete: del,
  getJson,
  fetchWithRetry,
  circuitBreaker,
};
