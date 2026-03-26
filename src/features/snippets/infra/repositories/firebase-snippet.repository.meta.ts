import { adminDb } from '@/services/firebase/firebase.server'
import { FieldValue } from 'firebase-admin/firestore'
import {
	deleteDocsInBatches,
	updateDocsInBatches,
} from './firebase-snippet.batch'

export interface FirebaseSnippetRepositoryContext {
	getCollection(): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
}

export async function incrementViews(
	repo: FirebaseSnippetRepositoryContext,
	id: string,
): Promise<void> {
	const docRef = repo.getCollection().doc(id)
	await docRef.update({ viewsCount: FieldValue.increment(1) }).catch(() => {})
}

export async function toggleLike(
	repo: FirebaseSnippetRepositoryContext,
	snippetId: string,
	userId: string,
): Promise<boolean> {
	const likeRef = adminDb
		.collection('snippet_likes')
		.doc(`${snippetId}_${userId}`)
	const snippetRef = repo.getCollection().doc(snippetId)
	const likeDoc = await likeRef.get()

	if (likeDoc.exists) {
		await Promise.all([
			likeRef.delete(),
			snippetRef.update({ likesCount: FieldValue.increment(-1) }),
		])
		return false
	}

	await Promise.all([
		likeRef.set({ snippetId, userId, createdAt: Date.now() }),
		snippetRef.update({ likesCount: FieldValue.increment(1) }),
	])
	return true
}

export async function checkLikeStatus(
	snippetId: string,
	userId: string,
): Promise<boolean> {
	const likeRef = adminDb
		.collection('snippet_likes')
		.doc(`${snippetId}_${userId}`)
	const likeDoc = await likeRef.get()
	return likeDoc.exists
}

export async function getLikedSnippetIds(userId: string): Promise<string[]> {
	const snapshot = await adminDb
		.collection('snippet_likes')
		.where('userId', '==', userId)
		.get()
	return snapshot.docs.map((doc) => doc.data().snippetId)
}

export async function cleanupUserData(userId: string): Promise<void> {
	const ownedSnippetsSnapshot = await adminDb
		.collection('snippets')
		.where('ownerId', '==', userId)
		.get()
	const ownedSnippetIds = ownedSnippetsSnapshot.docs.map((doc) => doc.id)
	await deleteDocsInBatches(ownedSnippetsSnapshot.docs)

	const likesByUserSnapshot = await adminDb
		.collection('snippet_likes')
		.where('userId', '==', userId)
		.get()
	await deleteDocsInBatches(likesByUserSnapshot.docs)

	for (const snippetId of ownedSnippetIds) {
		const likesForSnippetSnapshot = await adminDb
			.collection('snippet_likes')
			.where('snippetId', '==', snippetId)
			.get()
		await deleteDocsInBatches(likesForSnippetSnapshot.docs)
	}

	const sharedWithSnapshot = await adminDb
		.collection('snippets')
		.where('sharedWith', 'array-contains', userId)
		.get()
	await updateDocsInBatches(sharedWithSnapshot.docs, () => ({
		sharedWith: FieldValue.arrayRemove(userId),
		updatedAt: Date.now(),
	}))
}

export async function permanentlyDelete(id: string): Promise<void> {
	await adminDb.collection('snippets').doc(id).delete()
}

export async function permanentlyDeleteAll(): Promise<void> {
	const snapshot = await adminDb.collection('snippets').get()
	const batch = adminDb.batch()

	snapshot.docs.forEach((doc) => batch.delete(doc.ref))
	await batch.commit()
}
