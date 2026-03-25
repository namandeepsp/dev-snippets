import { userService } from '@/features/user/user.container'
import { logger } from '@/shared/utils/logger'
import type {
	CreateSnippetInput,
	CreateSnippetServiceInput,
	PaginatedSnippets,
	SnippetListCursor,
	SnippetRepository,
	SnippetSortBy,
	UpdateSnippetInput,
	UpdateSnippetServiceInput,
} from './repositories/snippet.repository'
import { createNextVersion } from './snippet.model'
import type { SnippetPort } from './snippet.port'
import type {
	Snippet,
	SnippetVersion,
	SnippetVisibility,
} from './snippet.types'
import { SNIPPET_TITLE_MAX_LENGTH } from './snippet.types'

/**
 * ============================================================================
 * SNIPPET SERVICE
 * ============================================================================
 *
 * Orchestrates snippet-related operations with business logic.
 *
 * Key responsibilities:
 * 1. Validate business rules
 * 2. Enrich data with ownership metadata
 * 3. Handle versioning
 * 4. Authorization checks
 *
 * This is the PUBLIC API for server components.
 */

export class SnippetService {
	constructor(
		private readonly snippetPort: SnippetPort,
		private readonly snippetRepository: SnippetRepository,
	) {}

	private validateCreateInput(input: CreateSnippetServiceInput) {
		if (!input.title.trim()) {
			throw new Error('Title is required')
		}

		if (input.title.trim().length > SNIPPET_TITLE_MAX_LENGTH) {
			throw new Error(
				`Title must be ${SNIPPET_TITLE_MAX_LENGTH} characters or fewer`,
			)
		}

		if (!input.code.trim()) {
			throw new Error('Code is required')
		}
	}

	private validateUpdateInput(input: UpdateSnippetServiceInput) {
		if (input.title === undefined) {
			return
		}

		if (!input.title.trim()) {
			throw new Error('Title is required')
		}

		if (input.title.trim().length > SNIPPET_TITLE_MAX_LENGTH) {
			throw new Error(
				`Title must be ${SNIPPET_TITLE_MAX_LENGTH} characters or fewer`,
			)
		}
	}

	/* ----------------------------------------------------------------------- */
	/* CREATE
	/* ----------------------------------------------------------------------- */

	/**
	 * Create a new snippet.
	 *
	 * Business rules:
	 * 1. User must be authenticated
	 * 2. Title and code are required
	 * 3. Creates initial version
	 */
	async createSnippet(
		input: CreateSnippetServiceInput,
		userId: string,
		userName: string,
	): Promise<Snippet> {
		this.validateCreateInput(input)
		const now = Date.now()

		const createInput: CreateSnippetInput = {
			...input,
			ownerId: userId,
			ownerName: userName,
			likesCount: 0,
			viewsCount: 0,
			createdAt: now,
			updatedAt: now,
			isDeleted: false,
			versions: [
				{
					version: 1,
					code: input.code,
					createdAt: now,
					createdBy: userId,
				},
			],
		}

		return this.snippetPort.create(createInput)
	}

	/* ----------------------------------------------------------------------- */
	/* READ
	/* ----------------------------------------------------------------------- */

	/**
	 * Get a snippet by ID.
	 * Returns null if not found or deleted.
	 */
	async getById(id: string): Promise<Snippet | null> {
		return this.snippetRepository.getById(id)
	}

	/**
	 * List all public snippets.
	 */
	async listPublic(sortBy?: SnippetSortBy): Promise<Snippet[]> {
		return this.snippetRepository.listPublic(sortBy)
	}

	/**
	 * List public snippets with cursor pagination and optional technology filter.
	 */
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

	/**
	 * List snippets by user with optional visibility filter.
	 */
	async listByUser(
		userId: string,
		visibility?: SnippetVisibility,
	): Promise<Snippet[]> {
		return this.snippetRepository.listByUser(userId, visibility)
	}

	/**
	 * List snippets by user with optional visibility filter and cursor pagination.
	 */
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

	/**
	 * List public snippets by username.
	 * Used for profile pages.
	 */
	async listByUsername(username: string): Promise<Snippet[]> {
		if (!username) return []

		const user = await userService.getPublicProfile(username)
		if (!user) return []

		return this.snippetRepository.listByUser(user.id, 'public')
	}

	/**
	 * List snippets for a profile page with viewer-aware visibility:
	 * - Owner viewing own profile: all snippets
	 * - Other users/guests: public snippets only
	 */
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

	/**
	 * Paginated profile snippets with viewer-aware visibility:
	 * - Owner viewing own profile: all snippets
	 * - Other users/guests: public snippets only
	 */
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

	/**
	 * List snippets by visibility.
	 */
	async listByVisibility(
		visibility: SnippetVisibility,
		userId?: string,
	): Promise<Snippet[]> {
		return this.snippetRepository.listByVisibility(visibility, userId)
	}

	/* ----------------------------------------------------------------------- */
	/* UPDATE
	/* ----------------------------------------------------------------------- */

	/**
	 * Update a snippet.
	 *
	 * Business rules:
	 * 1. User must be the owner
	 * 2. Creates new version if code changes
	 */
	async updateSnippet(
		snippetId: string,
		input: UpdateSnippetServiceInput,
		userId: string,
	): Promise<void> {
		this.validateUpdateInput(input)
		const snippet = await this.snippetRepository.getById(snippetId)

		if (!snippet) {
			throw new Error('Snippet not found')
		}

		if (snippet.ownerId !== userId) {
			throw new Error('Unauthorized')
		}

		const updateInput: UpdateSnippetInput = {
			...input,
			updatedAt: Date.now(),
		}

		// If code is being updated, create a new version
		if (input.code && input.code !== snippet.code) {
			const newVersion = createNextVersion(snippet, input.code, userId)
			updateInput.versions = [...snippet.versions, newVersion]
		}

		await this.snippetRepository.update(snippetId, updateInput)
	}

