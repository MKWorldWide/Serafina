import { BaseTask } from '../core/tasks/base-task';
import { config } from '../core/config';
import os from 'os';
import { createLogger } from '../core/pino-logger';

const logger = createLogger('task:health-check');

interface HealthMetrics {
  /** Timestamp of the health check */
  timestamp: number;
  
  /** Memory usage in MB */
  memory: {
    rss: number;      // Resident Set Size
    heapTotal: number; // V8 heap total
    heapUsed: number;  // V8 heap used
    external: number;  // External memory usage (C++ objects bound to JavaScript objects)
    arrayBuffers: number; // Memory allocated for ArrayBuffers and SharedArrayBuffers
  };
  
  /** CPU usage */
  cpu: {
    user: number;     // Time spent in user mode
    system: number;   // Time spent in system mode
  };
  
  /** Uptime in seconds */
  uptime: number;
  
  /** Process information */
  process: {
    uptime: number;   // Process uptime in seconds
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
  
  /** System information */
  system: {
    loadavg: number[]; // 1, 5, and 15 minute load averages
    freemem: number;   // Free system memory in bytes
    totalmem: number;  // Total system memory in bytes
    cpus: number;      // Number of CPU cores
  };
  
  /** Discord client status */
  discord: {
    ping: number;      // WebSocket ping to Discord
    guilds: number;    // Number of guilds
    users: number;     // Number of users (cached)
    channels: number;  // Number of channels (cached)
    uptime: number;    // Client uptime in seconds
  };
  
  /** Database status */
  database?: {
    connected: boolean;
    lastError?: string;
    stats?: Record<string, any>;
  };
  
  /** Additional custom metrics */
  custom?: Record<string, any>;
}

/**
 * Task to perform health checks and log metrics
 */
export default class HealthCheckTask extends BaseTask {
  public readonly name = 'health-check';
  
  // Run every minute
  protected readonly options = {
    schedule: '* * * * *', // Every minute
    timezone: 'UTC',
    runOnStart: true,
  };
  
  // Store previous CPU usage for calculation
  private previousCpuUsage = process.cpuUsage();
  private previousHrTime = process.hrtime();
  
  // Store health metrics history (last 60 checks = 1 hour at 1 check per minute)
  private readonly metricsHistory: HealthMetrics[] = [];
  private readonly maxHistory = 60;
  
  constructor() {
    super({
      schedule: '* * * * *', // Every minute
      timezone: 'UTC',
      runOnStart: true,
    });
  }
  
  /**
   * Perform health check
   */
  protected async run(client: any): Promise<void> {
    try {
      const metrics = await this.collectMetrics(client);
      this.storeMetrics(metrics);
      this.logMetrics(metrics);
      
      // Check for potential issues and log warnings
      this.checkForIssues(metrics);
    } catch (error) {
      logger.error('Health check failed:', error);
      throw error;
    }
  }
  
  /**
   * Collect health metrics
   */
  private async collectMetrics(client: any): Promise<HealthMetrics> {
    // Get current time
    const now = Date.now();
    
    // Calculate CPU usage
    const currentCpuUsage = process.cpuUsage();
    const currentHrTime = process.hrtime();
    
    // Calculate CPU usage percentage
    const hrDiff = process.hrtime(this.previousHrTime);
    const diffMicros = (hrDiff[0] * 1e9 + hrDiff[1]) / 1000; // Convert to microseconds
    const userCpuPercent = (currentCpuUsage.user - this.previousCpuUsage.user) / diffMicros * 100;
    const systemCpuPercent = (currentCpuUsage.system - this.previousCpuUsage.system) / diffMicros * 100;
    
    // Update previous values for next calculation
    this.previousCpuUsage = currentCpuUsage;
    this.previousHrTime = currentHrTime;
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    // Get system load averages
    const loadavg = os.loadavg();
    
    // Get Discord client stats
    const discordStats = this.getDiscordStats(client);
    
    // Create metrics object
    const metrics: HealthMetrics = {
      timestamp: now,
      memory: {
        rss: this.bytesToMB(memoryUsage.rss),
        heapTotal: this.bytesToMB(memoryUsage.heapTotal),
        heapUsed: this.bytesToMB(memoryUsage.heapUsed),
        external: this.bytesToMB(memoryUsage.external),
        arrayBuffers: this.bytesToMB(memoryUsage.arrayBuffers || 0),
      },
      cpu: {
        user: parseFloat(userCpuPercent.toFixed(2)),
        system: parseFloat(systemCpuPercent.toFixed(2)),
      },
      uptime: Math.floor(process.uptime()),
      process: {
        uptime: Math.floor(process.uptime()),
        memoryUsage,
        cpuUsage: currentCpuUsage,
      },
      system: {
        loadavg,
        freemem: os.freemem(),
        totalmem: os.totalmem(),
        cpus: os.cpus().length,
      },
      discord: {
        ping: client.ws.ping,
        guilds: client.guilds.cache.size,
        users: client.users.cache.size,
        channels: client.channels.cache.size,
        uptime: Math.floor(client.uptime / 1000),
      },
    };
    
    // Add database stats if available
    try {
      // TODO: Add database health check
      // metrics.database = await this.checkDatabaseHealth();
    } catch (error) {
      metrics.database = {
        connected: false,
        lastError: (error as Error).message,
      };
    }
    
    return metrics;
  }
  
