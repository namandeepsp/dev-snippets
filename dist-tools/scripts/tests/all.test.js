"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const main_runner_1 = require("../core/main.runner");
const clear_script_1 = require("../features/clear.script");
const seed_script_1 = require("../features/seed.script");
const snippet_script_1 = require("../features/snippet.script");
const user_script_1 = require("../features/user.script");
const auth_script_1 = require("../features/auth.script");
(0, vitest_1.describe)('All Features', () => {
    (0, vitest_1.beforeAll)(async () => {
        // Setup: Clear and seed database
        await new clear_script_1.ClearScript().run();
        await new seed_script_1.SeedScript().run();
    });
    (0, vitest_1.it)('should run all feature tests', async () => {
        const runner = new main_runner_1.MainRunner([
            new auth_script_1.AuthScript(),
            new snippet_script_1.SnippetScript(),
            new user_script_1.UserScript(),
        ]);
        await runner.run();
    });
});
