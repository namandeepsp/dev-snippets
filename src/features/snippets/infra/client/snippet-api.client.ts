import type { CreateSnippetServiceInput } from '../../core/repositories/snippet.repository'
import type { Snippet } from '../../core/snippet.types'

export type { CreateSnippetServiceInput, Snippet }

/**
 * API Client interface for snippet operations
 * Abstracts the communication layer (server actions, REST API, GraphQL, etc.)
 */
export interface SnippetAPIClient {
	/**
	 * Create a new snippet
	 */
	create(input: CreateSnippetServiceInput): Promise<Snippet>

	/**
	 * Get snippet by ID
	 */
	getById(id: string): Promise<Snippet | null>

	/**
	 * List all public snippets
	 */
	listPublic(): Promise<Snippet[]>

	/**
	 * List snippets by user
	 */
	listByUser(userId: string): Promise<Snippet[]>

	/**
	 * Update snippet
	 */
	update(id: string, input: Partial<CreateSnippetServiceInput>): Promise<void>

	/**
	 * Delete snippet
	 */
	delete(id: string): Promise<void>

	/**
	 * Increment view count for a snippet
	 * Note: This is a write operation but doesn't require authentication
	 */
	incrementViews(id: string): Promise<void>
}
