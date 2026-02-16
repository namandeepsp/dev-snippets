import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env variables from .env.local
  const env = loadEnv(mode, process.cwd(), '');

  // Make env vars available on process.env
  Object.assign(process.env, env);

  return {
    test: {
      globals: true,
      environment: 'node',
      include: ['scripts/tests/**/*.test.ts'],
      testTimeout: 120000,
      hookTimeout: 120000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
