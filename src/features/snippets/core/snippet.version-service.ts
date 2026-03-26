import { logger } from '@/shared/utils/logger'
import type { SnippetRepository } from './repositories/snippet.repository'
import { createNextVersion } from './snippet.model'
import type { SnippetVersion } from './snippet.types'

/**
 * ============================================================================
 * SNIPPET VERSION SERVICE
 * ============================================================================
 *
 * Handles version control and history operations for snippets.
 */

export class SnippetVersionService {
	constructor(private readonly snippetRepository: SnippetRepository) {}

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
}
