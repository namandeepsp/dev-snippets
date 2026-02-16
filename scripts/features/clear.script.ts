import { adminDb } from '../../src/services/firebase/firebase.server';
import { BaseScript } from '../core/base.script';

export class ClearScript extends BaseScript {
  name = 'Clear Data';
  private collections = ['snippets', 'users'];

  async run(): Promise<void> {
    await this.ensureReady();
    this.log('Clearing DEV database...');

    let totalDeleted = 0;

    for (const collection of this.collections) {
      const deleted = await this.clearCollection(collection);
      totalDeleted += deleted;
    }

    this.logSuccess(`Cleared ${totalDeleted} documents`);
  }

  private async clearCollection(collectionName: string): Promise<number> {
    const snapshot = await adminDb.collection(collectionName).get();

    if (snapshot.empty) {
      this.log(`${collectionName} is already empty`);
      return 0;
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    this.log(`Deleted ${snapshot.size} documents from ${collectionName}`);
    return snapshot.size;
  }
}
