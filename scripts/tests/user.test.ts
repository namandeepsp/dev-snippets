import { describe, it, beforeAll } from 'vitest';
import { UserScript } from '../features/user.script';
import { ClearScript } from '../features/clear.script';

describe.sequential('User Feature', () => {
  let script: UserScript;

  beforeAll(async () => {
    await new ClearScript().run();
    script = new UserScript();
  });

  it('creates a user', async () => {
    await script.testCreateUser();
  });

  it('gets user by ID', async () => {
    await script.testGetUserById();
  });

  it('gets user by username', async () => {
    await script.testGetUserByUsername();
  });

  it('gets user by email', async () => {
    await script.testGetUserByEmail();
  });

  it('updates user', async () => {
    await script.testUpdateUser();
  });

  it('deletes user', async () => {
    await script.testDeleteUser();
  });
});
