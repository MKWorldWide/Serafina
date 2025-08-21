const fs = require('fs-extra');
const path = require('path');

async function copyFiles() {
  try {
    const srcDir = path.join(__dirname, '..', 'src');
    const distDir = path.join(__dirname, '..', 'dist');

    // Ensure dist directory exists
    await fs.ensureDir(distDir);

    // Copy commands directory
    await fs.copy(
      path.join(srcDir, 'commands'),
      path.join(distDir, 'commands'),
      { overwrite: true }
    );

    // Copy events directory
    await fs.copy(
      path.join(srcDir, 'events'),
      path.join(distDir, 'events'),
      { overwrite: true }
    );

    console.log('Successfully copied all required files');
  } catch (error) {
    console.error('Error copying files:', error);
    process.exit(1);
  }
}

copyFiles();
