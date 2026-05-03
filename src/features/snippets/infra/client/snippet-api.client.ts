import type { CreateSnippetServiceInput } from '../../core/repositories/snippet.repository'
import type { Snippet } from '../../core/snippet.types'

export type { CreateSnippetServiceInput, Snippet }

export interface SnippetAPIClient {
	create(input: CreateSnippetServiceInput): Promise<Snippet>

	getById(id: string): Promise<Snippet | null>

	listPublic(): Promise<Snippet[]>

	listByUser(userId: string): Promise<Snippet[]>

	update(id: string, input: Partial<CreateSnippetServiceInput>): Promise<void>

	delete(id: string): Promise<void>

	restoreVersion(id: string, versionNumber: number): Promise<void>

	getVersionDetail(id: string, versionNumber: number): Promise<any>

	getVersionHistory(id: string): Promise<any[]>

	incrementViews(id: string): Promise<void>
}
