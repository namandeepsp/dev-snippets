import type { IBaseRepository } from '@/shared/services/base-service'
import type {
	FirestoreSnippet,
	Snippet,
	SnippetContent,
	SnippetVisibility,
} from '../snippet.types'

export type { FirestoreSnippet, Snippet, SnippetContent, SnippetVisibility }

/* ------------------ Repository Inputs ------------------ */

/**
 * Data required to create a snippet in Firestore.
 * (Already enriched by the service layer)
 */
export type CreateSnippetInput = Omit<FirestoreSnippet, 'sharedWith'>

/**
 * Allowed updates after creation
 */
export type UpdateSnippetInput = Partial<
	Pick<
		FirestoreSnippet,
		| 'title'
		| 'description'
		| 'code'
		| 'language'
		| 'technologies'
		| 'categories'
		| 'visibility'
		| 'sharedWith'
		| 'isDeleted'
		| 'updatedAt'
		| 'versions'
	>
>

/* ------------------ Service Inputs ------------------ */

/**
 * User input for creating snippets (UI layer)
 */
export type CreateSnippetServiceInput = SnippetContent

/**
 * User input for updating snippets (UI layer)
 */
export type UpdateSnippetServiceInput = Partial<SnippetContent>

/**
 * Sort options for listing snippets
 */
export type SnippetSortBy = 'latest' | 'oldest' | 'views' | 'title'

export type SnippetListCursor = {
	sortValue: number | string
	id: string
}

export type PaginatedSnippets = {
	items: Snippet[]
	nextCursor: SnippetListCursor | null
}

/* ------------------ Repository Interface ------------------ */

export interface SnippetRepository
	extends IBaseRepository<Snippet, CreateSnippetInput, UpdateSnippetInput> {
	listByUser(userId: string): Promise<Snippet[]>
	listPublic(sortBy?: SnippetSortBy): Promise<Snippet[]>
	listPublicPaginated(
		sortBy?: SnippetSortBy,
		limit?: number,
		cursor?: SnippetListCursor | null,
	): Promise<PaginatedSnippets>
	listByVisibility(
		visibility: SnippetVisibility,
		userId?: string,
	): Promise<Snippet[]>

	/**
	 * Increment the view count for a snippet.
	 *
	 * This is an atomic operation that should be implemented
	 * efficiently at the database level.
	 */
	incrementViews(snippetId: string): Promise<void>

	/**
	 * Toggle like on a snippet.
	 * Returns true if liked, false if unliked.
	 */
	toggleLike(snippetId: string, userId: string): Promise<boolean>

	/**
	 * Check if a user has liked a snippet.
	 */
	checkLikeStatus(snippetId: string, userId: string): Promise<boolean>

	/**
	 * Get all snippet IDs that a user has liked.
	 */
	getLikedSnippetIds(userId: string): Promise<string[]>

	/**
	 * List snippets by user with optional visibility filter.
	 *
	 * @param userId - The user ID to filter by
	 * @param visibility - Optional visibility filter (public, private, shared)
	 * @returns Array of snippets matching the criteria
	 */
	listByUser(userId: string, visibility?: SnippetVisibility): Promise<Snippet[]>
}
