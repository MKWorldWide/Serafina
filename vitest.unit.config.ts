import { defineConfig, mergeConfig } from 'vitest/config';
import vitestConfig from './vitest.config';

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      name: 'unit',
      include: ['**/*.spec.ts', '**/*.test.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/e2e/**',
        '**/integration/**',
      ],
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
    },
  })
);
