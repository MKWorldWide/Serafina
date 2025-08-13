import { Router } from 'express';
import { config } from '../config';
import { db } from '../store/db';

const router = Router();

/**
 * Health check endpoint
 * GET /healthz
 * 
 * Returns a 200 OK with status information about the service
 */
router.get('/healthz', async (req, res) => {
  try {
    // Basic health check - can we query the database?
    await db.get('SELECT 1 as ok');
    
    // Get some basic stats if available
    let guildCount = 0;
    let userCount = 0;
    
    try {
      // Try to get guild count (this might not work if tables don't exist yet)
      const guildResult = await db.get<{count: number}>('SELECT COUNT(*) as count FROM guild_config');
      guildCount = guildResult?.count || 0;
      
      // Estimate user count (this is just an example, adjust based on your schema)
      const userResult = await db.get<{count: number}>(
        'SELECT COUNT(DISTINCT user_id) as count FROM audit'
      );
      userCount = userResult?.count || 0;
    } catch (error) {
      // It's okay if these queries fail - the service is still healthy
      console.debug('Optional health check queries failed (this is normal on first run):', error);
    }
    
    res.json({
      ok: true,
      status: 'healthy',
      version: config.VERSION || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        type: config.DB_DRIVER,
        connected: true,
      },
      stats: {
        guilds: guildCount,
        users: userCount,
      },
      environment: config.NODE_ENV,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      ok: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
