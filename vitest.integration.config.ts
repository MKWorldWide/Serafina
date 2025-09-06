import { defineConfig, mergeConfig } from 'vitest/config';
import vitestConfig from './vitest.config';

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      name: 'integration',
      include: ['**/integration/**/*.test.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/e2e/**',
      ],
      environment: 'node',
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
      testTimeout: 30000, // 30 seconds
    },
  })
);
