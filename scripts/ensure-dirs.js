const fs = require('fs');
const path = require('path');

// Ensure required directories exist in dist
const requiredDirs = [
  'dist/commands',
  'dist/events'
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('Verified required directories exist');
