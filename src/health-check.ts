/**
 * 🏥 Serafina Health Check Endpoint
 * 
 * This module provides a health check endpoint for AWS load balancer monitoring
 * and bot status reporting. It runs on port 3000 and provides detailed health
 * information for monitoring and alerting.
 * 
 * Features:
 * - HTTP health check endpoint (/health)
 * - Detailed bot status reporting
 * - Discord connection status
 * - AI provider health checks
 * - Memory and performance metrics
 * - AWS load balancer compatibility
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2024-12-19
 */

import express from 'express';
import { GameDinBot } from './bot-new';
import { Logger, LogLevel } from './core/Logger';

/**
 * Health check server configuration
 */
interface HealthCheckConfig {
  port: number;
  host: string;
  enableDetailedMetrics: boolean;
  healthCheckInterval: number;
}

/**
 * Health status response
 */
interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  discord: {
    connected: boolean;
    guildCount: number;
    latency: number;
  };
  ai: {
    providers: {
      openai: boolean;
      mistral: boolean;
      athenaMist: boolean;
    };
    totalRequests: number;
    errorRate: number;
  };
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      load: number;
    };
  };
  commands: {
    total: number;
    active: number;
    errors: number;
  };
  events: {
    total: number;
    active: number;
    errors: number;
  };
}

/**
 * Health check server class
 */
class HealthCheckServer {
  private app: express.Application;
  private server: any;
  private bot: GameDinBot;
  private logger: Logger;
  private config: HealthCheckConfig;
  private startTime: Date;

  constructor(bot: GameDinBot, config: HealthCheckConfig) {
    this.bot = bot;
    this.config = config;
    this.logger = new Logger('HealthCheck', LogLevel.INFO);
    this.startTime = new Date();
    
    this.app = express();
    this.setupRoutes();
  }

  /**
   * Setup Express routes
   */
  private setupRoutes(): void {
    // Basic health check endpoint
    this.app.get('/health', async (req: express.Request, res: express.Response) => {
      try {
        const healthStatus = await this.getHealthStatus();
        const statusCode = healthStatus.status === 'healthy' ? 200 : 
                          healthStatus.status === 'degraded' ? 200 : 503;
        
        res.status(statusCode).json(healthStatus);
      } catch (error) {
        this.logger.error('Health check error:', error);
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Health check failed'
        });
      }
    });

    // Detailed metrics endpoint (if enabled)
    if (this.config.enableDetailedMetrics) {
      this.app.get('/metrics', async (req: express.Request, res: express.Response) => {
        try {
          const detailedMetrics = await this.getDetailedMetrics();
          res.json(detailedMetrics);
        } catch (error) {
          this.logger.error('Metrics error:', error);
          res.status(500).json({ error: 'Metrics unavailable' });
        }
      });
    }

    // Bot status endpoint
    this.app.get('/status', async (req: express.Request, res: express.Response) => {
      try {
        const botStats = this.bot.getStats();
        res.json({
          status: 'online',
          timestamp: new Date().toISOString(),
          stats: botStats
        });
      } catch (error) {
        this.logger.error('Status check error:', error);
        res.status(500).json({ error: 'Status unavailable' });
      }
    });

    // Root endpoint
    this.app.get('/', (req: express.Request, res: express.Response) => {
      res.json({
        name: 'Serafina Discord Bot',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
          status: '/status',
          metrics: this.config.enableDetailedMetrics ? '/metrics' : 'disabled'
        }
      });
    });

    // Error handling middleware
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error('Express error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  /**
   * Get comprehensive health status
   */
  private async getHealthStatus(): Promise<HealthStatus> {
    const botStats = this.bot.getStats();
    const uptime = Date.now() - this.startTime.getTime();
    
    // Get Discord connection status
    const discordStatus = {
      connected: botStats.isReady,
      guildCount: botStats.guildCount,
      latency: 0 // TODO: Implement actual latency measurement
    };

    // Get AI provider status
    const aiManager = this.bot.getAIManager();
    const providerHealth = aiManager.getProviderHealth();
    const aiStatus = {
      providers: {
        openai: providerHealth.find(p => p.provider === 'openai')?.available || false,
        mistral: providerHealth.find(p => p.provider === 'mistral')?.available || false,
        athenaMist: providerHealth.find(p => p.provider === 'athenamist')?.available || false
      },
      totalRequests: aiManager.getStats().totalRequests,
      errorRate: aiManager.getStats().errors / Math.max(aiManager.getStats().totalRequests, 1)
    };

    // Get system metrics
    const systemMetrics = this.getSystemMetrics();

    // Determine overall health status
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (!discordStatus.connected) {
      status = 'unhealthy';
    } else if (aiStatus.errorRate > 0.1 || systemMetrics.memory.percentage > 80) {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      discord: discordStatus,
      ai: aiStatus,
      system: systemMetrics,
      commands: {
        total: botStats.commandStats?.total || 0,
        active: botStats.commandStats?.active || 0,
        errors: botStats.commandStats?.errors || 0
      },
      events: {
        total: botStats.eventStats?.total || 0,
        active: botStats.eventStats?.active || 0,
        errors: botStats.eventStats?.errors || 0
      }
    };
  }

  /**
   * Get detailed system metrics
   */
  private getDetailedMetrics(): any {
    const usage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        external: usage.external,
        arrayBuffers: usage.arrayBuffers
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        awsRegion: process.env.AWS_REGION,
        awsAccountId: process.env.AWS_ACCOUNT_ID
      }
    };
  }

  /**
   * Get system metrics for health check
   */
  private getSystemMetrics(): any {
    const usage = process.memoryUsage();
    const totalMemory = usage.heapTotal;
    const usedMemory = usage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    return {
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: Math.round(memoryPercentage * 100) / 100
      },
      cpu: {
        load: 0 // TODO: Implement actual CPU load measurement
      }
    };
  }

  /**
   * Start the health check server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.port, this.config.host, () => {
        this.logger.info(`Health check server started on ${this.config.host}:${this.config.port}`);
        resolve();
      });

      this.server.on('error', (error: any) => {
        this.logger.error('Health check server error:', error);
        reject(error);
      });
    });
  }

  /**
   * Stop the health check server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.logger.info('Health check server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get server info
   */
  getServerInfo(): { port: number; host: string } {
    return {
      port: this.config.port,
      host: this.config.host
    };
  }
}

export { HealthCheckServer, HealthCheckConfig, HealthStatus }; 