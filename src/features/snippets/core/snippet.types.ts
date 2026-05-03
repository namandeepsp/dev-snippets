import type { EditorLanguage } from '@/features/editor/editor.config'
import type { Author } from '@/features/user/core/user.types'

export const SNIPPET_TITLE_MAX_LENGTH = 100

export type SnippetVisibility = 'private' | 'public' | 'shared'

export type SnippetTechnology =
	| 'javascript'
	| 'typescript'
	| 'react'
	| 'redux'
	| 'node'
	| 'express'
	| 'golang'
	| 'webpack'
	| 'rollup'
	| 'browser-extension'
	| 'nextjs'
	| 'angular'
	| 'python'
	| 'java'
	| 'markdown'
	| 'sql'
	| 'postgres-sql'
	| 'docker'
	| 'dev-ops'
	| 'json'
	| 'html'
	| 'css'
	| 'yaml'
	| 'nosql'
	| 'rust'
	| 'ruby'
	| 'php'
	| 'csharp'
	| 'cpp'

export type SnippetCategory =
	| 'language'
	| 'framework'
	| 'bundler'
	| 'platform'
	| 'library'
	| 'frontend'
	| 'hooks'
	| 'backend'
	| 'middleware'
	| 'database'
	| 'devops'
	| 'testing'
	| 'security'
	| 'performance'
	| 'design'
	| 'algorithms'
	| 'data-structures'
	| 'miscellaneous'
	| 'queries'
	| 'infrastructure'
	| 'deployment'
	| 'utilities'
	| 'network'
	| 'data'
	| 'architecture'
	| 'types'
	| 'state'
	| 'events'
	| 'storage'
	| 'validation'
	| 'api'
	| 'microservices'

export type SnippetFile = {
	id: string
	filename: string
	language: EditorLanguage
	code: string
	order: number
	createdAt: number
	updatedAt: number
}

export type SnippetVersion = {
	version: number
	createdAt: number
	createdBy: string
	files: SnippetFile[]
}

export type SnippetVersionDetail = {
	version: number
	files: SnippetFile[]
	createdAt: number
	createdBy: string
}

export type SnippetContent = {
	title: string
	description?: string
	files: SnippetFile[]
	primaryLanguage: EditorLanguage
	technologies: SnippetTechnology[]
	categories: SnippetCategory[]
	visibility: SnippetVisibility
}

export type SnippetOwnership = {
	ownerId: string
	ownerName: string
}

export type SnippetMetrics = {
	likesCount: number
	viewsCount: number
}

export type SnippetTimestamps = {
	createdAt: number
	updatedAt: number
}

export type SnippetFlags = {
	isDeleted?: boolean
}

export type SnippetSharing = {
	sharedWith?: string[]
}

export type FirestoreSnippet = SnippetContent &
	SnippetOwnership &
	SnippetMetrics &
	SnippetTimestamps &
	SnippetFlags &
	SnippetSharing & {
		versions: SnippetVersion[]
	}

export type Snippet = FirestoreSnippet & {
	id: string
}

export type EnrichedSnippet = Snippet & {
	author?: Author
	isLikedByUser?: boolean
}
