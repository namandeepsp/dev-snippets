import { useMemo } from 'react'
import type {
	Snippet,
	SnippetCategory,
	SnippetFile,
	SnippetTechnology,
	SnippetVisibility,
} from '../core/snippet.types'
import { SNIPPET_TITLE_MAX_LENGTH } from '../core/snippet.types'

type UseSnippetFormValidationProps = {
	mode: 'create' | 'edit'
	snippet?: Snippet
	title: string
	description: string
	files: SnippetFile[]
	visibility: SnippetVisibility
	technologies: SnippetTechnology[]
	categories: SnippetCategory[]
	isSaving: boolean
}

export function useSnippetFormValidation({
	mode,
	snippet,
	title,
	description,
	files,
	visibility,
	technologies,
	categories,
	isSaving,
}: UseSnippetFormValidationProps) {
	const normalizedTitle = title.trim()
	const normalizedDescription = description.trim()
	const titleLength = title.length
	const isTitleWithinLimit = titleLength <= SNIPPET_TITLE_MAX_LENGTH
	const hasCode = files.some((f) => f.code.trim())
	const hasRequiredFields = Boolean(normalizedTitle && hasCode)

	const hasEditChanges = useMemo(() => {
		if (mode !== 'edit' || !snippet) return true

		const sameArray = (a: string[], b: string[]) => {
			if (a.length !== b.length) return false
			const left = [...a].sort()
			const right = [...b].sort()
			return left.every((value, index) => value === right[index])
		}

		const filesChanged =
			files.length !== snippet.files.length ||
			files.some(
				(f, i) =>
					f.filename !== snippet.files[i]?.filename ||
					f.code !== snippet.files[i]?.code ||
					f.language !== snippet.files[i]?.language,
			)

		return (
			normalizedTitle !== snippet.title.trim() ||
			normalizedDescription !== (snippet.description ?? '').trim() ||
			filesChanged ||
			visibility !== snippet.visibility ||
			!sameArray(technologies, snippet.technologies ?? []) ||
			!sameArray(categories, snippet.categories ?? [])
		)
	}, [
		mode,
		snippet,
		normalizedTitle,
		normalizedDescription,
		files,
		visibility,
		technologies,
		categories,
	])

	const canSubmit =
		hasRequiredFields && isTitleWithinLimit && !isSaving && hasEditChanges

	return {
		normalizedTitle,
		normalizedDescription,
		titleLength,
		isTitleWithinLimit,
		hasRequiredFields,
		hasEditChanges,
		canSubmit,
	}
}
