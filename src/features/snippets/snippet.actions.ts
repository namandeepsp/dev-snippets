'use server'

import { getCurrentServerUser } from '@/features/auth/auth.server.container'
import type { ApiResponse } from '@/features/user/infra/client/user-api.client'
import { userService } from '@/features/user/user.container'
import { logger } from '@/shared/utils/logger'
import type {
	CreateSnippetServiceInput,
	SnippetSortBy,
	UpdateSnippetServiceInput,
} from './core/repositories/snippet.repository'
import type { Snippet, SnippetTechnology } from './core/snippet.types'
import { requireAuth } from './snippet.auth-helpers'
import {
	filterByQuery,
	filterByTechnology,
	sortSnippets,
} from './snippet.search-utils'
import { snippetService } from './snippet.server.container'

type SnippetSearchScope = 'public' | 'mine' | 'all-visible'

type SearchSnippetsInput = {
	query?: string
	technology?: SnippetTechnology | 'all'
	sortBy?: SnippetSortBy
	scope?: SnippetSearchScope
	limit?: number
}

export async function createSnippetAction(
	input: CreateSnippetServiceInput,
): Promise<ApiResponse<Snippet>> {
	try {
		const user = await requireAuth()

		const snippet = await snippetService.createSnippet(
			input,
			user.id,
			user.name,
		)

		return {
			success: true,
			data: snippet,
		}
	} catch (error) {
		logger.error('Failed to create snippet', error)

		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to create snippet',
		}
	}
}

export async function updateSnippetAction(
	snippetId: string,
	input: UpdateSnippetServiceInput,
): Promise<ApiResponse> {
	try {
		const user = await requireAuth()
		await snippetService.updateSnippet(snippetId, input, user.id)

		return { success: true }
	} catch (error) {
		logger.error('Failed to update snippet', error)

		if (error instanceof Error) {
			if (error.message === 'Unauthorized') {
				return {
					success: false,
					error: 'You can only edit your own snippets',
				}
			}
			return {
				success: false,
				error: error.message,
			}
		}

		return {
			success: false,
			error: 'Failed to update snippet',
		}
	}
}

export async function deleteSnippetAction(
	snippetId: string,
): Promise<ApiResponse> {
	try {
		const user = await requireAuth()
		await snippetService.deleteSnippet(snippetId, user.id)

		return { success: true }
	} catch (error) {
		logger.error('Failed to delete snippet', error)

		if (error instanceof Error) {
			if (error.message === 'Unauthorized') {
				return {
					success: false,
					error: 'You can only delete your own snippets',
				}
			}
			return {
				success: false,
				error: error.message,
			}
		}

		return {
			success: false,
			error: 'Failed to delete snippet',
		}
	}
}

export async function incrementViewsAction(
	snippetId: string,
): Promise<ApiResponse> {
	try {
		await snippetService.incrementViews(snippetId)
		return { success: true }
	} catch (error) {
		logger.error('Failed to increment views', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to record view',
		}
	}
}

export async function toggleLikeAction(
	snippetId: string,
): Promise<ApiResponse<{ liked: boolean }>> {
	try {
		const user = await requireAuth()
		const liked = await snippetService.toggleLike(snippetId, user.id)
		return { success: true, data: { liked } }
	} catch (error) {
		logger.error('Failed to toggle like', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to toggle like',
		}
	}
}

export async function restoreSnippetVersionAction(
	snippetId: string,
	versionNumber: number,
): Promise<ApiResponse> {
	try {
		const user = await requireAuth()
		await snippetService.restoreVersion(snippetId, versionNumber, user.id)

		return { success: true }
	} catch (error) {
		logger.error('Failed to restore snippet version', error)

		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to restore version',
		}
	}
}

export async function getVersionDetailAction(
	snippetId: string,
	versionNumber: number,
): Promise<ApiResponse<any>> {
	try {
		const user = await getCurrentServerUser()
		const versionDetail = await snippetService.getVersionDetail(
			snippetId,
			versionNumber,
			user?.id,
		)

		return { success: true, data: versionDetail }
	} catch (error) {
		logger.error('Failed to get version detail', error)

		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to get version',
		}
	}
}

export async function getVersionHistoryAction(
	snippetId: string,
): Promise<ApiResponse<any[]>> {
	try {
		const user = await getCurrentServerUser()
		const versionHistory = await snippetService.getVersionHistory(
			snippetId,
			user?.id,
		)

		return { success: true, data: versionHistory }
	} catch (error) {
		logger.error('Failed to get version history', error)

		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to get version history',
		}
	}
}

export async function shareSnippetAction(
	snippetId: string,
	userIds: string[],
): Promise<ApiResponse> {
	try {
		const user = await requireAuth()
		await snippetService.shareWithUsers(snippetId, userIds, user.id)

		return { success: true }
	} catch (error) {
		logger.error('Failed to share snippet', error)

		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to share snippet',
		}
	}
}

export async function searchSnippetsAction({
	query = '',
	technology = 'all',
	sortBy = 'latest',
	scope = 'public',
	limit = 8,
}: SearchSnippetsInput = {}): Promise<
	ApiResponse<
		Array<
			Snippet & {
				author: {
					id: string
					username: string
					name: string
					avatarUrl: string | null
				}
			}
		>
	>
> {
	try {
		const maxResults = Math.max(1, Math.min(limit, 20))

		let currentUserId: string | null = null
		try {
			const user = await getCurrentServerUser()
			currentUserId = user?.id || null
		} catch {
			currentUserId = null
		}

		let source: Snippet[] = []
		if (scope === 'mine') {
			if (!currentUserId) {
				return { success: true, data: [] }
			}
			source = await snippetService.listByUser(currentUserId)
		} else if (scope === 'all-visible' && currentUserId) {
			const [publicSnippets, ownSnippets] = await Promise.all([
				snippetService.listPublic(sortBy),
				snippetService.listByUser(currentUserId),
			])
			const byId = new Map<string, Snippet>()
			for (const snippet of [...publicSnippets, ...ownSnippets]) {
				byId.set(snippet.id, snippet)
			}
			source = [...byId.values()]
		} else {
			source = await snippetService.listPublic(sortBy)
		}

		let filtered = filterByTechnology(source, technology)
		filtered = filterByQuery(filtered, query)

		const sorted = sortSnippets(filtered, sortBy).slice(0, maxResults)
		const authorIds = [...new Set(sorted.map((snippet) => snippet.ownerId))]
		const authors = await userService.getUsersByIds(authorIds)

		return {
			success: true,
			data: sorted.map((snippet) => ({
				...snippet,
				author: authors[snippet.ownerId] || {
					id: snippet.ownerId,
					username: 'unknown',
					name: snippet.ownerName,
					avatarUrl: null,
				},
			})),
		}
	} catch (error) {
		logger.error('Failed to search snippets', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to search snippets',
		}
	}
}
