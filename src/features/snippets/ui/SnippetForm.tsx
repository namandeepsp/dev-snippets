'use client'

import { useEffect } from 'react'
import type { Snippet } from '../core/snippet.types'
import { SnippetFormActions } from './SnippetFormActions'
import { SnippetFormCategories } from './SnippetFormCategories'
import { SnippetFormCodeEditor } from './SnippetFormCodeEditor'
import { SnippetFormPreview } from './SnippetFormPreview'
import { SnippetFormSkeleton } from './SnippetFormSkeleton'
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
		code: formState.code,
		formatterLanguage: formState.formatterLanguage,
		visibility: formState.visibility,
		technologies: formState.technologies,
		categories: formState.categories,
		isSaving: false, // Will be provided by submission hook
	})

	const submission = useSnippetFormSubmission({
		mode,
		snippet,
		normalizedTitle: validation.normalizedTitle,
		normalizedDescription: validation.normalizedDescription,
		code: formState.code,
		formatterLanguage: formState.formatterLanguage,
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

	if (submission.isSaving) {
		return (
			<div className="fixed inset-0 z-50 overflow-auto bg-white dark:bg-slate-950">
				<SnippetFormSkeleton
					maxWidth={mode === 'edit' ? 'max-w-4xl' : 'max-w-5xl'}
				/>
			</div>
		)
	}

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

			<SnippetFormCodeEditor
				primaryTechnology={formState.primaryTechnology}
				onTechSelected={(tech) => {
					if (formState.technologies.includes(tech)) {
						formState.setTechnologies((prev) => [
							tech,
							...prev.filter((t) => t !== tech),
						])
					} else {
						formState.setTechnologies((prev) => [tech, ...prev])
					}
				}}
				code={formState.code}
				onCodeChange={formState.setCode}
				formatterLanguage={formState.formatterLanguage}
				onLanguageDetected={formState.handleDetectedLanguage}
				isSaving={submission.isSaving}
				isFormatting={formState.isFormatting}
				onSave={submission.submit}
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
		</form>
	)
}
