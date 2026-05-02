import type { IBaseRepository } from '@/shared/services/base-service'
import type {
	FirestoreSnippet,
	Snippet,
	SnippetContent,
	SnippetTechnology,
	SnippetVisibility,
} from '../snippet.types'

export type { FirestoreSnippet, Snippet, SnippetContent, SnippetVisibility }

export type CreateSnippetInput = Omit<FirestoreSnippet, 'sharedWith'>

export type UpdateSnippetInput = Partial<
	Pick<
		FirestoreSnippet,
		| 'title'
		| 'description'
		| 'files'
		| 'primaryLanguage'
		| 'technologies'
		| 'categories'
		| 'visibility'
		| 'sharedWith'
		| 'isDeleted'
		| 'updatedAt'
		| 'versions'
	>
>

export type CreateSnippetServiceInput = SnippetContent

export type UpdateSnippetServiceInput = Partial<SnippetContent>

export type SnippetSortBy = 'latest' | 'oldest' | 'views' | 'title'

export type SnippetListCursor = {
	sortValue: number | string
	id: string
}

export type PaginatedSnippets = {
	items: Snippet[]
	nextCursor: SnippetListCursor | null
}

export interface SnippetRepository
	extends IBaseRepository<Snippet, CreateSnippetInput, UpdateSnippetInput> {
	listByUser(userId: string): Promise<Snippet[]>
	listPublic(sortBy?: SnippetSortBy): Promise<Snippet[]>
	listPublicPaginated(
		sortBy?: SnippetSortBy,
		limit?: number,
		cursor?: SnippetListCursor | null,
		technologies?: SnippetTechnology[],
	): Promise<PaginatedSnippets>
	listByUserPaginated(
		userId: string,
		visibility?: SnippetVisibility,
		limit?: number,
		cursor?: SnippetListCursor | null,
	): Promise<PaginatedSnippets>
	listByVisibility(
		visibility: SnippetVisibility,
		userId?: string,
	): Promise<Snippet[]>

	incrementViews(snippetId: string): Promise<void>

	toggleLike(snippetId: string, userId: string): Promise<boolean>

	checkLikeStatus(snippetId: string, userId: string): Promise<boolean>

	getLikedSnippetIds(userId: string): Promise<string[]>

	cleanupUserData(userId: string): Promise<void>

	listByUser(userId: string, visibility?: SnippetVisibility): Promise<Snippet[]>

	search(query: string): Promise<Snippet[]>

	filterByTechnology(technology: string): Promise<Snippet[]>

	filterByCategory(category: string): Promise<Snippet[]>
}
