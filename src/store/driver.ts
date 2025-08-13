import { config } from '../config';

export interface DB {
  /**
   * Execute a query that doesn't return any rows (e.g., INSERT, UPDATE, DELETE, CREATE TABLE)
   * @param sql The SQL query to execute
   * @param params Optional parameters for the query
   */
  run(sql: string, params?: unknown[]): Promise<void>;

  /**
   * Execute a query that returns a single row
   * @param sql The SQL query to execute
   * @param params Optional parameters for the query
   * @returns The first row of the result, or undefined if no rows were returned
   */
  get<T = any>(sql: string, params?: unknown[]): Promise<T | undefined>;

  /**
   * Execute a query that returns multiple rows
   * @param sql The SQL query to execute
   * @param params Optional parameters for the query
   * @returns An array of rows returned by the query
   */
  all<T = any>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Execute a transaction
   * @param fn A function that performs database operations within the transaction
   * @returns The result of the transaction function
   */
  transaction<T>(fn: () => Promise<T>): Promise<T>;

  /**
   * Close the database connection
   */
  close(): Promise<void>;
}

/**
 * Create a database connection based on the configured driver
 * @returns A database connection
 */
export async function createDB(): Promise<DB> {
  if (config.DB_DRIVER === 'wasm') {
    const { SQLiteDB } = await import('./driver-wasm');
    return new SQLiteDB();
  } else {
    const { PostgresDB } = await import('./driver-postgres');
    return new PostgresDB();
  }
}
