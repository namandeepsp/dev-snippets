import { describe, it, beforeAll } from 'vitest';
import { SnippetScript } from '../features/snippet.script';
import { SeedScript } from '../features/seed.script';
import { ClearScript } from '../features/clear.script';

describe.sequential('Snippet Feature', () => {
  let script: SnippetScript;

  beforeAll(async () => {
    // Clear and seed data before tests
    await new ClearScript().run();
    await new SeedScript().run();
    script = new SnippetScript();
  });

  it('creates a snippet', async () => {
    await script.testCreateSnippet();
  });

  it('creates 100 bulk snippets', async () => {
    await script.testCreateBulkSnippets();
  });

  it('lists public snippets', async () => {
    await script.testListPublicSnippets();
  });

  it('gets snippet by ID', async () => {
    await script.testGetSnippetById();
  });

  it('lists snippets by user', async () => {
    await script.testListByUser();
  });

  it('lists snippets by visibility', async () => {
    await script.testListByVisibility();
  });

  it('updates snippet', async () => {
    await script.testUpdateSnippet();
  });

  it('deletes snippet', async () => {
    await script.testDeleteSnippet();
  });
});
