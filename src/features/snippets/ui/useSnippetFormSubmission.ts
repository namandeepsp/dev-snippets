import { snippetApiClient } from '@/features/snippets/snippet.client.container'
import { toast } from '@/shared/ui/design-system'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { CreateSnippetServiceInput } from '../core/repositories/snippet.repository'
import type {
	Snippet,
	SnippetCategory,
	SnippetFile,
	SnippetTechnology,
	SnippetVisibility,
} from '../core/snippet.types'

type UseSnippetFormSubmissionProps = {
	mode: 'create' | 'edit'
	snippet?: Snippet
	normalizedTitle: string
	normalizedDescription: string
	files: SnippetFile[]
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
	files,
	technologies,
	categories,
	visibility,
	canSubmit,
}: UseSnippetFormSubmissionProps) {
	const router = useRouter()
	const [isSaving, setIsSaving] = useState(false)
	const [showSharedWarning, setShowSharedWarning] = useState(false)
	const [showEmptyFilesWarning, setShowEmptyFilesWarning] = useState(false)

	const getEmptyFiles = () => files.filter((f) => !f.code.trim())
	const hasEmptyFiles = getEmptyFiles().length > 0

	const performSubmit = async (finalVisibility: SnippetVisibility) => {
		if (isSaving) return
		if (!canSubmit) {
			toast.error('Please complete required fields before saving.')
			return
		}

		if (hasEmptyFiles) {
			setShowEmptyFilesWarning(true)
			return
		}

		await performSave(finalVisibility)
	}

	const performSave = async (finalVisibility: SnippetVisibility) => {
		setIsSaving(true)

		try {
			const nonEmptyFiles = files.filter((f) => f.code.trim())
			const input: CreateSnippetServiceInput = {
				title: normalizedTitle,
				description: normalizedDescription || undefined,
				files: nonEmptyFiles,
				primaryLanguage: nonEmptyFiles[0]?.language || 'javascript',
				technologies,
				categories,
				visibility: finalVisibility,
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

	const submit = async () => {
		if (visibility === 'shared') {
			setShowSharedWarning(true)
			return
		}
		await performSubmit(visibility)
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		await submit()
	}

	return {
		isSaving,
		submit,
		handleSubmit,
		showSharedWarning,
		setShowSharedWarning,
		performSubmit,
		showEmptyFilesWarning,
		setShowEmptyFilesWarning,
		hasEmptyFiles,
		emptyFilesCount: getEmptyFiles().length,
		performSave,
	}
}
