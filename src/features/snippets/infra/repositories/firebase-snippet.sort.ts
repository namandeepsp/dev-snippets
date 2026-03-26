import type { SnippetSortBy } from '../../core/repositories/snippet.repository'
import type { FirestoreSnippet, Snippet } from '../../core/snippet.types'

export function getSortConfig(sortBy: SnippetSortBy): {
	field: string
	direction: 'asc' | 'desc'
} {
	switch (sortBy) {
		case 'latest':
			return { field: 'createdAt', direction: 'desc' }
		case 'oldest':
			return { field: 'createdAt', direction: 'asc' }
		case 'views':
			return { field: 'viewsCount', direction: 'desc' }
		case 'title':
			return { field: 'title', direction: 'asc' }
		default:
			return { field: 'createdAt', direction: 'desc' }
	}
}

export function getSortValue(
	snippet: FirestoreSnippet | Snippet,
	sortBy: SnippetSortBy,
): number | string {
	switch (sortBy) {
		case 'latest':
		case 'oldest':
			return snippet.createdAt
		case 'views':
			return snippet.viewsCount
		case 'title':
			return snippet.title
		default:
			return snippet.createdAt
	}
}
