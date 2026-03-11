"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearScript = void 0;
const firebase_server_1 = require("../../src/services/firebase/firebase.server");
const base_script_1 = require("../core/base.script");
class ClearScript extends base_script_1.BaseScript {
    constructor() {
        super(...arguments);
        this.name = 'Clear Data';
        this.collections = ['snippets', 'users'];
    }
    async run() {
        await this.ensureReady();
        this.log('Clearing DEV database...');
        let totalDeleted = 0;
        for (const collection of this.collections) {
            const deleted = await this.clearCollection(collection);
            totalDeleted += deleted;
        }
        this.logSuccess(`Cleared ${totalDeleted} documents`);
    }
    async clearCollection(collectionName) {
        const snapshot = await firebase_server_1.adminDb.collection(collectionName).get();
        if (snapshot.empty) {
            this.log(`${collectionName} is already empty`);
            return 0;
        }
        const batch = firebase_server_1.adminDb.batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        this.log(`Deleted ${snapshot.size} documents from ${collectionName}`);
        return snapshot.size;
    }
}
exports.ClearScript = ClearScript;
