import type {
	Snippet,
	SnippetContent,
	SnippetFile,
	SnippetOwnership,
	SnippetVersion,
} from './snippet.types'

export function createSnippet(
	input: SnippetContent & SnippetOwnership,
): Omit<Snippet, 'id'> {
	const now = Date.now()

	const initialVersion: SnippetVersion = {
		version: 1,
		files: input.files,
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
	newFiles: SnippetFile[],
	userId: string,
): SnippetVersion {
	return {
		version: snippet.versions.length + 1,
		files: newFiles,
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
	'versions' | 'files'
> & {
	codePreview: string
} {
	const { versions, files, ...rest } = snippet
	const firstFile = files[0]

	return {
		...rest,
		codePreview:
			firstFile.code.split('\n').slice(0, 5).join('\n') +
			(firstFile.code.split('\n').length > 5 ? '\n...' : ''),
	}
}
