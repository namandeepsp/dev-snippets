"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const clear_script_1 = require("../features/clear.script");
const seed_script_1 = require("../features/seed.script");
(0, vitest_1.describe)('Database Operations', () => {
    (0, vitest_1.it)('should clear database', async () => {
        const script = new clear_script_1.ClearScript();
        await script.run();
    });
    (0, vitest_1.it)('should seed database', async () => {
        const script = new seed_script_1.SeedScript();
        await script.run();
    });
});
