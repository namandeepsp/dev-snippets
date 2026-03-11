"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const snippet_script_1 = require("../features/snippet.script");
const seed_script_1 = require("../features/seed.script");
const clear_script_1 = require("../features/clear.script");
vitest_1.describe.sequential('Snippet Feature', () => {
    let script;
    (0, vitest_1.beforeAll)(async () => {
        // Clear and seed data before tests
        await new clear_script_1.ClearScript().run();
        await new seed_script_1.SeedScript().run();
        script = new snippet_script_1.SnippetScript();
    });
    (0, vitest_1.it)('creates a snippet', async () => {
        await script.testCreateSnippet();
    });
    (0, vitest_1.it)('creates 100 bulk snippets', async () => {
        await script.testCreateBulkSnippets();
    });
    (0, vitest_1.it)('lists public snippets', async () => {
        await script.testListPublicSnippets();
    });
    (0, vitest_1.it)('gets snippet by ID', async () => {
        await script.testGetSnippetById();
    });
    (0, vitest_1.it)('lists snippets by user', async () => {
        await script.testListByUser();
    });
    (0, vitest_1.it)('lists snippets by visibility', async () => {
        await script.testListByVisibility();
    });
    (0, vitest_1.it)('updates snippet', async () => {
        await script.testUpdateSnippet();
    });
    (0, vitest_1.it)('deletes snippet', async () => {
        await script.testDeleteSnippet();
    });
});