	/* ----------------------------------------------------------------------- */
	/* DELETE
	/* ----------------------------------------------------------------------- */

	/**
	 * Delete a snippet (soft delete).
	 *
	 * Business rules:
	 * 1. User must be the owner
	 */
	async deleteSnippet(snippetId: string, userId: string): Promise<void> {
		const snippet = await this.snippetRepository.getById(snippetId)

		if (!snippet) {
			throw new Error('Snippet not found')
		}

		if (snippet.ownerId !== userId) {
			throw new Error('Unauthorized')
		}

		await this.snippetRepository.delete(snippetId)
	}

	/**
	 * Permanently clean up all snippet-related data for a user.
	 * Used during account deletion.
	 */
	async cleanupUserData(userId: string): Promise<void> {
		await this.snippetRepository.cleanupUserData(userId)
	}

	/* ----------------------------------------------------------------------- */
	/* VERSION CONTROL
	/* ----------------------------------------------------------------------- */

	/**
	 * Restore a previous version of a snippet.
	 *
	 * Business rules:
	 * 1. User must be the owner
	 * 2. Creates a new version with the restored code
	 */
	async restoreVersion(
		snippetId: string,
		versionNumber: number,
		userId: string,
	): Promise<void> {
		const snippet = await this.snippetRepository.getById(snippetId)

		if (!snippet) {
			throw new Error('Snippet not found')
		}

		if (snippet.ownerId !== userId) {
			throw new Error('Unauthorized')
		}

		const version = snippet.versions.find((v) => v.version === versionNumber)

		if (!version) {
			throw new Error('Version not found')
		}

		// Create new version with current code before restoring
		const newVersion = createNextVersion(snippet, snippet.code, userId)

		await this.snippetRepository.update(snippetId, {
			code: version.code,
			versions: [...snippet.versions, newVersion],
			updatedAt: Date.now(),
		})
	}

	/**
	 * Get version history for a snippet.
	 */
	async getVersionHistory(
		snippetId: string,
		userId?: string,
	): Promise<SnippetVersion[]> {
		const snippet = await this.snippetRepository.getById(snippetId)

		if (!snippet) {
			throw new Error('Snippet not found')
		}

		// Private snippets: only owner can view history
		if (snippet.visibility === 'private' && snippet.ownerId !== userId) {
			throw new Error('Unauthorized')
		}

		return snippet.versions
	}

	/* ----------------------------------------------------------------------- */
	/* SHARING
	/* ----------------------------------------------------------------------- */

	/**
	 * Share a snippet with specific users.
	 *
	 * Business rules:
	 * 1. User must be the owner
	 * 2. Snippet visibility must be 'shared'
	 */
	async shareWithUsers(
		snippetId: string,
		userIds: string[],
		requestingUserId: string,
	): Promise<void> {
		const snippet = await this.snippetRepository.getById(snippetId)

		if (!snippet) {
			throw new Error('Snippet not found')
		}

		if (snippet.ownerId !== requestingUserId) {
			throw new Error('Unauthorized')
		}

		const sharedWith = [...new Set([...(snippet.sharedWith || []), ...userIds])]

		await this.snippetRepository.update(snippetId, {
			visibility: 'shared',
			sharedWith,
			updatedAt: Date.now(),
		})
	}

	/**
	 * Remove sharing from specific users.
	 */
	async unshareWithUsers(
		snippetId: string,
		userIds: string[],
		requestingUserId: string,
	): Promise<void> {
		const snippet = await this.snippetRepository.getById(snippetId)

		if (!snippet) {
			throw new Error('Snippet not found')
		}

		if (snippet.ownerId !== requestingUserId) {
			throw new Error('Unauthorized')
		}

		const sharedWith = (snippet.sharedWith || []).filter(
			(id) => !userIds.includes(id),
		)

		await this.snippetRepository.update(snippetId, {
			sharedWith,
			updatedAt: Date.now(),
		})
	}

	/* ----------------------------------------------------------------------- */
	/* UTILITIES
	/* ----------------------------------------------------------------------- */

	/**
	 * Increment view count.
	 * Fire-and-forget, doesn't throw.
	 */
	async incrementViews(snippetId: string): Promise<void> {
		try {
			await this.snippetRepository.incrementViews(snippetId)
		} catch (error) {
			logger.error(`Failed to increment views for snippet ${snippetId}`, {
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	}

	/**
	 * Toggle like on a snippet.
	 * Returns true if liked, false if unliked.
	 */
	async toggleLike(snippetId: string, userId: string): Promise<boolean> {
		return this.snippetRepository.toggleLike(snippetId, userId)
	}

	/**
	 * Check if a user has liked a snippet.
	 */
	async checkLikeStatus(snippetId: string, userId: string): Promise<boolean> {
		return this.snippetRepository.checkLikeStatus(snippetId, userId)
	}

	/**
	 * Get all snippet IDs that a user has liked.
	 */
	async getLikedSnippetIds(userId: string): Promise<string[]> {
		return this.snippetRepository.getLikedSnippetIds(userId)
	}
}
