import type { EditorLanguage } from '@/features/editor/editor.config'
import type { SnippetFile } from './snippet.types'

/**
 * Get file extension based on language
 */
export function getFileExtension(language: EditorLanguage): string {
	const extensions: Record<string, string> = {
		javascript: 'js',
		typescript: 'ts',
		jsx: 'jsx',
		tsx: 'tsx',
		python: 'py',
		java: 'java',
		csharp: 'cs',
		cpp: 'cpp',
		c: 'c',
		go: 'go',
		rust: 'rs',
		ruby: 'rb',
		php: 'php',
		sql: 'sql',
		html: 'html',
		css: 'css',
		json: 'json',
		yaml: 'yaml',
		markdown: 'md',
		bash: 'sh',
		shell: 'sh',
	}

	return extensions[language] || 'txt'
}

/**
 * Create a single snippet file
 */
export function createSnippetFile(
	code: string,
	language: EditorLanguage,
	filename?: string,
	order: number = 1,
): SnippetFile {
	const now = Date.now()

	return {
		id: `file-${order}`,
		filename: filename || `index.${getFileExtension(language)}`,
		language,
		code,
		order,
		createdAt: now,
		updatedAt: now,
	}
}

/**
 * Create multiple snippet files
 */
export function createSnippetFiles(
	entries: Array<{ code: string; language: EditorLanguage; filename?: string }>,
): SnippetFile[] {
	return entries.map((entry, index) =>
		createSnippetFile(entry.code, entry.language, entry.filename, index + 1),
	)
}

/**
 * Get the primary language from files
 */
export function getPrimaryLanguageFromFiles(
	files: SnippetFile[],
): EditorLanguage {
	return (files[0]?.language as EditorLanguage) || 'javascript'
}

/**
 * Get code preview from files
 */
export function getCodePreviewFromFiles(files: SnippetFile[]): string {
	const firstFile = files[0]
	if (!firstFile) return ''

	const lines = firstFile.code.split('\n')
	const preview = lines.slice(0, 5).join('\n')

	return preview + (lines.length > 5 ? '\n...' : '')
}

/**
 * Validate snippet files
 */
export function validateSnippetFiles(files: SnippetFile[]): {
	valid: boolean
	errors: string[]
} {
	const errors: string[] = []

	if (!files || files.length === 0) {
		errors.push('At least one file is required')
		return { valid: false, errors }
	}

	for (const file of files) {
		if (!file.filename.trim()) {
			errors.push('File name is required')
		}

		if (!file.code.trim()) {
			errors.push(`Code in file "${file.filename}" is required`)
		}

		if (!file.language) {
			errors.push(`Language for file "${file.filename}" is required`)
		}
	}

	return { valid: errors.length === 0, errors }
}

/**
 * Merge files by updating or adding
 */
export function mergeSnippetFiles(
	existing: SnippetFile[],
	updates: Partial<SnippetFile>[],
): SnippetFile[] {
	const merged = [...existing]

	for (const update of updates) {
		const index = merged.findIndex((f) => f.id === update.id)

		if (index >= 0) {
			merged[index] = { ...merged[index], ...update }
		} else {
			merged.push({
				id: `file-${merged.length + 1}`,
				filename: update.filename || 'index.js',
				language: update.language || 'javascript',
				code: update.code || '',
				order: update.order || merged.length + 1,
				createdAt: update.createdAt || Date.now(),
				updatedAt: update.updatedAt || Date.now(),
			} as SnippetFile)
		}
	}

	return merged
}

/**
 * Remove file from snippet
 */
export function removeSnippetFile(
	files: SnippetFile[],
	fileId: string,
): SnippetFile[] {
	return files
		.filter((f) => f.id !== fileId)
		.map((f, index) => ({
			...f,
			order: index + 1,
		}))
}

/**
 * Reorder files
 */
export function reorderSnippetFiles(
	files: SnippetFile[],
	fromIndex: number,
	toIndex: number,
): SnippetFile[] {
	const result = [...files]
	const [removed] = result.splice(fromIndex, 1)
	result.splice(toIndex, 0, removed)

	return result.map((f, index) => ({
		...f,
		order: index + 1,
	}))
}

/**
 * Get total code size in bytes
 */
export function getSnippetFilesSize(files: SnippetFile[]): number {
	return files.reduce((total, file) => {
		return total + new Blob([file.code]).size
	}, 0)
}

/**
 * Check if snippet exceeds size limit
 */
export function exceedsSnippetSizeLimit(
	files: SnippetFile[],
	limitBytes: number = 500 * 1024, // 500KB default
): boolean {
	return getSnippetFilesSize(files) > limitBytes
}

/**
 * Get file size in KB
 */
export function getFileSizeKB(file: SnippetFile): number {
	return new Blob([file.code]).size / 1024
}

/**
 * Check if file exceeds size limit
 */
export function exceedsFileSizeLimit(
	file: SnippetFile,
	limitKB: number = 100, // 100KB default
): boolean {
	return getFileSizeKB(file) > limitKB
}
