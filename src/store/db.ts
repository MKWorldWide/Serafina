import { createDB, DB } from './driver';
import { config } from '../config';

// Create a singleton database instance
let dbInstance: DB | null = null;

/**
 * Get the database instance, initializing it if necessary
 */
export async function getDB(): Promise<DB> {
  if (!dbInstance) {
    dbInstance = await createDB();
    
    // Set up error handling
    process.on('SIGINT', async () => {
      if (dbInstance) {
        console.log('Closing database connection...');
        await dbInstance.close();
        console.log('Database connection closed.');
        process.exit(0);
      }
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught exception:', error);
      if (dbInstance) {
        await dbInstance.close();
      }
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  }
  
  return dbInstance;
}

// Export the DB type for convenience
export type { DB };

export default getDB;
