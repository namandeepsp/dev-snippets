import type { searchSnippetsAction } from '@/features/snippets/snippet.actions'

export type SearchResult = NonNullable<
	Awaited<ReturnType<typeof searchSnippetsAction>>['data']
>[number]

export type SearchScope = 'public' | 'mine' | 'all-visible'
