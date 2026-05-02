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
					files: input.files,
					createdAt: now,
					createdBy: userId,
				},
			],
		}

		return this.snippetPort.create(createInput)
	}

	getById(id: string) {
		return this.readService.getById(id)
	}

	getByIdWithoutVersions(id: string) {
		return this.readService.getByIdWithoutVersions(id)
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

		if (
			input.files &&
			JSON.stringify(input.files) !== JSON.stringify(snippet.files)
		) {
			const { createNextVersion } = await import('./snippet.model')
			const newVersion = createNextVersion(snippet, input.files, userId)
			updateInput.versions = [...snippet.versions, newVersion]
		}

		await this.snippetRepository.update(snippetId, updateInput)
	}

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

	async cleanupUserData(userId: string): Promise<void> {
		await this.snippetRepository.cleanupUserData(userId)
	}

	restoreVersion(snippetId: string, versionNumber: number, userId: string) {
		return this.versionService.restoreVersion(snippetId, versionNumber, userId)
	}

	getVersionHistory(snippetId: string, userId?: string) {
		return this.versionService.getVersionHistory(snippetId, userId)
	}

	getVersionDetail(snippetId: string, versionNumber: number, userId?: string) {
		return this.versionService.getVersionDetail(
			snippetId,
			versionNumber,
			userId,
		)
	}

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

	async incrementViews(snippetId: string): Promise<void> {
		try {
			await this.snippetRepository.incrementViews(snippetId)
		} catch (error) {
			logger.error(`Failed to increment views for snippet ${snippetId}`, {
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}
	}

	async toggleLike(snippetId: string, userId: string): Promise<boolean> {
		return this.snippetRepository.toggleLike(snippetId, userId)
	}

	async checkLikeStatus(snippetId: string, userId: string): Promise<boolean> {
		return this.snippetRepository.checkLikeStatus(snippetId, userId)
	}

	async getLikedSnippetIds(userId: string): Promise<string[]> {
		return this.snippetRepository.getLikedSnippetIds(userId)
	}

	async search(query: string) {
		return this.readService.search(query)
	}

	async filterByTechnology(technology: string) {
		return this.readService.filterByTechnology(technology)
	}

	async filterByCategory(category: string) {
		return this.readService.filterByCategory(category)
	}

	async likeSnippet(snippetId: string, userId: string): Promise<void> {
		const isLiked = await this.snippetRepository.checkLikeStatus(
			snippetId,
			userId,
		)
		if (!isLiked) {
			await this.snippetRepository.toggleLike(snippetId, userId)
		}
	}

	async dislikeSnippet(snippetId: string, userId: string): Promise<void> {
		const isLiked = await this.snippetRepository.checkLikeStatus(
			snippetId,
			userId,
		)
		if (isLiked) {
			await this.snippetRepository.toggleLike(snippetId, userId)
		}
	}
}
