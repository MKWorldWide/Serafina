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

// 1. Install TypeScript globally first
console.log('📦 Installing TypeScript globally...');
if (!runCommand('npm install -g typescript@5.3.3')) {
  console.error('❌ Failed to install TypeScript globally');
  process.exit(1);
}

// 2. Install TypeScript locally
console.log('📦 Installing TypeScript locally...');
if (!runCommand('npm install --save-dev typescript@5.3.3')) {
  console.error('❌ Failed to install TypeScript locally');
  process.exit(1);
}

// 3. Run TypeScript compiler using the local installation
console.log('🔨 Compiling TypeScript...');
if (!runCommand('npx tsc -p tsconfig.json')) {
  console.error('❌ TypeScript compilation failed');
  process.exit(1);
}

// 4. Copy static files
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

// 5. Copy package.json to dist
console.log('📄 Copying package.json...');
fs.copyFileSync(
  path.join(__dirname, 'package.json'),
  path.join(__dirname, 'dist', 'package.json')
);

// 6. Install production dependencies in dist
console.log('📦 Installing production dependencies...');
process.chdir('dist');
if (!runCommand('npm install --production')) {
  console.error('❌ Failed to install production dependencies');
  process.exit(1);
}

console.log('🎉 Build completed successfully!');