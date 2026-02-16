import { adminDb } from '../../src/services/firebase/firebase.server'
import { IScript } from './script.interface'

export abstract class BaseScript implements IScript {
  abstract name: string;

  protected ensureDevEnvironment(): void {
    console.log(process.env.FIREBASE_PROJECT_ID, "process.env.FIREBASE_PROJECT_ID")
    if (process.env.FIREBASE_PROJECT_ID !== 'dev-snippets-dev') {
      throw new Error(
        `❌ This script can only run on dev-snippets-dev!\n   Current: ${process.env.FIREBASE_PROJECT_ID}`
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
