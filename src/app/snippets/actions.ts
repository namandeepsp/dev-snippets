'use server'

import type {
	SnippetListCursor,
	SnippetSortBy,
} from '@/features/snippets/core/repositories/snippet.repository'
import { snippetService } from '@/features/snippets/snippet.server.container'
import { userService } from '@/features/user/user.container'

const DEFAULT_PAGE_SIZE = 5

type GetPublicSnippetsPageInput = {
	sortBy?: SnippetSortBy
	limit?: number
	cursor?: SnippetListCursor | null
}

export async function getPublicSnippets(sortBy: SnippetSortBy = 'latest') {
	const snippets = await snippetService.listPublic(sortBy)
	const authorIds = [...new Set(snippets.map((s) => s.ownerId))]
	const authors = await userService.getUsersByIds(authorIds)

	return snippets.map((snippet) => ({
		...snippet,
		author: authors[snippet.ownerId] || {
			id: snippet.ownerId,
			username: 'unknown',
			name: snippet.ownerName,
			avatarUrl: null,
		},
	}))
}

export async function getPublicSnippetsPage({
	sortBy = 'latest',
	limit = DEFAULT_PAGE_SIZE,
	cursor = null,
}: GetPublicSnippetsPageInput = {}) {
	const { items, nextCursor } = await snippetService.listPublicPaginated(
		sortBy,
		limit,
		cursor,
	)

	const authorIds = [...new Set(items.map((s) => s.ownerId))]
	const authors = await userService.getUsersByIds(authorIds)

	return {
		items: items.map((snippet) => ({
			...snippet,
			author: authors[snippet.ownerId] || {
				id: snippet.ownerId,
				username: 'unknown',
				name: snippet.ownerName,
				avatarUrl: null,
			},
		})),
		nextCursor,
	}
}
