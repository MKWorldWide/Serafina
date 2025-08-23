// Render-specific build script for Serafina
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Render build process...');

// Function to run commands with better error handling
function runCommand(command, options = {}) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    if (error.stderr) console.error(error.stderr.toString());
    return false;
  }
}

// 1. Ensure TypeScript is installed
console.log('🔍 Checking TypeScript installation...');
const tsCheck = runCommand('npm list typescript --depth=0');

if (!tsCheck) {
  console.log('📦 Installing TypeScript...');
  if (!runCommand('npm install --save-dev typescript@5.6.3')) {
    console.error('❌ Failed to install TypeScript');
    process.exit(1);
  }
}

// 2. Clean dist directory
console.log('🧹 Cleaning dist directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist');

// 3. Compile TypeScript using local tsc
console.log('🔨 Compiling TypeScript...');
const tscPath = path.join('node_modules', '.bin', 'tsc');
if (!runCommand(`${tscPath} -p tsconfig.json`)) {
  console.error('❌ TypeScript compilation failed');
  process.exit(1);
}

// 4. Copy package.json and .env
console.log('📄 Copying configuration files...');
['package.json', '.env'].forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('dist', file));
    console.log(`  - Copied ${file}`);
  }
});

// 5. Install production dependencies
console.log('📦 Installing production dependencies...');
process.chdir('dist');
if (!runCommand('npm install --production')) {
  console.error('❌ Failed to install production dependencies');
  process.exit(1);
}
process.chdir('..');

console.log('\n✨ Build completed successfully!');
console.log('   Run `node dist/index.js` to start the bot');
