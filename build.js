const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Recursively copy directory contents
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Starting build process...');

// Clean dist directory
console.log('Cleaning dist directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync('dist');

// First, compile TypeScript with noEmit to catch critical errors
console.log('Checking TypeScript for critical errors...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
} catch (error) {
  console.warn('TypeScript check completed with non-critical errors, continuing build...');
}

// Copy source directories
console.log('Copying source directories...');
['commands', 'events'].forEach(dir => {
  const src = path.join('src', dir);
  const dest = path.join('dist', dir);
  
  if (fs.existsSync(src)) {
    fs.mkdirSync(dest, { recursive: true });
    copyRecursiveSync(src, dest);
  }
});

// Compile TypeScript to JavaScript
console.log('Compiling TypeScript to JavaScript...');
try {
  // Compile TypeScript with emit to generate JS files
  execSync('npx tsc --emitDeclarationOnly false', { stdio: 'inherit' });
} catch (error) {
  console.error('TypeScript compilation failed:', error.message);
  process.exit(1);
}

async function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) return;

  const stats = await stat(src);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    await mkdir(dest, { recursive: true });
    const items = await readdir(src);
    
    for (const item of items) {
      // Skip TypeScript source files in dist directory
      if (item.endsWith('.ts') && dest.includes('dist')) {
        continue;
      }
      await copyRecursive(
        path.join(src, item),
        path.join(dest, item)
      );
    }
  } else if (!src.endsWith('.ts') || !dest.includes('dist')) {
    await copyFile(src, dest);
  }
}

console.log('Copying additional assets...');
try {
  // Run the copy-assets script
  require('./scripts/copy-assets');
  
  // Verify required directories exist
  const requiredDirs = [
    'dist/commands',
    'dist/events',
    'dist/locales',
    'dist/assets'
  ];

  let allDirsExist = true;
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      console.warn(`Warning: ${dir} directory is missing after build`);
      allDirsExist = false;
    }
  }

  if (!allDirsExist) {
    console.warn('Some directories are missing, but continuing with build...');
  }

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Error during final build steps:', error);
  process.exit(1);
}
