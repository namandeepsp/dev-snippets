import { defineConfig } from 'vitest/config';
import path from 'path';
import fs from 'fs';

export default defineConfig(() => {
  const runFirebaseTests = process.env.RUN_FIREBASE_TESTS === 'true';
  const runFormatterIntegrationTests =
    process.env.RUN_FORMATTER_INTEGRATION_TESTS === 'true';

  // Start with empty env to avoid .env.local fallback
  const env: Record<string, string> = {};
  
  // Read .env.test directly for test isolation
  const testEnvPath = path.join(process.cwd(), '.env.test');
  if (fs.existsSync(testEnvPath)) {
    const testEnvContent = fs.readFileSync(testEnvPath, 'utf-8');
    testEnvContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key) {
          env[key] = value;
        }
      }
    });
  }

  // Make env vars available on process.env
  Object.assign(process.env, env);

  return {
    test: {
      globals: true,
      environment: 'node',
      include: runFirebaseTests
        ? ['scripts/tests/**/*.test.ts', 'src/**/__tests__/**/*.test.ts']
        : ['src/**/__tests__/**/*.test.ts'],
      exclude: [
        ...(runFormatterIntegrationTests ? [] : ['**/*.integration.test.ts']),
        '**/*.contract.test.ts',
      ],
      testTimeout: 120000,
      hookTimeout: 120000,
      fileParallelism: false,
      maxConcurrency: 1,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
