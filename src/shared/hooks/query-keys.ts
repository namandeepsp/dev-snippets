import type { SnippetSortBy } from '@/features/snippets/core/repositories/snippet.repository'
import type { SnippetTechnology } from '@/features/snippets/core/snippet.types'

export const queryKeys = {
	snippets: {
		publicList: (
			sortBy: SnippetSortBy,
			likedOnly: boolean,
			technologies: SnippetTechnology[],
		) => ['snippets', 'public', sortBy, likedOnly, technologies] as const,

		versionHistory: (snippetId: string) =>
			['snippets', snippetId, 'versions'] as const,

		versionDetail: (snippetId: string, versionNumber: number) =>
			['snippets', snippetId, 'versions', versionNumber] as const,
	},

	profile: {
		snippets: (username: string) => ['profile', username, 'snippets'] as const,
	},
}
