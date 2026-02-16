import { describe, it } from 'vitest';
import { ClearScript } from '../features/clear.script';
import { SeedScript } from '../features/seed.script';

describe('Database Operations', () => {
  it('should clear database', async () => {
    const script = new ClearScript();
    await script.run();
  });

  it('should seed database', async () => {
    const script = new SeedScript();
    await script.run();
  });
});
