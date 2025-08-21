import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  target: 'node18',
  platform: 'node',
  banner: {
    js: '#!/usr/bin/env node',
  },
  // Copy all files from src to dist, preserving directory structure
  async onSuccess() {
    const { copy } = await import('esbuild-plugin-copy');
    return {
      copy: [
        {
          from: './src/commands/**/*',
          to: './commands',
        },
        {
          from: './src/events/**/*',
          to: './events',
        },
        {
          from: './src/**/*.{json,md,txt}',
          to: './',
        },
      ],
    };
  },
});
