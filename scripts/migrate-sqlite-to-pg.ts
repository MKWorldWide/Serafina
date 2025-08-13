#!/usr/bin/env node
/**
 * SQLite to PostgreSQL Migration Script
 * 
 * This script migrates data from a SQLite database to PostgreSQL.
 * It's designed to be run once when switching from development to production.
 */

import { config } from '../src/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import { Pool } from 'pg';
import initSqlJs, { Database as SQLiteDB } from 'sql.js';

// Check if we have the required configuration
if (config.DB_DRIVER !== 'postgres' || !config.POSTGRES_URL) {
  console.error('❌ This script requires PostgreSQL configuration');
  console.error('Please set DB_DRIVER=postgres and POSTGRES_URL in your .env file');
  process.exit(1);
}

// Initialize PostgreSQL connection pool
const pgPool = new Pool({
  connectionString: config.POSTGRES_URL,
  ssl: config.POSTGRES_URL.includes('sslmode=require') 
    ? { rejectUnauthorized: false }
    : undefined,
});

// Track migration statistics
const stats = {
  guildConfigs: { total: 0, migrated: 0, errors: 0 },
  reminders: { total: 0, migrated: 0, errors: 0 },
  auditLogs: { total: 0, migrated: 0, errors: 0 },
};

/**
 * Load the SQLite database
 */
async function loadSQLiteDB(): Promise<SQLiteDB> {
  try {
    console.log('🔍 Loading SQLite database...');
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });

    const dbPath = new URL(`../../${config.DATABASE_URL}`, import.meta.url);
    const fileBuffer = await readFile(dbPath);
    
    console.log(`📂 Loaded SQLite database from ${config.DATABASE_URL}`);
    return new SQL.Database(new Uint8Array(fileBuffer));
  } catch (error) {
    console.error('❌ Failed to load SQLite database:', error);
    process.exit(1);
  }
}

/**
 * Migrate guild_config table
 */
async function migrateGuildConfigs(sqliteDb: SQLiteDB, pgClient: any) {
  try {
    console.log('\n🔄 Migrating guild_configs...');
    
    // Get all guild configs from SQLite
    const stmt = sqliteDb.prepare('SELECT * FROM guild_config');
    const rows = [];
    
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    
    stmt.free();
    stats.guildConfigs.total = rows.length;
    
    if (rows.length === 0) {
      console.log('ℹ️  No guild configs to migrate');
      return;
    }
    
    console.log(`📋 Found ${rows.length} guild configs to migrate`);
    
    // Insert into PostgreSQL
    for (const row of rows) {
      try {
        await pgClient.query(
          'INSERT INTO guild_config (guild_id, data) VALUES ($1, $2) ON CONFLICT (guild_id) DO NOTHING',
          [row.guild_id, row.data]
        );
        stats.guildConfigs.migrated++;
      } catch (error) {
        console.error(`❌ Failed to migrate guild config ${row.guild_id}:`, error);
        stats.guildConfigs.errors++;
      }
    }
    
    console.log(`✅ Migrated ${stats.guildConfigs.migrated}/${stats.guildConfigs.total} guild configs`);
  } catch (error) {
    console.error('❌ Error migrating guild configs:', error);
    stats.guildConfigs.errors = stats.guildConfigs.total - stats.guildConfigs.migrated;
  }
}

/**
 * Migrate reminders table
 */
async function migrateReminders(sqliteDb: SQLiteDB, pgClient: any) {
  try {
    console.log('\n🔄 Migrating reminders...');
    
    // Get all reminders from SQLite
    const stmt = sqliteDb.prepare('SELECT * FROM reminders');
    const rows = [];
    
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    
    stmt.free();
    stats.reminders.total = rows.length;
    
    if (rows.length === 0) {
      console.log('ℹ️  No reminders to migrate');
      return;
    }
    
    console.log(`📋 Found ${rows.length} reminders to migrate`);
    
    // Insert into PostgreSQL
    for (const row of rows) {
      try {
        await pgClient.query(
          'INSERT INTO reminders (id, guild_id, user_id, run_at, text) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
          [row.id, row.guild_id, row.user_id, row.run_at, row.text]
        );
        stats.reminders.migrated++;
      } catch (error) {
        console.error(`❌ Failed to migrate reminder ${row.id}:`, error);
        stats.reminders.errors++;
      }
    }
    
    // Reset the sequence to the max ID + 1
    if (stats.reminders.migrated > 0) {
      await pgClient.query(
        "SELECT setval('reminders_id_seq', (SELECT MAX(id) FROM reminders) + 1, false)"
      );
    }
    
    console.log(`✅ Migrated ${stats.reminders.migrated}/${stats.reminders.total} reminders`);
  } catch (error) {
    console.error('❌ Error migrating reminders:', error);
    stats.reminders.errors = stats.reminders.total - stats.reminders.migrated;
  }
}

