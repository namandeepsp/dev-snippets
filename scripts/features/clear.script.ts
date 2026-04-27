import { fileURLToPath } from 'node:url'
import { FirebaseAuthError } from 'firebase-admin/auth'
import {
	adminDb,
	getServerFirebaseAuth,
} from '../../src/services/firebase/firebase.server'
import { BaseScript } from '../core/base.script'

export class ClearScript extends BaseScript {
	name = 'Clear Data'
	private collections = ['users', 'snippets', 'snippet_likes']
	private clearAuthorizedUsers = true

	async run(): Promise<void> {
		await this.ensureReady()
		this.log('Clearing DEV database (preserving users)...')

		let totalDeleted = 0

		for (const collection of this.collections) {
			const deleted = await this.clearCollection(collection)
			totalDeleted += deleted
		}

		if (this.clearAuthorizedUsers) {
			const authDeleted = await this.clearAuthUsers()
			this.log(`Deleted ${authDeleted} Firebase Auth users`)
		}

		this.logSuccess(`Cleared ${totalDeleted} documents`)
	}

	private async clearCollection(collectionName: string): Promise<number> {
		const snapshot = await adminDb.collection(collectionName).get()

		if (snapshot.empty) {
			this.log(`${collectionName} is already empty`)
			return 0
		}

		const batch = adminDb.batch()
		snapshot.docs.forEach((doc) => batch.delete(doc.ref))
		await batch.commit()

		this.log(`Deleted ${snapshot.size} documents from ${collectionName}`)
		return snapshot.size
	}

	private async clearAuthUsers(): Promise<number> {
		const auth = getServerFirebaseAuth()
		const listResult = await auth.listUsers()

		let deleted = 0
		for (const user of listResult.users) {
			try {
				await auth.deleteUser(user.uid)
				deleted++
			} catch (error) {
				if (
					error instanceof FirebaseAuthError &&
					error.code === 'auth/user-not-found'
				) {
					continue
				}
				throw error
			}
		}

		return deleted
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	new ClearScript().run().catch((error) => {
		console.error(error)
		process.exit(1)
	})
}
