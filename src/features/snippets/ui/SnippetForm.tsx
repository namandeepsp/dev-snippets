'use client'

import { ConfirmationModal } from '@/shared/ui/ConfirmationModal'
import { useEffect } from 'react'
import type { Snippet } from '../core/snippet.types'
import { SnippetFormActions } from './SnippetFormActions'
import { SnippetFormCategories } from './SnippetFormCategories'
import { SnippetFormFiles } from './SnippetFormFiles'
import { SnippetFormPreview } from './SnippetFormPreview'
import { SnippetFormTechnologySelect } from './SnippetFormTechnologySelect'
import { SnippetFormTitleDescription } from './SnippetFormTitleDescription'
import { SnippetFormVisibility } from './SnippetFormVisibility'
import { useSnippetFormState } from './useSnippetForm'
import { useSnippetFormSubmission } from './useSnippetFormSubmission'
import { useSnippetFormValidation } from './useSnippetFormValidation'

type Props = {
	mode: 'create' | 'edit'
	snippet?: Snippet
}

export function SnippetForm({ mode, snippet }: Props) {
	const formState = useSnippetFormState({ mode, snippet })

	const validation = useSnippetFormValidation({
		mode,
		snippet,
		title: formState.title,
		description: formState.description,
		files: formState.files,
		visibility: formState.visibility,
		technologies: formState.technologies,
		categories: formState.categories,
		isSaving: false,
	})

	const submission = useSnippetFormSubmission({
		mode,
		snippet,
		normalizedTitle: validation.normalizedTitle,
		normalizedDescription: validation.normalizedDescription,
		files: formState.files,
		technologies: formState.technologies,
		categories: formState.categories,
		visibility: formState.visibility,
		canSubmit: validation.canSubmit,
	})

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const isSave =
				(event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's'
			if (!isSave || event.repeat || submission.isSaving) return
			event.preventDefault()
			submission.submit()
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [submission])

	return (
		<form onSubmit={submission.handleSubmit} className="space-y-8">
			<SnippetFormTitleDescription
				title={formState.title}
				setTitle={formState.setTitle}
				description={formState.description}
				setDescription={formState.setDescription}
				isSaving={submission.isSaving}
				titleLength={validation.titleLength}
			/>

			<SnippetFormFiles
				files={formState.files}
				onFilesChange={formState.setFiles}
				isSaving={submission.isSaving}
				isFormatting={formState.isFormatting}
				onSave={submission.submit}
				onLanguageDetected={formState.handleDetectedLanguage}
			/>

			<SnippetFormVisibility
				visibility={formState.visibility}
				setVisibility={formState.setVisibility}
				isSaving={submission.isSaving}
			/>

			<SnippetFormTechnologySelect
				techToAdd={formState.techToAdd}
				onTechAdd={formState.handleAddTechnology}
				technologies={formState.technologies}
				isSaving={submission.isSaving}
			/>

			<SnippetFormCategories
				selectedCategories={formState.categories}
				toggleCategory={formState.toggleCategory}
				isSaving={submission.isSaving}
			/>

			<SnippetFormPreview
				technologies={formState.technologies}
				categories={formState.categories}
				removeTechnology={formState.removeTechnology}
				isSaving={submission.isSaving}
			/>

			<SnippetFormActions
				mode={mode}
				canSubmit={validation.canSubmit}
				isSaving={submission.isSaving}
			/>

			<ConfirmationModal
				open={submission.showEmptyFilesWarning}
				onClose={() => submission.setShowEmptyFilesWarning(false)}
				title="Empty Files Detected"
				description={`${submission.emptyFilesCount} file(s) with no code will not be saved. Do you want to continue?`}
				confirmText="Save"
				cancelText="Cancel"
				onConfirm={async () => {
					submission.setShowEmptyFilesWarning(false)
					await submission.performSave(formState.visibility)
				}}
				isLoading={submission.isSaving}
			/>

			<ConfirmationModal
				open={submission.showSharedWarning}
				onClose={() => submission.setShowSharedWarning(false)}
				title="Share Feature Not Available"
				description="The share feature is not yet available. Would you like to save this snippet as public instead? Anyone will be able to view it."
				confirmText="Save as Public"
				cancelText="Cancel"
				onConfirm={async () => {
					submission.setShowSharedWarning(false)
					await submission.performSubmit('public')
				}}
				isLoading={submission.isSaving}
			/>
		</form>
	)
}
