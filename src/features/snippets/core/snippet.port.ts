import type { IBaseRepository } from '@/shared/services/base-service'
import type {
	CreateSnippetInput,
	SnippetVisibility,
	UpdateSnippetInput,
} from './repositories/snippet.repository'
import type { Snippet } from './snippet.types'

/**
 * ============================================================================
 * SNIPPET PORT
 * ============================================================================
 *
 * Snippet management abstraction (Port).
 *
 * This interface defines what the snippet service needs from the data layer.
 * Implementations can use Firebase, PostgreSQL, MongoDB, etc.
 *
 * The port is implemented by SnippetPortAdapter which delegates to:
 * - API client (for writes) - Server Actions
 * - Repository (for reads) - Direct database access
 */

export interface SnippetPort
	extends IBaseRepository<Snippet, CreateSnippetInput, UpdateSnippetInput> {
	/* ----------------------------------------------------------------------- */
	/* READ OPERATIONS
	/* ----------------------------------------------------------------------- */

	/**
	 * List snippets by user.
	 *
	 * @param userId - The user ID to filter by
	 * @param visibility - Optional visibility filter
	 */
	listByUser(userId: string, visibility?: SnippetVisibility): Promise<Snippet[]>

	/**
	 * List all public snippets.
	 */
	listPublic(): Promise<Snippet[]>

	/**
	 * List snippets by visibility.
	 *
	 * @param visibility - The visibility level to filter by
	 * @param userId - Required for private/shared snippets
	 */
	listByVisibility(
		visibility: SnippetVisibility,
		userId?: string,
	): Promise<Snippet[]>

	/* ----------------------------------------------------------------------- */
	/* UTILITY OPERATIONS
	/* ----------------------------------------------------------------------- */

	/**
	 * Increment the view count for a snippet.
	 */
	incrementViews(id: string): Promise<void>
}
