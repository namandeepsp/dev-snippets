import { logger } from '@/shared/utils/logger'
import type {
	CreateSnippetInput,
	CreateSnippetServiceInput,
	SnippetRepository,
} from './repositories/snippet.repository'
import type { SnippetPort } from './snippet.port'
import { SnippetReadService } from './snippet.read-service'
import { SnippetSharingService } from './snippet.sharing-service'
import type { Snippet } from './snippet.types'
import { SnippetValidator } from './snippet.validator'
import { SnippetVersionService } from './snippet.version-service'

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
	private readService: SnippetReadService
	private versionService: SnippetVersionService
	private sharingService: SnippetSharingService

	constructor(
		private readonly snippetPort: SnippetPort,
		private readonly snippetRepository: SnippetRepository,
	) {
		this.readService = new SnippetReadService(snippetRepository)
		this.versionService = new SnippetVersionService(snippetRepository)
		this.sharingService = new SnippetSharingService(snippetRepository)
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
		SnippetValidator.validateCreateInput(input)
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
	/* READ - Delegated to SnippetReadService
	/* ----------------------------------------------------------------------- */

	getById(id: string) {
		return this.readService.getById(id)
	}

	listPublic(sortBy?: any) {
		return this.readService.listPublic(sortBy)
	}

	listPublicPaginated(
		sortBy?: any,
		limit?: number,
		cursor?: any,
		technologies?: string[],
	) {
		return this.readService.listPublicPaginated(
			sortBy,
			limit,
			cursor,
			technologies,
		)
	}

	listByUser(userId: string, visibility?: any) {
		return this.readService.listByUser(userId, visibility)
	}

	listByUserPaginated(
		userId: string,
		visibility?: any,
		limit?: number,
		cursor?: any,
	) {
		return this.readService.listByUserPaginated(
			userId,
			visibility,
			limit,
			cursor,
		)
	}

	listByUsername(username: string) {
		return this.readService.listByUsername(username)
	}

	listProfileByUsername(username: string, viewerUserId?: string) {
		return this.readService.listProfileByUsername(username, viewerUserId)
	}

	listProfileByUsernamePaginated(
		username: string,
		viewerUserId?: string,
		limit?: number,
		cursor?: any,
	) {
		return this.readService.listProfileByUsernamePaginated(
			username,
			viewerUserId,
			limit,
			cursor,
		)
	}

	listByVisibility(visibility: any, userId?: string) {
		return this.readService.listByVisibility(visibility, userId)
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
		input: any,
		userId: string,
	): Promise<void> {
		SnippetValidator.validateUpdateInput(input)
		const snippet = await this.snippetRepository.getById(snippetId)

		if (!snippet) {
			throw new Error('Snippet not found')
		}

		if (snippet.ownerId !== userId) {
			throw new Error('Unauthorized')
		}

		const updateInput: any = {
			...input,
			updatedAt: Date.now(),
		}

		// If code is being updated, create a new version
		if (input.code && input.code !== snippet.code) {
			const { createNextVersion } = await import('./snippet.model')
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
	/* VERSION CONTROL - Delegated to SnippetVersionService
	/* ----------------------------------------------------------------------- */

	restoreVersion(snippetId: string, versionNumber: number, userId: string) {
		return this.versionService.restoreVersion(snippetId, versionNumber, userId)
	}

	getVersionHistory(snippetId: string, userId?: string) {
		return this.versionService.getVersionHistory(snippetId, userId)
	}

	/* ----------------------------------------------------------------------- */
	/* SHARING - Delegated to SnippetSharingService
	/* ----------------------------------------------------------------------- */

	shareWithUsers(
		snippetId: string,
		userIds: string[],
		requestingUserId: string,
	) {
		return this.sharingService.shareWithUsers(
			snippetId,
			userIds,
			requestingUserId,
		)
	}

	unshareWithUsers(
		snippetId: string,
		userIds: string[],
		requestingUserId: string,
	) {
		return this.sharingService.unshareWithUsers(
			snippetId,
			userIds,
			requestingUserId,
		)
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
