import type { EditorLanguage } from '@/features/editor/editor.config'
import { formatCodeWithStatus } from '@/features/editor/formatter/formatter.registry'
import { snippetApiClient } from '@/features/snippets/snippet.client.container'
import { toast } from '@/shared/ui/design-system'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { CreateSnippetServiceInput } from '../core/repositories/snippet.repository'
import type {
	Snippet,
	SnippetCategory,
	SnippetTechnology,
	SnippetVisibility,
} from '../core/snippet.types'

type UseSnippetFormSubmissionProps = {
	mode: 'create' | 'edit'
	snippet?: Snippet
	normalizedTitle: string
	normalizedDescription: string
	code: string
	formatterLanguage: EditorLanguage
	technologies: SnippetTechnology[]
	categories: SnippetCategory[]
	visibility: SnippetVisibility
	canSubmit: boolean
}

export function useSnippetFormSubmission({
	mode,
	snippet,
	normalizedTitle,
	normalizedDescription,
	code,
	formatterLanguage,
	technologies,
	categories,
	visibility,
	canSubmit,
}: UseSnippetFormSubmissionProps) {
	const router = useRouter()
	const [isSaving, setIsSaving] = useState(false)

	const submit = async () => {
		if (isSaving) return
		if (!canSubmit) {
			toast.error('Please complete required fields before saving.')
			return
		}

		setIsSaving(true)

		try {
			const formatResult = await formatCodeWithStatus(code, formatterLanguage)

			if (formatResult.error) {
				toast.error('Code formatting failed', {
					description: formatResult.error,
				})
				setIsSaving(false)
				return
			}

			const formattedCode = formatResult.formattedCode

			const input: CreateSnippetServiceInput = {
				title: normalizedTitle,
				description: normalizedDescription || undefined,
				code: formattedCode,
				language: formatterLanguage,
				technologies,
				categories,
				visibility,
			}

			if (mode === 'edit' && snippet) {
				await snippetApiClient.update(snippet.id, input)
				toast.success('Snippet updated successfully!')
				router.replace(`/snippets/${snippet.id}`)
			} else {
				const newSnippet = await snippetApiClient.create(input)
				toast.success('Snippet created successfully!')
				router.replace(`/snippets/${newSnippet.id}`)
			}
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : `Failed to ${mode} snippet`,
			)
		} finally {
			setIsSaving(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		await submit()
	}

	return {
		isSaving,
		submit,
		handleSubmit,
	}
}
