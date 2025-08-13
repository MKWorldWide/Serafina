#!/usr/bin/env node
/**
 * Database Migration Script
 * 
 * This script ensures all required database tables exist with the correct schema.
 * It's safe to run this script multiple times as it uses IF NOT EXISTS.
 */

import { getDB } from '../src/store/db';
import { config } from '../src/config';
import { join } from 'path';
import { mkdir } from 'fs/promises';

async function ensureDataDirectory() {
  if (config.DB_DRIVER === 'wasm') {
    const dataDir = join(process.cwd(), 'data');
    try {
      await mkdir(dataDir, { recursive: true });
      console.log(`📁 Created data directory: ${dataDir}`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error('Failed to create data directory:', error);
        process.exit(1);
      }
    }
  }
}

async function createTables() {
  const db = await getDB();
  
  try {
    // Start a transaction
    await db.transaction(async () => {
      // Create guild_config table
      await db.run(`
        CREATE TABLE IF NOT EXISTS guild_config (
          guild_id TEXT PRIMARY KEY,
          data ${config.DB_DRIVER === 'postgres' ? 'JSONB' : 'TEXT'} NOT NULL
        )
      `);
      
      // Create reminders table
      const idType = config.DB_DRIVER === 'postgres' ? 'SERIAL' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
      await db.run(`
        CREATE TABLE IF NOT EXISTS reminders (
          id ${idType},
          guild_id TEXT,
          user_id TEXT,
          run_at BIGINT,
          text TEXT${config.DB_DRIVER === 'postgres' ? ', PRIMARY KEY (id)' : ''}
        )
      `);
      
      // Create audit table
      await db.run(`
        CREATE TABLE IF NOT EXISTS audit (
          ts BIGINT,
          user_id TEXT,
          guild_id TEXT,
          action TEXT,
          payload TEXT
        )
      `);
      
      // For PostgreSQL, add any necessary indexes
      if (config.DB_DRIVER === 'postgres') {
        await db.run('CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit(ts)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit(user_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_audit_guild_id ON audit(guild_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_reminders_run_at ON reminders(run_at)');
      }
    });
    
    console.log('✅ Database tables created/verified successfully');
  } catch (error) {
    console.error('❌ Failed to create database tables:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

async function main() {
  console.log('🚀 Running database migrations...');
  console.log(`📊 Database driver: ${config.DB_DRIVER}`);
  
  try {
    await ensureDataDirectory();
    await createTables();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
