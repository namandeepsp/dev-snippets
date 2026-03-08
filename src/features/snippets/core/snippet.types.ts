/**
 * ============================================================================
 * SNIPPET TYPES
 * ============================================================================
 *
 * Single source of truth for all snippet-related types.
 *
 * Layered architecture:
 * 1. FirestoreSnippet - Raw database shape
 * 2. Snippet - Domain model (FirestoreSnippet + id + versions)
 * 3. DTOs - Input/output types for operations
 */

import type { EditorLanguage } from '@/features/editor/editor.config'
import type { Author } from '@/features/user/core/user.types'

export const SNIPPET_TITLE_MAX_LENGTH = 100

/* ------------------------------------------------------------------------- */
/* ENUMS / UNIONS
/* ------------------------------------------------------------------------- */

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

/* ------------------------------------------------------------------------- */
/* VERSIONING
/* ------------------------------------------------------------------------- */

export type SnippetVersion = {
	/** Version number (1-based) */
	version: number
	/** The code at this version */
	code: string
	/** When this version was created */
	createdAt: number
	/** Who created this version */
	createdBy: string // user ID
}

/* ------------------------------------------------------------------------- */
/* CONTENT TYPES
/* ------------------------------------------------------------------------- */

/** Core snippet content - what the user provides */
export type SnippetContent = {
	title: string
	description?: string
	code: string
	language: EditorLanguage
	technologies: SnippetTechnology[]
	categories: SnippetCategory[]
	visibility: SnippetVisibility
}

/** Ownership metadata */
export type SnippetOwnership = {
	ownerId: string
	ownerName: string
}

/** Analytics metrics */
export type SnippetMetrics = {
	likesCount: number
	viewsCount: number
}

/** Timestamps */
export type SnippetTimestamps = {
	createdAt: number
	updatedAt: number
}

/** Soft delete flag */
export type SnippetFlags = {
	isDeleted?: boolean
}

/** Sharing - for future implementation */
export type SnippetSharing = {
	sharedWith?: string[]
}

/* ------------------------------------------------------------------------- */
/* DATABASE MODEL - Firestore shape
/* ------------------------------------------------------------------------- */

/** Raw Firestore document data */
export type FirestoreSnippet = SnippetContent &
	SnippetOwnership &
	SnippetMetrics &
	SnippetTimestamps &
	SnippetFlags &
	SnippetSharing & {
		/** Version history - always an array, even if empty */
		versions: SnippetVersion[]
	}

/* ------------------------------------------------------------------------- */
/* DOMAIN MODEL - Application shape
/* ------------------------------------------------------------------------- */

/** Full snippet entity used throughout the application */
export type Snippet = FirestoreSnippet & {
	/** Firestore document ID */
	id: string
}

export type EnrichedSnippet = Snippet & {
	author?: Author
	isLikedByUser?: boolean
}
