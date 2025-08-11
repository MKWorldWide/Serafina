import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../../core/pino-logger';

const logger = createLogger('web:health-check');

/**
 * Health check middleware
 * Returns 200 OK if the server is running
 */
export function healthCheck(req: Request, res: Response, next: NextFunction): void {
  // Skip logging for health checks to reduce noise
  if (req.path === '/healthz' || req.path === '/health') {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    return;
  }
  
  next();
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  // Skip logging for health checks
  if (req.path === '/healthz' || req.path === '/health') {
    next();
    return;
  }
  
  // Log the request
  logger.debug(`[${req.method}] ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    params: Object.keys(req.params).length > 0 ? req.params : undefined,
    // Don't log body as it may contain sensitive information
  });
  
  // Log the response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };
    
    if (res.statusCode >= 500) {
      logger.error('Server error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error', logData);
    } else {
      logger.debug('Request completed', logData);
    }
  });
  
  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  logger.error('Request error:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode,
  });
  
  res.status(statusCode).json({
    status: 'error',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    status: 'error',
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
}

/**
 * Security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
    );
  }
  
  next();
}
