import { createLogger } from '../pino-logger';
import { config } from '../config';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const logger = createLogger('store:base');

/**
 * Base class for all database stores
 * Handles database connection, migrations, and common operations
 */
export abstract class BaseStore {
  protected readonly db: Database.Database;
  protected readonly logger = logger;
  protected abstract readonly tableName: string;
  protected abstract readonly migrations: string[];
  protected abstract readonly migrationTableName: string;

  constructor() {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      this.logger.info(`Created data directory: ${dataDir}`);
    }

    // Initialize database
    const dbPath = path.join(dataDir, `${this.constructor.name.toLowerCase()}.db`);
    this.db = new Database(dbPath, { 
      verbose: config.database.verbose ? this.logger.debug.bind(this.logger) : undefined,
    });
    
    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Set busy timeout to handle locked database scenarios
    this.db.pragma('busy_timeout = 5000');
    
    this.logger.info(`Initialized database: ${dbPath}`);
    
    // Run migrations
    this.runMigrations();
  }

  /**
   * Run database migrations
   */
  private runMigrations() {
    try {
      // Create migrations table if it doesn't exist
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS ${this.migrationTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Get executed migrations
      const executedMigrations = new Set(
        this.db.prepare(`SELECT name FROM ${this.migrationTableName}`)
          .all()
          .map((m: any) => m.name)
      );

      // Execute pending migrations
      let migrationsExecuted = 0;
      this.db.transaction(() => {
        for (const migration of this.migrations) {
          const migrationName = this.getMigrationName(migration);
          
          if (!executedMigrations.has(migrationName)) {
            this.logger.debug(`Running migration: ${migrationName}`);
            
            // Execute the migration
            this.db.exec(migration);
            
            // Record the migration
            this.db.prepare(
              `INSERT INTO ${this.migrationTableName} (name) VALUES (?)`
            ).run(migrationName);
            
            migrationsExecuted++;
          }
        }
      })();

      if (migrationsExecuted > 0) {
        this.logger.info(`Executed ${migrationsExecuted} pending migration(s)`);
      }
    } catch (error) {
      this.logger.error('Failed to run migrations:', error);
      throw error;
    }
  }

  /**
   * Get a migration name from SQL
   */
  private getMigrationName(sql: string): string {
    // Use the first few words of the SQL as the migration name
    const firstLine = sql.split('\n')[0].trim();
    return firstLine.substring(0, 100); // Limit length
  }

  /**
   * Close the database connection
   */
  public close(): void {
    this.db.close();
    this.logger.info('Database connection closed');
  }

  /**
   * Execute a query with parameters and return all rows
   */
  protected all<T = any>(sql: string, params: any[] = []): T[] {
    try {
      return this.db.prepare(sql).all(...params) as T[];
    } catch (error) {
      this.logger.error(`Query failed: ${sql}`, { params, error });
      throw error;
    }
  }

  /**
   * Execute a query and return the first row
   */
  protected get<T = any>(sql: string, params: any[] = []): T | undefined {
    try {
      return this.db.prepare(sql).get(...params) as T | undefined;
    } catch (error) {
      this.logger.error(`Query failed: ${sql}`, { params, error });
      throw error;
    }
  }

  /**
   * Execute a query and return the changes
   */
  protected run(sql: string, params: any[] = []): Database.RunResult {
    try {
      return this.db.prepare(sql).run(...params);
    } catch (error) {
      this.logger.error(`Query failed: ${sql}`, { params, error });
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  protected transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }
}
