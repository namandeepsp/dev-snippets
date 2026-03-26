import { userService } from '@/features/user/user.container'
import type {
	PaginatedSnippets,
	SnippetListCursor,
	SnippetRepository,
	SnippetSortBy,
} from './repositories/snippet.repository'
import type { Snippet, SnippetVisibility } from './snippet.types'

/**
 * ============================================================================
 * SNIPPET READ SERVICE
 * ============================================================================
 *
 * Handles all read operations for snippets.
 */

export class SnippetReadService {
	constructor(private readonly snippetRepository: SnippetRepository) {}

	async getById(id: string): Promise<Snippet | null> {
		return this.snippetRepository.getById(id)
	}

	async listPublic(sortBy?: SnippetSortBy): Promise<Snippet[]> {
		return this.snippetRepository.listPublic(sortBy)
	}

	async listPublicPaginated(
		sortBy?: SnippetSortBy,
		limit?: number,
		cursor?: SnippetListCursor | null,
		technologies?: string[],
	): Promise<PaginatedSnippets> {
		return this.snippetRepository.listPublicPaginated(
			sortBy,
			limit,
			cursor,
			technologies as any,
		)
	}

	async listByUser(
		userId: string,
		visibility?: SnippetVisibility,
	): Promise<Snippet[]> {
		return this.snippetRepository.listByUser(userId, visibility)
	}

	async listByUserPaginated(
		userId: string,
		visibility?: SnippetVisibility,
		limit?: number,
		cursor?: SnippetListCursor | null,
	): Promise<PaginatedSnippets> {
		return this.snippetRepository.listByUserPaginated(
			userId,
			visibility,
			limit,
			cursor,
		)
	}

	async listByUsername(username: string): Promise<Snippet[]> {
		if (!username) return []

		const user = await userService.getPublicProfile(username)
		if (!user) return []

		return this.snippetRepository.listByUser(user.id, 'public')
	}

	async listProfileByUsername(
		username: string,
		viewerUserId?: string,
	): Promise<Snippet[]> {
		if (!username) return []

		const user = await userService.getPublicProfile(username)
		if (!user) return []

		if (viewerUserId && viewerUserId === user.id) {
			return this.snippetRepository.listByUser(user.id)
		}

		return this.snippetRepository.listByUser(user.id, 'public')
	}

	async listProfileByUsernamePaginated(
		username: string,
		viewerUserId?: string,
		limit?: number,
		cursor?: SnippetListCursor | null,
	): Promise<PaginatedSnippets> {
		if (!username) return { items: [], nextCursor: null }

		const user = await userService.getPublicProfile(username)
		if (!user) return { items: [], nextCursor: null }

		if (viewerUserId && viewerUserId === user.id) {
			return this.snippetRepository.listByUserPaginated(
				user.id,
				undefined,
				limit,
				cursor,
			)
		}

		return this.snippetRepository.listByUserPaginated(
			user.id,
			'public',
			limit,
			cursor,
		)
	}

	async listByVisibility(
		visibility: SnippetVisibility,
		userId?: string,
	): Promise<Snippet[]> {
		return this.snippetRepository.listByVisibility(visibility, userId)
	}
}
