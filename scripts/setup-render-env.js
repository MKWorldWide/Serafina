#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`)
};

async function main() {
  log.info('Serafina Render Environment Setup');
  log.info('================================');
  log.info('This script will help you set up environment variables for Render deployment.\n');
  
  // Check if .env.example exists
  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    log.error('.env.example file not found. Please make sure you run this script from the project root.');
    process.exit(1);
  }

  // Read .env.example
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  const envVars = [];
  
  // Parse environment variables
  envExample.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key) {
        envVars.push(key);
      }
    }
  });

  log.info(`Found ${envVars.length} environment variables to configure.\n`);
  
  // Create .env file if it doesn't exist
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, '');
    log.success('Created new .env file');
  }

  // Read existing .env file
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const existingVars = new Set();
  
  // Parse existing variables
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key) {
        existingVars.add(key);
      }
    }
  });

  // Ask for missing variables
  for (const varName of envVars) {
    if (!existingVars.has(varName)) {
      await new Promise((resolve) => {
        readline.question(`Enter value for ${colors.cyan}${varName}${colors.reset}: `, (value) => {
          if (value) {
            envContent += `\n${varName}=${value}`;
          }
          resolve();
        });
      });
    } else {
      log.info(`Using existing value for ${colors.cyan}${varName}${colors.reset}`);
    }
  }

  // Write updated .env file
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  
  log.success('\nEnvironment variables have been saved to .env');
  log.info('Please make sure to add these variables to your Render dashboard before deploying.');
  
  readline.close();
}

// Run the script
main().catch(err => {
  log.error(`An error occurred: ${err.message}`);
  process.exit(1);
});
