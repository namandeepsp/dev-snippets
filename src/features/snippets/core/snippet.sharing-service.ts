import type { SnippetRepository } from './repositories/snippet.repository'

/**
 * ============================================================================
 * SNIPPET SHARING SERVICE
 * ============================================================================
 *
 * Handles snippet sharing and access control operations.
 */

export class SnippetSharingService {
	constructor(private readonly snippetRepository: SnippetRepository) {}

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
}
