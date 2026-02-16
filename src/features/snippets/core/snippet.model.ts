import type {
	Snippet,
	SnippetContent,
	SnippetOwnership,
	SnippetVersion,
} from './snippet.types'

/**
 * ============================================================================
 * SNIPPET MODEL
 * ============================================================================
 *
 * Factory functions and domain logic for Snippet entities.
 *
 * These functions are PURE - they don't interact with databases or APIs.
 * They just transform data according to business rules.
 */

/**
 * Create a new snippet from user input.
 *
 * This is a factory function - it creates the initial snippet state
 * before it's saved to the database.
 */
export function createSnippet(
	input: SnippetContent & SnippetOwnership,
): Omit<Snippet, 'id'> {
	const now = Date.now()

	const initialVersion: SnippetVersion = {
		version: 1,
		code: input.code,
		createdAt: now,
		createdBy: input.ownerId,
	}

	return {
		...input,
		likesCount: 0,
		viewsCount: 0,
		createdAt: now,
		updatedAt: now,
		isDeleted: false,
		versions: [initialVersion],
		sharedWith: input.visibility === 'shared' ? [] : undefined,
	}
}

/**
 * Create a new version entry when code changes.
 *
 * This preserves the OLD code as a version before updating
 * to the new code.
 */
export function createNextVersion(
	snippet: Snippet,
	_newCode: string,
	userId: string,
): SnippetVersion {
	return {
		version: snippet.versions.length + 1,
		code: snippet.code, // Store the CURRENT code as the version
		createdAt: Date.now(),
		createdBy: userId,
	}
}

/**
 * Check if a user can edit a snippet.
 */
export function canEdit(snippet: Snippet, userId?: string): boolean {
	if (!userId) return false
	return snippet.ownerId === userId
}

/**
 * Check if a user can view a snippet.
 */
export function canView(snippet: Snippet, userId?: string): boolean {
	// Public snippets: anyone can view
	if (snippet.visibility === 'public') {
		return true
	}

	// Private snippets: only owner
	if (snippet.visibility === 'private') {
		return snippet.ownerId === userId
	}

	// Shared snippets: owner + shared users
	if (snippet.visibility === 'shared') {
		return (
			snippet.ownerId === userId ||
			(userId !== '' &&
				userId !== undefined &&
				snippet.sharedWith?.includes(userId) === true)
		)
	}

	return false
}

/**
 * Get the latest version of a snippet.
 */
export function getLatestVersion(snippet: Snippet): SnippetVersion {
	return snippet.versions[snippet.versions.length - 1]
}

/**
 * Get a specific version of a snippet.
 */
export function getVersion(
	snippet: Snippet,
	versionNumber: number,
): SnippetVersion | undefined {
	return snippet.versions.find((v) => v.version === versionNumber)
}

/**
 * Summarize snippet for listings.
 * Removes heavy fields like versions and full code preview.
 */
export function summarizeSnippet(snippet: Snippet): Omit<
	Snippet,
	'versions' | 'code'
> & {
	codePreview: string
} {
	const { versions, code, ...rest } = snippet

	return {
		...rest,
		codePreview:
			code.split('\n').slice(0, 5).join('\n') +
			(code.split('\n').length > 5 ? '\n...' : ''),
	}
}
