import { IScript } from './script.interface';
import { BaseScript } from './base.script';

export class MainRunner extends BaseScript {
  name = 'Main Runner';

  constructor(private scripts: IScript[]) {
    super();
  }

  async run(): Promise<void> {
    this.ensureDevEnvironment();
    this.log(`Running ${this.scripts.length} test scripts...\n`);

    for (const script of this.scripts) {
      try {
        await script.run();
      } catch (error) {
        this.logError(`${script.name} failed: ${error}`);
        throw error;
      }
    }

    this.logSuccess('All scripts completed successfully');
  }
}
