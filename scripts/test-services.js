#!/usr/bin/env node
const { execSync } = require('child_process');
const http = require('http');
const readline = require('readline');

// Configuration
const SERVICES = [
  { name: 'Shadow Nexus', port: 10000, path: 'src/services/shadow-nexus.ts' },
  { name: 'AthenaCore', port: 10001, path: 'src/services/athena-core.ts' },
  { name: 'Divina', port: 10002, path: 'src/services/divina.ts' }
];

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

// Check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer()
      .listen(port, '0.0.0.0')
      .on('error', () => resolve(true))
      .on('listening', () => {
        server.close();
        resolve(false);
      });
  });
}

// Test service endpoint
async function testService(service) {
  const { name, port } = service;
  
  try {
    log.info(`Testing ${name} service on port ${port}...`);
    
    // Check if port is available
    if (await isPortInUse(port)) {
      log.warn(`Port ${port} is already in use. ${name} service might already be running.`);
      return false;
    }
    
    // Start the service
    log.info(`Starting ${name} service...`);
    const serviceProcess = execSync(`npx tsx ${service.path}`, { stdio: 'pipe', encoding: 'utf8' });
    
    // Give the service some time to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test the status endpoint
    const response = await new Promise((resolve) => {
      http.get(`http://localhost:${port}/status`, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      }).on('error', () => resolve({ statusCode: 0, data: 'Connection failed' }));
    });
    
    if (response.statusCode === 200) {
      log.success(`${name} service is running and responding correctly`);
      log.info(`Response: ${response.data}`);
      return true;
    } else {
      log.error(`${name} service returned status code ${response.statusCode}`);
      log.error(`Response: ${response.data}`);
      return false;
    }
  } catch (error) {
    log.error(`Error testing ${name} service: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  log.info('Starting Serafina Services Test');
  log.info('============================\n');
  
  let allTestsPassed = true;
  
  for (const service of SERVICES) {
    const success = await testService(service);
    if (!success) {
      allTestsPassed = false;
      log.warn(`${service.name} service test failed\n`);
    } else {
      log.success(`${service.name} service test passed\n`);
    }
  }
  
  if (allTestsPassed) {
    log.success('All services tested successfully!');
  } else {
    log.warn('Some services failed the tests. Please check the logs above for details.');
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Run the tests
main().catch(error => {
  log.error(`Test script failed: ${error.message}`);
  process.exit(1);
});
