const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process...');

// Clean dist directory
console.log('Cleaning dist directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync('dist');

// Copy commands and events directories first to ensure they exist for TypeScript
console.log('Copying source directories...');
['commands', 'events'].forEach(dir => {
  const src = path.join('src', dir);
  const dest = path.join('dist', dir);
  
  if (fs.existsSync(src)) {
    fs.mkdirSync(dest, { recursive: true });
    copyRecursiveSync(src, dest);
  }
});

// Build TypeScript files
console.log('Compiling TypeScript...');
execSync('npx tsc', { stdio: 'inherit' });

// Copy required directories
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      // Skip .ts files in dist directory
      if (childItemName.endsWith('.ts') && dest.includes('dist')) {
        return;
      }
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else if (exists) {
    // Only copy non-TypeScript files to dist
    if (!src.endsWith('.ts') || !dest.includes('dist')) {
      fs.copyFileSync(src, dest);
    }
  }
}

console.log('Verifying build...');
// Verify required directories exist
['dist/commands', 'dist/events'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.error(`Error: ${dir} directory is missing after build!`);
    process.exit(1);
  }
});

console.log('Build completed successfully!');
