import type { EditorLanguage } from '@/features/editor/editor.config'
import { useMemo } from 'react'
import type {
	Snippet,
	SnippetCategory,
	SnippetTechnology,
	SnippetVisibility,
} from '../core/snippet.types'
import { SNIPPET_TITLE_MAX_LENGTH } from '../core/snippet.types'

type UseSnippetFormValidationProps = {
	mode: 'create' | 'edit'
	snippet?: Snippet
	title: string
	description: string
	code: string
	formatterLanguage: EditorLanguage
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
	code,
	formatterLanguage,
	visibility,
	technologies,
	categories,
	isSaving,
}: UseSnippetFormValidationProps) {
	const normalizedTitle = title.trim()
	const normalizedDescription = description.trim()
	const titleLength = title.length
	const isTitleWithinLimit = titleLength <= SNIPPET_TITLE_MAX_LENGTH
	const hasRequiredFields = Boolean(normalizedTitle && code.trim())

	const hasEditChanges = useMemo(() => {
		if (mode !== 'edit' || !snippet) return true

		const sameArray = (a: string[], b: string[]) => {
			if (a.length !== b.length) return false
			const left = [...a].sort()
			const right = [...b].sort()
			return left.every((value, index) => value === right[index])
		}

		return (
			normalizedTitle !== snippet.title.trim() ||
			normalizedDescription !== (snippet.description ?? '').trim() ||
			code !== snippet.code ||
			formatterLanguage !== (snippet.language as EditorLanguage) ||
			visibility !== snippet.visibility ||
			!sameArray(technologies, snippet.technologies ?? []) ||
			!sameArray(categories, snippet.categories ?? [])
		)
	}, [
		mode,
		snippet,
		normalizedTitle,
		normalizedDescription,
		code,
		formatterLanguage,
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
