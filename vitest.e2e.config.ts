import { defineConfig, mergeConfig } from 'vitest/config';
import vitestConfig from './vitest.config';

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      name: 'e2e',
      include: ['**/e2e/**/*.test.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/integration/**',
      ],
      environment: 'node',
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
      testTimeout: 60000, // 1 minute
    },
  })
);
