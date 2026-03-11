"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const user_script_1 = require("../features/user.script");
const clear_script_1 = require("../features/clear.script");
vitest_1.describe.sequential('User Feature', () => {
    let script;
    (0, vitest_1.beforeAll)(async () => {
        // Clear data before tests
        await new clear_script_1.ClearScript().run();
        script = new user_script_1.UserScript();
    });
    (0, vitest_1.it)('creates a user', async () => {
        await script.testCreateUser();
    });
    (0, vitest_1.it)('gets user by ID', async () => {
        await script.testGetUserById();
    });
    (0, vitest_1.it)('gets user by username', async () => {
        await script.testGetUserByUsername();
    });
    (0, vitest_1.it)('gets user by email', async () => {
        await script.testGetUserByEmail();
    });
    (0, vitest_1.it)('updates user', async () => {
        await script.testUpdateUser();
    });
    (0, vitest_1.it)('deletes user', async () => {
        await script.testDeleteUser();
    });
});
