import { Pool, PoolClient, PoolConfig } from 'pg';
import { DB } from './driver';
import { config } from '../config';

export class PostgresDB implements DB {
  private pool: Pool;
  private client: PoolClient | null = null;

  constructor() {
    if (!config.POSTGRES_URL) {
      throw new Error('POSTGRES_URL is required when using PostgreSQL driver');
    }

    const poolConfig: PoolConfig = {
      connectionString: config.POSTGRES_URL,
      // Enable SSL if sslmode=require is in the connection string
      ssl: config.POSTGRES_URL.includes('sslmode=require') ? {
        rejectUnauthorized: false
      } : undefined,
    };

    this.pool = new Pool(poolConfig);
    
    // Test the connection
    this.pool.query('SELECT NOW()')
      .then(() => {
        console.log('✅ Connected to PostgreSQL database');
        return this.#ensureTables();
      })
      .catch(error => {
        console.error('❌ Failed to connect to PostgreSQL:', error.message);
        throw error;
      });
  }

  async #ensureTables() {
    const client = await this.pool.connect();
    
    try {
      // Use CREATE TABLE IF NOT EXISTS with PostgreSQL-compatible syntax
      await client.query(`
        CREATE TABLE IF NOT EXISTS guild_config (
          guild_id TEXT PRIMARY KEY,
          data JSONB NOT NULL
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS reminders (
          id SERIAL PRIMARY KEY,
          guild_id TEXT,
          user_id TEXT,
          run_at BIGINT,
          text TEXT
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS audit (
          ts BIGINT,
          user_id TEXT,
          guild_id TEXT,
          action TEXT,
          payload TEXT
        )
      `);

      console.log('✅ Database tables verified/created');
    } catch (error) {
      console.error('Failed to ensure tables exist:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(sql, params);
    } finally {
      client.release();
    }
  }

  async get<T = any>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows[0] as T | undefined;
    } finally {
      client.release();
    }
  }

  async all<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await fn();
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export { PostgresDB };
