import type { SnippetSortBy } from '../../core/repositories/snippet.repository'
import type {
	FirestoreSnippet,
	Snippet,
	SnippetVisibility,
} from '../../core/snippet.types'
import { mapDocToSnippet } from './firebase-snippet.mapper'

export interface FirebaseSnippetRepositoryContext {
	getCollection(): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
}

export async function getSnippetById(
	repo: FirebaseSnippetRepositoryContext,
	id: string,
): Promise<Snippet | null> {
	const docRef = repo.getCollection().doc(id)
	const snapshot = await docRef.get()

	if (!snapshot.exists) return null

	const data = snapshot.data() as FirestoreSnippet
	if (data.isDeleted === true) return null

	return {
		id: snapshot.id,
		...data,
		versions: data.versions || [],
	}
}

export async function listPublicSnippets(
	repo: FirebaseSnippetRepositoryContext,
	sortBy: SnippetSortBy = 'latest',
): Promise<Snippet[]> {
	let query = repo
		.getCollection()
		.where('visibility', '==', 'public')
		.where('isDeleted', '==', false)

	switch (sortBy) {
		case 'latest':
			query = query.orderBy('createdAt', 'desc')
			break
		case 'oldest':
			query = query.orderBy('createdAt', 'asc')
			break
		case 'views':
			query = query.orderBy('viewsCount', 'desc')
			break
		case 'title':
			query = query.orderBy('title', 'asc')
			break
	}

	const snapshot = await query.get()
	return snapshot.docs.map(mapDocToSnippet)
}

export async function listByUser(
	repo: FirebaseSnippetRepositoryContext,
	userId: string,
	visibility?: SnippetVisibility,
): Promise<Snippet[]> {
	let query = repo
		.getCollection()
		.where('ownerId', '==', userId)
		.where('isDeleted', '==', false)

	if (visibility) query = query.where('visibility', '==', visibility)

	const snapshot = await query.orderBy('updatedAt', 'desc').get()
	return snapshot.docs.map(mapDocToSnippet)
}

export async function listByVisibility(
	repo: FirebaseSnippetRepositoryContext,
	visibility: SnippetVisibility,
	userId?: string,
): Promise<Snippet[]> {
	let query = repo
		.getCollection()
		.where('visibility', '==', visibility)
		.where('isDeleted', '==', false)

	if (visibility === 'private') {
		if (!userId) return []
		query = query.where('ownerId', '==', userId)
	}

	if (visibility === 'shared') {
		if (!userId) return []
	}

	const snapshot = await query.orderBy('updatedAt', 'desc').get()
	return snapshot.docs.map(mapDocToSnippet)
}

export async function searchSnippets(
	repo: FirebaseSnippetRepositoryContext,
	query: string,
): Promise<Snippet[]> {
	const lowerQuery = query.toLowerCase()
	const snapshot = await repo
		.getCollection()
		.where('visibility', '==', 'public')
		.where('isDeleted', '==', false)
		.get()

	return snapshot.docs
		.map(mapDocToSnippet)
		.filter(
			(snippet) =>
				snippet.title.toLowerCase().includes(lowerQuery) ||
				(snippet.description?.toLowerCase().includes(lowerQuery) ?? false) ||
				snippet.files.some((f) => f.code.toLowerCase().includes(lowerQuery)),
		)
}

export async function filterByTechnology(
	repo: FirebaseSnippetRepositoryContext,
	technology: string,
): Promise<Snippet[]> {
	const snapshot = await repo
		.getCollection()
		.where('visibility', '==', 'public')
		.where('isDeleted', '==', false)
		.where('technologies', 'array-contains', technology)
		.get()

	return snapshot.docs.map(mapDocToSnippet)
}

export async function filterByCategory(
	repo: FirebaseSnippetRepositoryContext,
	category: string,
): Promise<Snippet[]> {
	const snapshot = await repo
		.getCollection()
		.where('visibility', '==', 'public')
		.where('isDeleted', '==', false)
		.where('categories', 'array-contains', category)
		.get()

	return snapshot.docs.map(mapDocToSnippet)
}
