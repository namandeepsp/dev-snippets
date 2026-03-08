'use server'

import { userService } from '@/features/user/user.container'
import { getServerFirebaseAuth } from '@/services/firebase/firebase.server'
import { logger } from '@/shared/utils/logger'
import { cookies } from 'next/headers'
import { snippetService } from './snippet.server.container'

import { getCurrentServerUser } from '@/features/auth/auth.server.container'
import { EDITOR_LANGUAGES } from '@/features/editor/editor.config'
import type { ApiResponse } from '@/features/user/infra/client/user-api.client'
import type {
	CreateSnippetServiceInput,
	SnippetSortBy,
	UpdateSnippetServiceInput,
} from './core/repositories/snippet.repository'
import type { Snippet, SnippetTechnology } from './core/snippet.types'

type SnippetSearchScope = 'public' | 'mine' | 'all-visible'

type SearchSnippetsInput = {
	query?: string
	technology?: SnippetTechnology | 'all'
	sortBy?: SnippetSortBy
	scope?: SnippetSearchScope
	limit?: number
}

/* ----------------------------------------------------------------------- */
/* AUTHENTICATION HELPER
/* ----------------------------------------------------------------------- */

async function requireAuth() {
	const auth = getServerFirebaseAuth()
	const cookieStore = await cookies()
	const sessionCookie = cookieStore.get('__session')?.value

	if (!sessionCookie) {
		throw new Error('No session cookie found')
	}

	try {
		const decodedUser = await auth.verifySessionCookie(sessionCookie, true)
		const user = await userService.getUserById(decodedUser.uid)

		if (!user) {
			throw new Error('User profile not found')
		}

		return user
	} catch (error) {
		logger.error('Auth failed', error)
		throw new Error('Invalid or expired session')
	}
}

/* ----------------------------------------------------------------------- */
/* CREATE
/* ----------------------------------------------------------------------- */

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

/* ----------------------------------------------------------------------- */
/* UPDATE
/* ----------------------------------------------------------------------- */

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

/* ----------------------------------------------------------------------- */
/* DELETE
/* ----------------------------------------------------------------------- */

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

/* ----------------------------------------------------------------------- */
/* VIEW COUNT - NEW ACTION
/* ----------------------------------------------------------------------- */

/**
 * Increment view count for a snippet.
 * This action does NOT require authentication - public views count too.
 */
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

/* ----------------------------------------------------------------------- */
/* LIKE
/* ----------------------------------------------------------------------- */

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

/* ----------------------------------------------------------------------- */
/* VERSION CONTROL
/* ----------------------------------------------------------------------- */

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

/* ----------------------------------------------------------------------- */
/* SHARING
/* ----------------------------------------------------------------------- */

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

/* ----------------------------------------------------------------------- */
/* SEARCH
/* ----------------------------------------------------------------------- */

function sortSnippets(snippets: Snippet[], sortBy: SnippetSortBy): Snippet[] {
	const copy = [...snippets]

	switch (sortBy) {
		case 'latest':
			return copy.sort((a, b) => b.createdAt - a.createdAt)
		case 'oldest':
			return copy.sort((a, b) => a.createdAt - b.createdAt)
		case 'views':
			return copy.sort((a, b) => b.viewsCount - a.viewsCount)
		case 'title':
			return copy.sort((a, b) => a.title.localeCompare(b.title))
		default:
			return copy
	}
}

function getLanguageSearchTerms(language: string): string[] {
	const normalizedLanguage = language.toLowerCase()
	const config = (
		EDITOR_LANGUAGES as Record<string, { label: string; extensions: string[] }>
	)[normalizedLanguage]

	if (!config) return [normalizedLanguage]

	const extensionTerms = config.extensions.flatMap((ext) => {
		const normalized = ext.toLowerCase()
		return normalized.startsWith('.')
			? [normalized, normalized.slice(1)]
			: [normalized]
	})

	const labelTerms = config.label
		.toLowerCase()
		.split(/[\s.+#-]+/)
		.filter(Boolean)

	const manualAliases =
		normalizedLanguage === 'javascript'
			? ['js']
			: normalizedLanguage === 'typescript'
				? ['ts']
				: normalizedLanguage === 'python'
					? ['py']
					: normalizedLanguage === 'markdown'
						? ['md']
						: normalizedLanguage === 'yaml'
							? ['yml']
							: normalizedLanguage === 'dockerfile'
								? ['docker']
								: []

	return [
		...new Set([
			normalizedLanguage,
			...labelTerms,
			...extensionTerms,
			...manualAliases,
		]),
	]
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
		const normalizedQuery = query.trim().toLowerCase()
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

		let filtered = source

		if (technology !== 'all') {
			filtered = filtered.filter((snippet) =>
				snippet.technologies.includes(technology),
			)
		}

		if (normalizedQuery) {
			filtered = filtered.filter((snippet) => {
				const languageTerms = getLanguageSearchTerms(snippet.language)

				const searchable = [
					snippet.title,
					snippet.description || '',
					snippet.ownerName,
					snippet.language,
					...languageTerms,
					...snippet.technologies,
					...snippet.categories,
				]
					.join(' ')
					.toLowerCase()

				return searchable.includes(normalizedQuery)
			})
		}

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
