'use server'

import { getCurrentServerUser } from '@/features/auth/auth.server.container'
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
	likedOnly?: boolean
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
	likedOnly = false,
}: GetPublicSnippetsPageInput = {}) {
	const currentUser = await getCurrentServerUser()

	// If liked only filter is active, only fetch liked snippets
	if (likedOnly && currentUser) {
		const likedSnippetIds = await snippetService.getLikedSnippetIds(
			currentUser.id,
		)

		if (likedSnippetIds.length === 0) {
			return { items: [], nextCursor: null }
		}

		// Fetch liked snippets (no pagination for now, can be added later)
		const likedSnippets = await Promise.all(
			likedSnippetIds.map((id) => snippetService.getById(id)),
		)

		const validSnippets = likedSnippets.filter(
			(s): s is NonNullable<typeof s> => s !== null,
		)

		const authorIds = [...new Set(validSnippets.map((s) => s.ownerId))]
		const authors = await userService.getUsersByIds(authorIds)

		return {
			items: validSnippets.map((snippet) => ({
				...snippet,
				isLiked: true,
				author: authors[snippet.ownerId] || {
					id: snippet.ownerId,
					username: 'unknown',
					name: snippet.ownerName,
					avatarUrl: null,
				},
			})),
			nextCursor: null, // No pagination for liked snippets
		}
	}

	// Normal flow: fetch public snippets
	const { items, nextCursor } = await snippetService.listPublicPaginated(
		sortBy,
		limit,
		cursor,
	)

	// If user is logged in, add their private snippets
	let allItems = items
	if (currentUser) {
		const userPrivateSnippets = await snippetService.listByUser(
			currentUser.id,
			'private',
		)
		// Merge and deduplicate
		const existingIds = new Set(items.map((s) => s.id))
		const newPrivateSnippets = userPrivateSnippets.filter(
			(s) => !existingIds.has(s.id),
		)
		allItems = [...items, ...newPrivateSnippets]
	}

	// Get liked snippet IDs for current user
	const likedSnippetIds = currentUser
		? new Set(await snippetService.getLikedSnippetIds(currentUser.id))
		: new Set<string>()

	const authorIds = [...new Set(allItems.map((s) => s.ownerId))]
	const authors = await userService.getUsersByIds(authorIds)

	return {
		items: allItems.map((snippet) => ({
			...snippet,
			isLiked: likedSnippetIds.has(snippet.id),
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
