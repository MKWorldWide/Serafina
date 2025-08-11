import express, { Express, Request, Response } from 'express';
import http from 'http';
import { createLogger } from '../core/pino-logger';
import { config } from '../core/config';
import { healthCheck, requestLogger, errorHandler, notFoundHandler, securityHeaders } from './middleware/health-check';
import { TaskManager } from '../core/tasks/task-manager';

const logger = createLogger('web:server');

/**
 * Web server for health checks and metrics
 */
export class WebServer {
  private app: Express;
  private server: http.Server | null = null;
  private taskManager: TaskManager | null = null;
  private readonly port: number;
  private isShuttingDown = false;

  constructor(port: number = config.web.port) {
    this.port = port;
    this.app = express();
    
    // Apply middleware
    this.setupMiddleware();
    
    // Setup routes
    this.setupRoutes();
    
    // Error handling must be after all other middleware and routes
    this.setupErrorHandling();
  }
  
  /**
   * Set up middleware
   */
  private setupMiddleware(): void {
    // Security headers
    this.app.use(securityHeaders);
    
    // Parse JSON bodies
    this.app.use(express.json());
    
    // Parse URL-encoded bodies
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use(requestLogger);
    
    // Health check endpoint
    this.app.use(healthCheck);
  }
  
  /**
   * Set up routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/healthz', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        env: process.env.NODE_ENV || 'development',
      });
    });
    
    // Metrics endpoint (for Prometheus or other monitoring)
    this.app.get('/metrics', async (req: Request, res: Response) => {
      try {
        // TODO: Add more detailed metrics
        const metrics = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          // Add more metrics as needed
        };
        
        res.status(200).json(metrics);
      } catch (error) {
        logger.error('Failed to collect metrics:', error);
        res.status(500).json({
          status: 'error',
          error: 'Failed to collect metrics',
        });
      }
    });
    
    // 404 handler
    this.app.use(notFoundHandler);
  }
  
  /**
   * Set up error handling
   */
  private setupErrorHandling(): void {
    // Error handling middleware
    this.app.use(errorHandler);
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Consider restarting the server or performing cleanup
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      // Consider restarting the server or performing cleanup
      process.exit(1);
    });
  }
  
  /**
   * Start the web server
   */
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        logger.warn('Server is already running');
        return resolve();
      }
      
      this.server = this.app.listen(this.port, () => {
        logger.info(`Web server listening on port ${this.port}`);
        resolve();
      });
      
      this.server.on('error', (error) => {
        logger.error('Failed to start web server:', error);
        reject(error);
      });
      
      // Handle graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));
    });
  }
  
  /**
   * Stop the web server
   */
  public async stop(): Promise<void> {
    if (!this.server) {
      logger.warn('Server is not running');
      return;
    }
    
    this.isShuttingDown = true;
    
    return new Promise((resolve, reject) => {
      this.server!.close((error) => {
        if (error) {
          logger.error('Error while stopping the server:', error);
          reject(error);
        } else {
          logger.info('Web server stopped');
          this.server = null;
          resolve();
        }
      });
    });
  }
  
  /**
   * Gracefully shut down the server
   */
  private async gracefulShutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }
    
    this.isShuttingDown = true;
    logger.info('Shutting down gracefully...');
    
    try {
      // Stop accepting new connections
      if (this.server) {
        await this.stop();
      }
      
      // Stop any running tasks
      if (this.taskManager) {
        await this.taskManager.destroy();
      }
      
      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
  
  /**
   * Get the Express app instance
   */
  public getApp(): Express {
    return this.app;
  }
  
  /**
   * Get the HTTP server instance
   */
  public getServer(): http.Server | null {
    return this.server;
  }
  
  /**
   * Set the task manager instance for graceful shutdown
   */
  public setTaskManager(taskManager: TaskManager): void {
    this.taskManager = taskManager;
  }
}

/**
 * Create and start the web server
 */
export async function createWebServer(port?: number): Promise<WebServer> {
  const server = new WebServer(port);
  await server.start();
  return server;
}
