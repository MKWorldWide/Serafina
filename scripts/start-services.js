const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the absolute path to the project root and ensure it's properly escaped for Windows
const projectRoot = path.resolve(__dirname, '..');
const servicesDir = path.join(projectRoot, 'src', 'services');

// Use double quotes around paths to handle spaces
const escapePath = (p) => `"${p}"`;

const services = [
  { name: 'Shadow Nexus', port: 8000, file: 'shadow-nexus.ts' },
  { name: 'AthenaCore', port: 8001, file: 'athena-core.ts' },
  { name: 'Divina', port: 8002, file: 'divina.ts' }
];

console.log('🚀 Starting all services...\n');
console.log(`Project root: ${projectRoot}`);
console.log(`Services dir: ${servicesDir}\n`);

// Start each service in sequence to avoid port conflicts and make logs clearer
async function startServices() {
  for (const service of services) {
    try {
      const servicePath = path.join(servicesDir, service.file);
      console.log(`📡 Starting ${service.name} on port ${service.port}...`);
      
      // Use spawn with proper argument handling for Windows
      const child = spawn('cmd.exe', [
        '/c',
        'npx.cmd',
        'tsx',
        escapePath(servicePath)
      ], {
        env: { 
          ...process.env, 
          PORT: service.port.toString(),
          NODE_OPTIONS: '--no-warnings'
        },
        stdio: 'inherit',
        shell: true,
        cwd: projectRoot,
        windowsVerbatimArguments: true
      });

      child.on('close', (code) => {
        console.log(`\n[${service.name}] Process exited with code ${code}`);
        if (code !== 0) {
          console.error(`❌ ${service.name} failed to start`);
        }
      });

      // Give the service a moment to start before starting the next one
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to start ${service.name}:`, error.message);
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping all services...');
  process.exit(0);
});

// Start the services
startServices().catch(console.error);
