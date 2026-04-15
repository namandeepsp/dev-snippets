import type {
	CreateSnippetInput,
	CreateSnippetServiceInput,
	SnippetVisibility,
	UpdateSnippetInput,
	UpdateSnippetServiceInput,
} from '../core/repositories/snippet.repository'
import type { SnippetRepository } from '../core/repositories/snippet.repository'
import type { SnippetPort } from '../core/snippet.port'
import type { Snippet } from '../core/snippet.types'
import type { SnippetAPIClient } from '../infra/client/snippet-api.client'

export class SnippetPortAdapter implements SnippetPort {
	constructor(
		private readonly apiClient: SnippetAPIClient,
		private readonly repository: SnippetRepository,
	) {}

	async create(input: CreateSnippetInput): Promise<Snippet> {
		const {
			ownerId,
			ownerName,
			likesCount,
			viewsCount,
			createdAt,
			updatedAt,
			isDeleted,
			...serviceInput
		} = input

		return this.apiClient.create(serviceInput as CreateSnippetServiceInput)
	}

	async update(id: string, input: UpdateSnippetInput): Promise<void> {
		return this.apiClient.update(id, input as UpdateSnippetServiceInput)
	}

	async delete(id: string): Promise<void> {
		return this.apiClient.delete(id)
	}

	async incrementViews(id: string): Promise<void> {
		return this.apiClient.incrementViews(id)
	}

	async getById(id: string): Promise<Snippet | null> {
		return this.repository.getById(id)
	}

	async listPublic(): Promise<Snippet[]> {
		return this.repository.listPublic()
	}

	async listByUser(
		userId: string,
		visibility?: SnippetVisibility,
	): Promise<Snippet[]> {
		return this.repository.listByUser(userId, visibility)
	}

	async listByVisibility(
		visibility: SnippetVisibility,
		userId?: string,
	): Promise<Snippet[]> {
		return this.repository.listByVisibility(visibility, userId)
	}
}
