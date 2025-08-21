const fs = require('fs-extra');
const path = require('path');

async function copyFiles() {
  const srcDirs = [
    'src/commands',
    'src/events',
    'src/locales',
    'src/assets'
  ];

  try {
    for (const srcDir of srcDirs) {
      const destDir = srcDir.replace('src/', 'dist/');
      if (fs.existsSync(srcDir)) {
        console.log(`Copying ${srcDir} to ${destDir}`);
        await fs.ensureDir(path.dirname(destDir));
        await fs.copy(srcDir, destDir, { overwrite: true });
      }
    }
    console.log('All assets copied successfully');
  } catch (error) {
    console.error('Error copying files:', error);
    process.exit(1);
  }
}

copyFiles();