  /**
   * Get Discord client statistics
   */
  private getDiscordStats(client: any) {
    if (!client) {
      return {
        ping: -1,
        guilds: 0,
        users: 0,
        channels: 0,
        uptime: 0,
      };
    }
    
    return {
      ping: client.ws.ping,
      guilds: client.guilds.cache.size,
      users: client.users.cache.size,
      channels: client.channels.cache.size,
      uptime: Math.floor(client.uptime / 1000),
    };
  }
  
  /**
   * Store metrics in history
   */
  private storeMetrics(metrics: HealthMetrics): void {
    // Add to history
    this.metricsHistory.unshift(metrics);
    
    // Trim history if needed
    if (this.metricsHistory.length > this.maxHistory) {
      this.metricsHistory.pop();
    }
  }
  
  /**
   * Log metrics
   */
  private logMetrics(metrics: HealthMetrics): void {
    const { memory, cpu, discord, uptime } = metrics;
    
    logger.info('Health check:', {
      uptime: this.formatUptime(uptime),
      memory: {
        rss: `${memory.rss} MB`,
        heapUsed: `${memory.heapUsed} MB`,
        heapTotal: `${memory.heapTotal} MB`,
      },
      cpu: {
        user: `${cpu.user}%`,
        system: `${cpu.system}%`,
      },
      discord: {
        ping: `${discord.ping}ms`,
        guilds: discord.guilds,
        users: discord.users,
        channels: discord.channels,
      },
      load: os.loadavg().map(load => load.toFixed(2)).join(', '),
    });
  }
  
  /**
   * Check for potential issues
   */
  private checkForIssues(metrics: HealthMetrics): void {
    const { memory, cpu, discord } = metrics;
    
    // Check memory usage
    const memoryUsage = (memory.heapUsed / memory.heapTotal) * 100;
    if (memoryUsage > 80) {
      logger.warn(`High memory usage: ${memoryUsage.toFixed(2)}%`);
    }
    
    // Check CPU usage
    const totalCpu = cpu.user + cpu.system;
    if (totalCpu > 80) {
      logger.warn(`High CPU usage: ${totalCpu.toFixed(2)}%`);
    }
    
    // Check Discord ping
    if (discord.ping > 300) {
      logger.warn(`High Discord ping: ${discord.ping}ms`);
    }
    
    // Check event loop lag
    const start = process.hrtime();
    setTimeout(() => {
      const diff = process.hrtime(start);
      const lagMs = diff[0] * 1e3 + diff[1] / 1e6;
      
      if (lagMs > 100) {
        logger.warn(`Event loop lag detected: ${lagMs.toFixed(2)}ms`);
      }
    }, 0).unref();
  }
  
  /**
   * Get health metrics history
   */
  public getHistory(limit = 10): HealthMetrics[] {
    return this.metricsHistory.slice(0, limit);
  }
  
  /**
   * Get the latest health metrics
   */
  public getLatestMetrics(): HealthMetrics | null {
    return this.metricsHistory[0] || null;
  }
  
  /**
   * Convert bytes to megabytes
   */
  private bytesToMB(bytes: number): number {
    return parseFloat((bytes / (1024 * 1024)).toFixed(2));
  }
  
  /**
   * Format uptime in a human-readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
  }
}
