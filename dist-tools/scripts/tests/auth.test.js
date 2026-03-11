"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_script_1 = require("../features/auth.script");
const clear_script_1 = require("../features/clear.script");
vitest_1.describe.sequential('Auth Feature', () => {
    let script;
    (0, vitest_1.beforeAll)(async () => {
        await new clear_script_1.ClearScript().run();
        script = new auth_script_1.AuthScript();
    });
    (0, vitest_1.it)('signs up with email and password', async () => {
        await script.testSignUpWithEmailAndPassword();
    });
    (0, vitest_1.it)('signs in with email and password', async () => {
        await script.testSignInWithEmailAndPassword();
    });
    (0, vitest_1.it)('gets current user', async () => {
        await script.testGetCurrentUser();
    });
    (0, vitest_1.it)('signs out', async () => {
        await script.testSignOut();
    });
    (0, vitest_1.it)('skips google sign-in (interactive)', async () => {
        await script.testSignInWithGoogle();
    });
});
