"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRunner = void 0;
const base_script_1 = require("./base.script");
class MainRunner extends base_script_1.BaseScript {
    constructor(scripts) {
        super();
        this.scripts = scripts;
        this.name = 'Main Runner';
    }
    async run() {
        this.ensureDevEnvironment();
        this.log(`Running ${this.scripts.length} test scripts...\n`);
        for (const script of this.scripts) {
            try {
                await script.run();
                console.log('');
            }
            catch (error) {
                this.logError(`${script.name} failed: ${error}`);
                throw error;
            }
        }
        this.logSuccess('All scripts completed successfully');
    }
}
exports.MainRunner = MainRunner;
