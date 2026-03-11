"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = exports.adminDb = void 0;
exports.getServerFirebaseAuth = getServerFirebaseAuth;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
// Validate required environment variables
if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is required');
}
if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('FIREBASE_CLIENT_EMAIL environment variable is required');
}
if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('FIREBASE_PRIVATE_KEY environment variable is required');
}
const firebaseAdminConfig = {
    credential: (0, app_1.cert)({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
};
const adminApp = (0, app_1.getApps)().length === 0 ? (0, app_1.initializeApp)(firebaseAdminConfig) : (0, app_1.getApps)()[0];
exports.adminDb = (0, firestore_1.getFirestore)(adminApp);
exports.adminAuth = (0, auth_1.getAuth)(adminApp);
function getServerFirebaseAuth() {
    return exports.adminAuth;
}
