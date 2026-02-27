import { adminDb } from '../../src/services/firebase/firebase.server'
import { IScript } from './script.interface'

export abstract class BaseScript implements IScript {
  abstract name: string;

  protected ensureDevEnvironment(): void {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const allowNonDev = process.env.ALLOW_NON_DEV_SCRIPTS === 'true'

    if (projectId !== 'dev-snippets-dev' && !allowNonDev) {
      throw new Error(
        `❌ This script can only run on dev-snippets-dev by default.\n   Current: ${projectId}\n   Set ALLOW_NON_DEV_SCRIPTS=true to override intentionally.`
      );
    }
  }

  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }

  protected logSuccess(message: string): void {
    console.log(`[${this.name}] ✅ ${message}`);
  }

  protected logError(message: string): void {
    console.error(`[${this.name}] ❌ ${message}`);
  }

  protected async ensureReady(): Promise<void> {
    this.ensureDevEnvironment()
    await this.ensureFirestoreConnectivity()
  }

  protected async ensureFirestoreConnectivity(timeoutMs = 8000): Promise<void> {
    try {
      const op = adminDb.listCollections()
      const timed = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timed out')), timeoutMs),
      )
      await Promise.race([op, timed])
    } catch (error) {
      throw new Error(
        `❌ Firestore unreachable. Check internet/DNS and Firebase credentials. (${error instanceof Error ? error.message : String(error)})`,
      )
    }
  }

  abstract run(): Promise<void>;
}
