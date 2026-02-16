import { adminDb } from '@/services/firebase/firebase.server'
import { FieldValue } from 'firebase-admin/firestore'
import type {
	CreateSnippetInput,
	SnippetRepository,
	UpdateSnippetInput,
} from '../../core/repositories/snippet.repository'
import type {
	FirestoreSnippet,
	Snippet,
	SnippetVersion,
	SnippetVisibility,
} from '../../core/snippet.types'

const COLLECTION_NAME = 'snippets'

/**
 * ============================================================================
 * FIREBASE SNIPPET REPOSITORY
 * ============================================================================
 *
 * Firebase/Firestore implementation of the SnippetRepository port.
 *
 * Key responsibilities:
 * 1. Map Firestore document data to domain Snippet type
 * 2. Handle Firestore-specific operations (atomic increments, batches)
 * 3. Implement soft delete pattern
 * 4. No business logic - just persistence
 *
 * This is the ONLY place where Firestore-specific code should exist
 * for snippet operations.
 */

export class FirebaseSnippetRepository implements SnippetRepository {
	private getCollection() {
		return adminDb.collection(COLLECTION_NAME)
	}

	/* ----------------------------------------------------------------------- */
	/* CREATE
	/* ----------------------------------------------------------------------- */

	async create(input: CreateSnippetInput): Promise<Snippet> {
		// Input is already in FirestoreSnippet shape (minus sharedWith)
		const payload: Omit<FirestoreSnippet, 'sharedWith'> = {
			...input,
		}

		const docRef = await this.getCollection().add(payload)
		const doc = await docRef.get()
		const data = doc.data() as FirestoreSnippet

		return {
			id: docRef.id,
			...data,
			versions: data.versions || [],
		}
	}

	/* ----------------------------------------------------------------------- */
	/* READ
	/* ----------------------------------------------------------------------- */

	async getById(id: string): Promise<Snippet | null> {
		const docRef = this.getCollection().doc(id)
		const snapshot = await docRef.get()

		if (!snapshot.exists) {
			return null
		}

		const data = snapshot.data() as FirestoreSnippet

		// Soft delete check
		if (data.isDeleted) {
			return null
		}

		// Increment views (fire-and-forget, don't await)
		this.incrementViews(id).catch(() => {
			// Silently fail - views aren't critical
		})

		return {
			id: snapshot.id,
			...data,
			versions: data.versions || [],
		}
	}

	async listPublic(): Promise<Snippet[]> {
		const snapshot = await this.getCollection()
			.where('visibility', '==', 'public')
			.where('isDeleted', '==', false)
			.orderBy('updatedAt', 'desc')
			.get()

		return snapshot.docs.map((doc) => {
			const data = doc.data() as FirestoreSnippet
			return {
				id: doc.id,
				...data,
				versions: data.versions || [],
			}
		})
	}

	async listByUser(
		userId: string,
		visibility?: SnippetVisibility,
	): Promise<Snippet[]> {
		let query = this.getCollection()
			.where('ownerId', '==', userId)
			.where('isDeleted', '==', false)

		if (visibility) {
			query = query.where('visibility', '==', visibility)
		}

		const snapshot = await query.orderBy('updatedAt', 'desc').get()

		return snapshot.docs.map((doc) => {
			const data = doc.data() as FirestoreSnippet
			return {
				id: doc.id,
				...data,
				versions: data.versions || [],
			}
		})
	}

	async listByVisibility(
		visibility: SnippetVisibility,
		userId?: string,
	): Promise<Snippet[]> {
		let query = this.getCollection()
			.where('visibility', '==', visibility)
			.where('isDeleted', '==', false)

		// Private snippets require owner filter
		if (visibility === 'private') {
			if (!userId) return []
			query = query.where('ownerId', '==', userId)
		}

		// Shared snippets - TODO: implement shared list query
		if (visibility === 'shared') {
			if (!userId) return []
			// This will need array-contains query on sharedWith
			// query = query.where('sharedWith', 'array-contains', userId)
		}

		const snapshot = await query.orderBy('updatedAt', 'desc').get()

		return snapshot.docs.map((doc) => {
			const data = doc.data() as FirestoreSnippet
			return {
				id: doc.id,
				...data,
				versions: data.versions || [],
			}
		})
	}

	/* ----------------------------------------------------------------------- */
	/* UPDATE
	/* ----------------------------------------------------------------------- */

	async update(id: string, input: UpdateSnippetInput): Promise<void> {
		const docRef = this.getCollection().doc(id)

		// Check if snippet exists and is not deleted
		const snapshot = await docRef.get()
		if (!snapshot.exists) {
			throw new Error('Snippet not found')
		}

		const data = snapshot.data() as FirestoreSnippet
		if (data.isDeleted) {
			throw new Error('Cannot update deleted snippet')
		}

		// Handle version creation if code changed
		const updatePayload: any = {
			...input,
			updatedAt: Date.now(),
		}

		// If code is being updated, create a new version entry
		if (input.code && input.code !== data.code) {
			const versions = data.versions || []
			const newVersion: SnippetVersion = {
				version: versions.length + 1,
				code: data.code, // Store the OLD code as a version
				createdAt: Date.now(),
				createdBy: data.ownerId,
			}

			updatePayload.versions = [...versions, newVersion]
		}

		await docRef.update(updatePayload)
	}

	/* ----------------------------------------------------------------------- */
	/* DELETE (Soft Delete)
	/* ----------------------------------------------------------------------- */

	async delete(id: string): Promise<void> {
		const docRef = this.getCollection().doc(id)

		// Soft delete - just mark as deleted
		await docRef.update({
			isDeleted: true,
			updatedAt: Date.now(),
		})
	}

	/* ----------------------------------------------------------------------- */
	/* UTILITY OPERATIONS
	/* ----------------------------------------------------------------------- */

	async incrementViews(id: string): Promise<void> {
		const docRef = this.getCollection().doc(id)

		// Atomic increment - no need to read first
		await docRef
			.update({
				viewsCount: FieldValue.increment(1),
			})
			.catch(() => {
				// Silently fail - views aren't critical
			})
	}

	/* ----------------------------------------------------------------------- */
	/* HARD DELETE (Admin only)
	/* ----------------------------------------------------------------------- */

	/**
	 * Permanently delete a snippet from Firestore.
	 * This should only be used in tests or admin operations.
	 */
	async permanentlyDelete(id: string): Promise<void> {
		await this.getCollection().doc(id).delete()
	}

	/**
	 * Permanently delete all snippets.
	 * This should only be used in tests.
	 */
	async permanentlyDeleteAll(): Promise<void> {
		const snapshot = await this.getCollection().get()
		const batch = adminDb.batch()

		snapshot.docs.forEach((doc) => {
			batch.delete(doc.ref)
		})

		await batch.commit()
	}
}