/**
 * Migrate audit logs
 */
async function migrateAuditLogs(sqliteDb: SQLiteDB, pgClient: any) {
  try {
    console.log('\n🔄 Migrating audit logs...');
    
    // Get all audit logs from SQLite
    const stmt = sqliteDb.prepare('SELECT * FROM audit');
    const rows = [];
    
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    
    stmt.free();
    stats.auditLogs.total = rows.length;
    
    if (rows.length === 0) {
      console.log('ℹ️  No audit logs to migrate');
      return;
    }
    
    console.log(`📋 Found ${rows.length} audit logs to migrate`);
    
    // Insert into PostgreSQL in batches
    const batchSize = 1000;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      const values = batch.flatMap(row => [
        row.ts,
        row.user_id,
        row.guild_id,
        row.action,
        row.payload
      ]);
      
      const valuePlaceholders = batch.map((_, idx) => {
        const offset = idx * 5;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
      }).join(',');
      
      try {
        await pgClient.query(
          `INSERT INTO audit (ts, user_id, guild_id, action, payload) VALUES ${valuePlaceholders}`,
          values
        );
        
        const migrated = Math.min(i + batchSize, rows.length);
        process.stdout.write(`\r🔄 Migrated ${migrated}/${rows.length} audit logs...`);
      } catch (error) {
        console.error(`\n❌ Failed to migrate batch starting at index ${i}:`, error);
        // Fall back to individual inserts if batch fails
        for (let j = 0; j < batch.length; j++) {
          const row = batch[j];
          try {
            await pgClient.query(
              'INSERT INTO audit (ts, user_id, guild_id, action, payload) VALUES ($1, $2, $3, $4, $5)',
              [row.ts, row.user_id, row.guild_id, row.action, row.payload]
            );
            stats.auditLogs.migrated++;
          } catch (innerError) {
            console.error(`❌ Failed to migrate audit log at index ${i + j}:`, innerError);
            stats.auditLogs.errors++;
          }
        }
      }
    }
    
    console.log(`\n✅ Migrated ${stats.auditLogs.migrated}/${stats.auditLogs.total} audit logs`);
  } catch (error) {
    console.error('\n❌ Error migrating audit logs:', error);
    stats.auditLogs.errors = stats.auditLogs.total - stats.auditLogs.migrated;
  }
}

/**
 * Display migration summary
 */
function displaySummary() {
  console.log('\n📊 Migration Summary');
  console.log('==================');
  
  const tables = [
    { name: 'guild_configs', stats: stats.guildConfigs },
    { name: 'reminders', stats: stats.reminders },
    { name: 'audit_logs', stats: stats.auditLogs },
  ];
  
  let totalRows = 0;
  let totalMigrated = 0;
  let totalErrors = 0;
  
  for (const { name, stats: s } of tables) {
    totalRows += s.total;
    totalMigrated += s.migrated;
    totalErrors += s.errors;
    
    console.log(`\n${name}:`);
    console.log(`  Total: ${s.total}`);
    console.log(`  Migrated: ${s.migrated} (${s.errors} errors)`);
  }
  
  console.log('\n📋 Overall:');
  console.log(`  Total rows: ${totalRows}`);
  console.log(`  Successfully migrated: ${totalMigrated}`);
  console.log(`  Errors: ${totalErrors}`);
  
  if (totalErrors > 0) {
    console.log('\n❌ Some errors occurred during migration. Check the logs above for details.');
    process.exit(1);
  } else if (totalMigrated === 0) {
    console.log('\nℹ️  No data was migrated. The database might be empty or already migrated.');
  } else {
    console.log('\n✅ Migration completed successfully!');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting SQLite to PostgreSQL migration...');
  
  const sqliteDb = await loadSQLiteDB();
  const pgClient = await pgPool.connect();
  
  try {
    await pgClient.query('BEGIN');
    
    // Run migrations
    await migrateGuildConfigs(sqliteDb, pgClient);
    await migrateReminders(sqliteDb, pgClient);
    await migrateAuditLogs(sqliteDb, pgClient);
    
    // Commit the transaction
    await pgClient.query('COMMIT');
    
    // Display summary
    displaySummary();
  } catch (error) {
    await pgClient.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    pgClient.release();
    sqliteDb.close();
    await pgPool.end();
  }
}

// Run the migration
main().catch(error => {
  console.error('❌ Unhandled error during migration:', error);
  process.exit(1);
});
