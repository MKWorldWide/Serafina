// Render-specific build script for Serafina
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  if (!runCommand('npm install --save-dev typescript@5.3.3')) {
    console.error('❌ Failed to install TypeScript');
    process.exit(1);
  }
}

// 2. Run TypeScript compiler
console.log('🔨 Compiling TypeScript...');
if (!runCommand('npx tsc')) {
  console.error('❌ TypeScript compilation failed');
  process.exit(1);
}

// 3. Copy static files
console.log('📂 Copying static files...');
const staticDirs = ['public', 'views'];
staticDirs.forEach(dir => {
  const source = path.join(__dirname, dir);
  const dest = path.join(__dirname, 'dist', dir);
  
  if (fs.existsSync(source)) {
    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
    }
    fs.cpSync(source, dest, { recursive: true });
    console.log(`✅ Copied ${dir} to dist/`);
  }
});

console.log('🎉 Build completed successfully!');