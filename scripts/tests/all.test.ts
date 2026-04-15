import { describe, it, beforeAll } from 'vitest';
import { MainRunner } from '../core/main.runner';
import { ClearScript } from '../features/clear.script';
import { SeedScript } from '../features/seed.script';
import { SnippetScript } from '../features/snippet.script';
import { UserScript } from '../features/user.script';
import { AuthScript } from '../features/auth.script';

describe('All Features', () => {
  beforeAll(async () => {
    await new ClearScript().run();
    await new SeedScript().run();
  });

  it('should run all feature tests', async () => {
    const runner = new MainRunner([
      new AuthScript(),
      new SnippetScript(),
      new UserScript(),
    ]);

    await runner.run();
  });
});
