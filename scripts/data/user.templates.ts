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

export type UserTemplate = {
	username: string
	name: string
	email: string
	avatarUrl?: string
	bio?: string
}

export const USER_TEMPLATES: UserTemplate[] = []
