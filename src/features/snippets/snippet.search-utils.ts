import { EDITOR_LANGUAGES } from '@/features/editor/editor.config'
import type { SnippetSortBy } from './core/repositories/snippet.repository'
import type { Snippet, SnippetTechnology } from './core/snippet.types'

export function sortSnippets(
	snippets: Snippet[],
	sortBy: SnippetSortBy,
): Snippet[] {
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

export function getLanguageSearchTerms(language: string): string[] {
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

export function filterByTechnology(
	snippets: Snippet[],
	technology: SnippetTechnology | 'all',
): Snippet[] {
	if (technology === 'all') return snippets
	return snippets.filter((snippet) => snippet.technologies.includes(technology))
}

export function filterByQuery(snippets: Snippet[], query: string): Snippet[] {
	const normalizedQuery = query.trim().toLowerCase()
	if (!normalizedQuery) return snippets

	return snippets.filter((snippet) => {
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
