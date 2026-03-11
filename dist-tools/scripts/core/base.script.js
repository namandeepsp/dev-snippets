"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScript = void 0;
const firebase_server_1 = require("../../src/services/firebase/firebase.server");
class BaseScript {
    ensureDevEnvironment() {
        console.log(process.env.FIREBASE_PROJECT_ID, "process.env.FIREBASE_PROJECT_ID");
        if (process.env.FIREBASE_PROJECT_ID !== 'dev-snippets-dev') {
            throw new Error(`❌ This script can only run on dev-snippets-dev!\n   Current: ${process.env.FIREBASE_PROJECT_ID}`);
        }
    }
    log(message) {
        console.log(`[${this.name}] ${message}`);
    }
    logSuccess(message) {
        console.log(`[${this.name}] ✅ ${message}`);
    }
    logError(message) {
        console.error(`[${this.name}] ❌ ${message}`);
    }
    async ensureReady() {
        this.ensureDevEnvironment();
        await this.ensureFirestoreConnectivity();
    }
    async ensureFirestoreConnectivity(timeoutMs = 8000) {
        try {
            const op = firebase_server_1.adminDb.listCollections();
            const timed = new Promise((_, reject) => setTimeout(() => reject(new Error('timed out')), timeoutMs));
            await Promise.race([op, timed]);
        }
        catch (error) {
            throw new Error(`❌ Firestore unreachable. Check internet/DNS and Firebase credentials. (${error instanceof Error ? error.message : String(error)})`);
        }
    }
}
exports.BaseScript = BaseScript;
