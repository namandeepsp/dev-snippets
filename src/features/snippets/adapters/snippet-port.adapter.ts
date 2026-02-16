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

/**
 * ============================================================================
 * SNIPPET PORT ADAPTER
 * ============================================================================
 *
 * Adapts the API client and repository to the port interface.
 *
 * This is the glue between:
 * - Client components (via API client)
 * - Server components (via repository)
 * - The service layer (via port interface)
 *
 * The adapter decides which implementation to use based on context:
 * - Write operations → API client (go through server actions)
 * - Read operations → Repository (direct database access)
 */

export class SnippetPortAdapter implements SnippetPort {
	constructor(
		private readonly apiClient: SnippetAPIClient,
		private readonly repository: SnippetRepository,
	) {}

	/* ----------------------------------------------------------------------- */
	/* WRITE OPERATIONS - Use API Client (server actions)
    /* ----------------------------------------------------------------------- */

	async create(input: CreateSnippetInput): Promise<Snippet> {
		// Convert repository input to service input for client
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

	// ✅ MOVED: incrementViews is a WRITE operation
	async incrementViews(id: string): Promise<void> {
		return this.apiClient.incrementViews(id)
	}

	/* ----------------------------------------------------------------------- */
	/* READ OPERATIONS - Use Repository (direct database access)
    /* ----------------------------------------------------------------------- */

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

	/* ----------------------------------------------------------------------- */
	/* UTILITY OPERATIONS - All moved to appropriate sections above
    /* ----------------------------------------------------------------------- */
}
