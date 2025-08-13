#!/usr/bin/env node
/**
 * Repository Doctor
 * 
 * This script checks the development environment for required tools,
 * configurations, and dependencies to ensure everything is set up correctly.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, accessSync, constants } from 'fs';
import { join } from 'path';
import { config } from '../src/config';
import { getDB } from '../src/store/db';

// Define interfaces for check results
interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

// Track all check results
const results: CheckResult[] = [];

/**
 * Add a check result to the results array
 */
function addResult(name: string, status: 'pass' | 'fail' | 'warn', message: string, details?: string) {
  results.push({ name, status, message, details });
}

/**
 * Check Node.js version
 */
function checkNodeVersion() {
  const requiredVersion = '20.0.0';
  const currentVersion = process.version;
  
  // Remove the 'v' prefix if present
  const currentVersionNum = currentVersion.replace(/^v/, '');
  const [major] = currentVersionNum.split('.').map(Number);
  
  if (major >= 20) {
    addResult(
      'Node.js Version',
      'pass',
      `Using Node.js ${currentVersion}`,
      `Required: >=${requiredVersion}`
    );
  } else {
    addResult(
      'Node.js Version',
      'fail',
      `Node.js ${currentVersion} is not supported`,
      `Required: >=${requiredVersion}. Please update Node.js.`
    );
  }
}

/**
 * Check if a file exists and is accessible
 */
function checkFileAccess(filePath: string, label: string, required = true) {
  try {
    accessSync(filePath, constants.R_OK);
    addResult(
      `${label} Access`,
      'pass',
      `File is accessible: ${filePath}`
    );
    return true;
  } catch (error) {
    const status = required ? 'fail' : 'warn';
    const message = required 
      ? `Cannot access required file: ${filePath}`
      : `Optional file not found: ${filePath}`;
      
    addResult(
      `${label} Access`,
      status,
      message,
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

/**
 * Check if a directory exists and is writable
 */
function checkDirectoryWritable(dirPath: string, label: string, required = true) {
  try {
    // Try to create the directory if it doesn't exist
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
    
    // Try to write a test file
    const testFile = join(dirPath, '.writetest');
    writeFileSync(testFile, 'test');
    
    // Clean up
    try {
      require('fs').unlinkSync(testFile);
    } catch { /* Ignore cleanup errors */ }
    
    addResult(
      `${label} Directory`,
      'pass',
      `Directory is writable: ${dirPath}`
    );
    return true;
  } catch (error) {
    const status = required ? 'fail' : 'warn';
    const message = required
      ? `Cannot write to required directory: ${dirPath}`
      : `Cannot write to optional directory: ${dirPath}`;
      
    addResult(
      `${label} Directory`,
      status,
      message,
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

/**
 * Check if a port is available
 */
async function checkPort(port: number, label: string) {
  const net = await import('net');
  const server = net.createServer();
  
  return new Promise<boolean>((resolve) => {
    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        addResult(
          `${label} Port`,
          'fail',
          `Port ${port} is already in use`,
          'Please close the application using this port or change the PORT_HTTP in your .env file.'
        );
        resolve(false);
      } else {
        addResult(
          `${label} Port`,
          'warn',
          `Unexpected error checking port ${port}`,
          err.message
        );
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      server.close();
      addResult(
        `${label} Port`,
        'pass',
        `Port ${port} is available`
      );
      resolve(true);
    });
    
    server.listen(port, '0.0.0.0');
  });
}

/**
 * Check database connection
 */
async function checkDatabase() {
  try {
    const db = await getDB();
    
    // Test a simple query
    await db.get('SELECT 1 as test');
    
    addResult(
      'Database Connection',
      'pass',
      `Successfully connected to ${config.DB_DRIVER} database`
    );
    
    // Check if tables exist
    try {
      await db.get('SELECT 1 FROM guild_config LIMIT 1');
      await db.get('SELECT 1 FROM reminders LIMIT 1');
      await db.get('SELECT 1 FROM audit LIMIT 1');
      
      addResult(
        'Database Schema',
        'pass',
        'All required tables exist'
      );
    } catch (error) {
      addResult(
        'Database Schema',
        'warn',
        'Some database tables are missing',
        'Run `npm run migrate:db` to create the required tables.'
      );
    }
    
    // Close the connection
    await db.close();
  } catch (error) {
    addResult(
      'Database Connection',
      'fail',
      'Failed to connect to the database',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Check environment variables
 */
function checkEnvironment() {
  // Check required environment variables
  const requiredVars = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    addResult(
      'Environment Variables',
      'fail',
      `Missing required environment variables: ${missingVars.join(', ')}`,
      'Please check your .env file and ensure all required variables are set.'
    );
  } else {
    addResult(
      'Environment Variables',
      'pass',
      'All required environment variables are present'
    );
  }
  
  // Check database URL format
  if (config.DB_DRIVER === 'postgres' && !config.POSTGRES_URL) {
    addResult(
      'PostgreSQL Configuration',
      'fail',
      'POSTGRES_URL is required when using PostgreSQL',
      'Please set the POSTGRES_URL environment variable in your .env file.'
    );
  }
}

/**
 * Display the results in a user-friendly format
 */
function displayResults() {
  console.log('\n🔍 Serafina Repository Doctor\n');
  
  // Group results by status
  const passed = results.filter(r => r.status === 'pass');
  const warnings = results.filter(r => r.status === 'warn');
  const failures = results.filter(r => r.status === 'fail');
  
  // Display failures first, then warnings, then passes
  [...failures, ...warnings, ...passed].forEach((result, index) => {
    const prefix = 
      result.status === 'pass' ? '✅' :
      result.status === 'warn' ? '⚠️ ' : '❌';
    
    console.log(`${prefix} ${result.name}: ${result.message}`);
    
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    
    // Add a separator between sections
    if ((index === failures.length - 1 && warnings.length > 0) || 
        (index === failures.length + warnings.length - 1 && passed.length > 0)) {
      console.log('');
    }
  });
  
  // Display summary
  console.log('\n📊 Summary:');
  console.log(`   ${passed.length} checks passed`);
  console.log(`   ${warnings.length} warnings`);
  console.log(`   ${failures.length} failures\n`);
  
  // Exit with appropriate status code
  if (failures.length > 0) {
    console.log('❌ Some checks failed. Please fix the issues above and try again.\n');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('⚠️  Some checks produced warnings. Review the output above.\n');
    process.exit(0);
  } else {
    console.log('✅ All checks passed! You\'re ready to go! 🚀\n');
    process.exit(0);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Running Serafina Repository Doctor...\n');
  
  // Run all checks
  checkNodeVersion();
  checkEnvironment();
  checkFileAccess('.env', 'Environment File', true);
  checkDirectoryWritable('data', 'Data Directory', true);
  
  // Only check port if we're not in test mode
  if (process.env.NODE_ENV !== 'test') {
    await checkPort(config.PORT_HTTP, 'HTTP');
  }
  
  // Check database connection
  await checkDatabase();
  
  // Display results
  displayResults();
}

// Run the main function
main().catch(error => {
  console.error('❌ An unexpected error occurred:', error);
  process.exit(1);
});
