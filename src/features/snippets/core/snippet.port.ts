import type { IBaseRepository } from '@/shared/services/base-service'
import type {
	CreateSnippetInput,
	SnippetVisibility,
	UpdateSnippetInput,
} from './repositories/snippet.repository'
import type { Snippet } from './snippet.types'

export interface SnippetPort
	extends IBaseRepository<Snippet, CreateSnippetInput, UpdateSnippetInput> {
	listByUser(userId: string, visibility?: SnippetVisibility): Promise<Snippet[]>

	listPublic(): Promise<Snippet[]>

	listByVisibility(
		visibility: SnippetVisibility,
		userId?: string,
	): Promise<Snippet[]>

	incrementViews(id: string): Promise<void>
}
