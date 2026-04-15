import type {
	Snippet,
	SnippetContent,
	SnippetOwnership,
	SnippetVersion,
} from './snippet.types'

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

export function createNextVersion(
	snippet: Snippet,
	_newCode: string,
	userId: string,
): SnippetVersion {
	return {
		version: snippet.versions.length + 1,
		code: snippet.code,
		createdAt: Date.now(),
		createdBy: userId,
	}
}

export function canEdit(snippet: Snippet, userId?: string): boolean {
	if (!userId) return false
	return snippet.ownerId === userId
}

export function canView(snippet: Snippet, userId?: string): boolean {
	if (snippet.visibility === 'public') {
		return true
	}

	if (snippet.visibility === 'private') {
		return snippet.ownerId === userId
	}

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

export function getLatestVersion(snippet: Snippet): SnippetVersion {
	return snippet.versions[snippet.versions.length - 1]
}

export function getVersion(
	snippet: Snippet,
	versionNumber: number,
): SnippetVersion | undefined {
	return snippet.versions.find((v) => v.version === versionNumber)
}

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
