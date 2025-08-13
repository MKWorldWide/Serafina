import { DB } from './driver';
import { config } from '../config';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import initSqlJs, { Database as SQLiteDB, SqlJsStatic } from 'sql.js';
import { promisify } from 'util';
import { existsSync } from 'fs';

// Debounce helper
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

export class SQLiteWASM implements DB {
  private db: SQLiteDB | null = null;
  private sqlJs!: SqlJsStatic;
  private isInitialized = false;
  private saveToFile: () => Promise<void>;
  private saveQueue: (() => Promise<void>)[] = [];
  private isSaving = false;

  constructor() {
    this.saveToFile = debounce(async () => {
      if (this.saveQueue.length === 0 || !this.db) return;
      
      try {
        this.isSaving = true;
        // Process all queued saves
        while (this.saveQueue.length > 0) {
          const saveFn = this.saveQueue.shift();
          if (saveFn) await saveFn();
        }
        
        // Save to file
        if (this.db) {
          const data = this.db.export();
          const dir = dirname(fileURLToPath(import.meta.url));
          const dbPath = new URL(`../../${config.DATABASE_URL}`, import.meta.url);
          
          // Ensure directory exists
          await mkdir(dirname(dbPath.pathname), { recursive: true });
          
          // Write to file
          await writeFile(dbPath, Buffer.from(data));
        }
      } catch (error) {
        console.error('Failed to save database:', error);
      } finally {
        this.isSaving = false;
      }
    }, 250);
  }

  async #ensureInitialized() {
    if (this.isInitialized) return;

    try {
      // Load SQL.js
      this.sqlJs = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      // Try to load existing database or create a new one
      const dbPath = new URL(`../../${config.DATABASE_URL}`, import.meta.url);
      
      if (existsSync(dbPath)) {
        const buffer = await readFile(dbPath);
        this.db = new this.sqlJs.Database(new Uint8Array(buffer));
        console.log(`📁 Loaded database from ${config.DATABASE_URL}`);
      } else {
        this.db = new this.sqlJs.Database();
        console.log('🆕 Created new in-memory database');
      }

      await this.#ensureTables();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  async #ensureTables() {
    if (!this.db) throw new Error('Database not initialized');
    
    // Create tables if they don't exist
    await this.run(`
      CREATE TABLE IF NOT EXISTS guild_config (
        guild_id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      )
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT,
        user_id TEXT,
        run_at BIGINT,
        text TEXT
      )
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS audit (
        ts BIGINT,
        user_id TEXT,
        guild_id TEXT,
        action TEXT,
        payload TEXT
      )
    `);
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    await this.#ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      stmt.free();
      
      // Queue save operation
      this.queueSave();
    } catch (error) {
      console.error('SQL Error:', sql, params, error);
      throw error;
    }
  }

  async get<T = any>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    await this.#ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      
      if (stmt.step()) {
        const result = stmt.getAsObject();
        stmt.free();
        return result as T;
      }
      
      stmt.free();
      return undefined;
    } catch (error) {
      console.error('SQL Error:', sql, params, error);
      throw error;
    }
  }

  async all<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
    await this.#ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      
      const results: T[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as T);
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('SQL Error:', sql, params, error);
      throw error;
    }
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.#ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.run('BEGIN TRANSACTION');
      const result = await fn();
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      // Wait for any pending saves to complete
      while (this.isSaving || this.saveQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Close the database
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  private queueSave() {
    if (config.DB_DRIVER !== 'wasm') return;
    
    const saveFn = async () => {
      if (this.saveQueue.length > 10) {
        // If queue is getting too big, consolidate
        this.saveQueue = [this.saveQueue[this.saveQueue.length - 1]];
      }
      
      this.saveQueue.push(async () => {
        if (this.db) {
          await this.saveToFile();
        }
      });
      
      this.saveToFile();
    };
    
    saveFn().catch(console.error);
  }
}

export { SQLiteWASM as SQLiteDB };
