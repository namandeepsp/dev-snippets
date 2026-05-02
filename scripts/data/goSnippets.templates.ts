import type { FirestoreSnippet } from '../../src/features/snippets/core/snippet.types'

export type SnippetTemplate = Pick<
	FirestoreSnippet,
	| 'title'
	| 'description'
	| 'files'
	| 'primaryLanguage'
	| 'technologies'
	| 'categories'
>

export const GO_SNIPPET_TEMPLATES: SnippetTemplate[] = []
