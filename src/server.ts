/**
 * 🎮 Serafina Discord Bot - Main Server
 * 
 * Entry point for the Express web server that handles:
 * - OAuth authentication routes
 * - Health checks
 * - Static file serving (if needed)
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2025-08-12
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import authRoutes from './routes/auth-routes';
import { env } from './config/env';

// Create Express application
const app = express();

// Middleware
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost:3000
    if (env.app.env !== 'production') {
      if (origin.startsWith('http://localhost:3000')) {
        return callback(null, true);
      }
    }
    
    // In production, check against allowed origins
    if (env.web.cors === '*') {
      return callback(null, true);
    }
    
    // Check if origin is in the allowed list
    const allowedOrigins = typeof env.web.cors === 'string' 
      ? env.web.cors.split(',').map(o => o.trim())
      : env.web.cors;
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development',
    node: process.version
  });
});

// Mount authentication routes
app.use(authRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'not_found',
    message: 'The requested resource was not found'
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  res.status(500).json({
    error: 'internal_server_error',
    message: 'An unexpected error occurred',
    // Only include error details in development
    ...(process.env.NODE_ENV !== 'production' ? { details: err.message } : {})
  });
});

// Start the server
const PORT = env.web.port;
const HOST = env.web.host;
const server = app.listen(PORT, HOST, () => {
  const baseUrl = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
  logger.info(`Server is running on ${baseUrl}`, {
    env: env.app.env,
    node: process.version,
    baseUrl,
    oauthCallbackUrl: `${baseUrl}/oauth/callback`
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  // In production, you might want to gracefully shut down
  if (process.env.NODE_ENV === 'production') {
    server.close(() => {
      process.exit(1);
    });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error });
  // In production, you might want to gracefully shut down
  if (process.env.NODE_ENV === 'production') {
    server.close(() => {
      process.exit(1);
    });
  }
});

// Handle process termination
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time. Forcing shutdown...');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
