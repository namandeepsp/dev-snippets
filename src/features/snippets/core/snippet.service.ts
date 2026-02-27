import { userService } from '@/features/user/user.container'
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
	 * List public snippets with cursor pagination.
	 */
	async listPublicPaginated(
		sortBy?: SnippetSortBy,
		limit?: number,
		cursor?: SnippetListCursor | null,
	): Promise<PaginatedSnippets> {
		return this.snippetRepository.listPublicPaginated(sortBy, limit, cursor)
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
			console.error(
				`Failed to increment views for snippet ${snippetId}:`,
				error,
			)
		}
	}

	/**
	 * Toggle like on a snippet.
	 * TODO: Implement likes feature
	 */
	async toggleLike(_snippetId: string, _userId: string): Promise<boolean> {
		throw new Error('Not implemented')
	}
}
