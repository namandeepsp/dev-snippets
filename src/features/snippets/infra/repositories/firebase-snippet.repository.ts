import { adminDb } from '@/services/firebase/firebase.server'
import type {
	CreateSnippetInput,
	PaginatedSnippets,
	SnippetListCursor,
	SnippetRepository,
	SnippetSortBy,
	UpdateSnippetInput,
} from '../../core/repositories/snippet.repository'
import type {
	Snippet,
	SnippetTechnology,
	SnippetVisibility,
} from '../../core/snippet.types'
import {
	deleteDocsInBatches,
	updateDocsInBatches,
} from './firebase-snippet.batch'
import {
	checkLikeStatus,
	cleanupUserData,
	getLikedSnippetIds,
	incrementViews,
	permanentlyDelete,
	permanentlyDeleteAll,
	toggleLike,
} from './firebase-snippet.repository.meta'
import {
	getSnippetById,
	listByUser,
	listByVisibility,
	listPublicSnippets,
} from './firebase-snippet.repository.read'
import {
	listPublicSnippetsPaginated,
	listByUserPaginated,
} from './firebase-snippet.repository.read-paginated'
import {
	createSnippet,
	softDeleteSnippet,
	updateSnippet,
} from './firebase-snippet.repository.write'

const COLLECTION_NAME = 'snippets'

/**
 * Firebase/Firestore implementation of the SnippetRepository port.
 */
export class FirebaseSnippetRepository implements SnippetRepository {
	getCollection() {
		return adminDb.collection(COLLECTION_NAME)
	}

	private deleteDocsInBatches(
		docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[],
	): Promise<void> {
		return deleteDocsInBatches(docs)
	}

	private updateDocsInBatches(
		docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[],
		updateFactory: () => FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>,
	): Promise<void> {
		return updateDocsInBatches(docs, updateFactory)
	}

	async create(input: CreateSnippetInput): Promise<Snippet> {
		return createSnippet(this, input)
	}

	async getById(id: string): Promise<Snippet | null> {
		return getSnippetById(this, id)
	}

	async listPublic(sortBy: SnippetSortBy = 'latest'): Promise<Snippet[]> {
		return listPublicSnippets(this, sortBy)
	}

	async listPublicPaginated(
		sortBy: SnippetSortBy = 'latest',
		limit = 5,
		cursor: SnippetListCursor | null = null,
		technologies?: SnippetTechnology[],
	): Promise<PaginatedSnippets> {
		return listPublicSnippetsPaginated(
			this,
			sortBy,
			limit,
			cursor,
			technologies,
		)
	}

	async listByUser(
		userId: string,
		visibility?: SnippetVisibility,
	): Promise<Snippet[]> {
		return listByUser(this, userId, visibility)
	}

	async listByUserPaginated(
		userId: string,
		visibility?: SnippetVisibility,
		limit = 5,
		cursor: SnippetListCursor | null = null,
	): Promise<PaginatedSnippets> {
		return listByUserPaginated(this, userId, visibility, limit, cursor)
	}

	async listByVisibility(
		visibility: SnippetVisibility,
		userId?: string,
	): Promise<Snippet[]> {
		return listByVisibility(this, visibility, userId)
	}

	async update(id: string, input: UpdateSnippetInput): Promise<void> {
		return updateSnippet(this, id, input)
	}

	async delete(id: string): Promise<void> {
		return softDeleteSnippet(this, id)
	}

	async incrementViews(id: string): Promise<void> {
		return incrementViews(this, id)
	}

	async toggleLike(snippetId: string, userId: string): Promise<boolean> {
		return toggleLike(this, snippetId, userId)
	}

	async checkLikeStatus(snippetId: string, userId: string): Promise<boolean> {
		return checkLikeStatus(snippetId, userId)
	}

	async getLikedSnippetIds(userId: string): Promise<string[]> {
		return getLikedSnippetIds(userId)
	}

	async cleanupUserData(userId: string): Promise<void> {
		return cleanupUserData(userId)
	}

	async permanentlyDelete(id: string): Promise<void> {
		return permanentlyDelete(id)
	}

	async permanentlyDeleteAll(): Promise<void> {
		return permanentlyDeleteAll()
	}
}
