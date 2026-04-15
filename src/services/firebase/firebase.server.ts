import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

if (!process.env.FIREBASE_PROJECT_ID) {
	throw new Error('FIREBASE_PROJECT_ID environment variable is required')
}
if (!process.env.FIREBASE_CLIENT_EMAIL) {
	throw new Error('FIREBASE_CLIENT_EMAIL environment variable is required')
}
if (!process.env.FIREBASE_PRIVATE_KEY) {
	throw new Error('FIREBASE_PRIVATE_KEY environment variable is required')
}

const firebaseAdminConfig = {
	credential: cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
	}),
	projectId: process.env.FIREBASE_PROJECT_ID,
}

const adminApp =
	getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)

export function getServerFirebaseAuth() {
	return adminAuth
}
