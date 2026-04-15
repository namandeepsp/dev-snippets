'use server'

import { getCurrentServerUser } from '@/features/auth/auth.server.container'
import type { SnippetListCursor } from '@/features/snippets/core/repositories/snippet.repository'
import { snippetService } from '@/features/snippets/snippet.server.container'

const DEFAULT_PAGE_SIZE = 6

type GetProfileSnippetsPageInput = {
	username: string
	limit?: number
	cursor?: SnippetListCursor | null
}

export async function getProfileSnippetsPage({
	username,
	limit = DEFAULT_PAGE_SIZE,
	cursor = null,
}: GetProfileSnippetsPageInput) {
	let currentUser = null

	try {
		currentUser = await getCurrentServerUser()
	} catch {}

	return snippetService.listProfileByUsernamePaginated(
		username,
		currentUser?.id,
		limit,
		cursor,
	)
}
