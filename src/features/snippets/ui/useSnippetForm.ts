import type { EditorLanguage } from '@/features/editor/editor.config'
import {
	LANGUAGE_TO_PRIMARY_TECHNOLOGY,
	TECHNOLOGY_CATEGORY_MAP,
	TECHNOLOGY_TO_EDITOR_LANGUAGE,
} from '@/features/technologies/technologies.config'
import { logger } from '@/shared/utils/logger'
import { useEffect, useState } from 'react'
import type {
	Snippet,
	SnippetCategory,
	SnippetTechnology,
	SnippetVisibility,
} from '../core/snippet.types'

type UseSnippetFormStateProps = {
	mode: 'create' | 'edit'
	snippet?: Snippet
}

export function useSnippetFormState({
	mode,
	snippet,
}: UseSnippetFormStateProps) {
	// Form state
	const [title, setTitle] = useState(snippet?.title ?? '')
	const [description, setDescription] = useState(snippet?.description ?? '')
	const [code, setCode] = useState(snippet?.code ?? '')
	const [language, _setLanguage] = useState<EditorLanguage>(
		(snippet?.language as EditorLanguage) ?? 'javascript',
	)
	const [visibility, setVisibility] = useState<SnippetVisibility>(
		snippet?.visibility ?? 'public',
	)
	const [technologies, setTechnologies] = useState<SnippetTechnology[]>(
		snippet?.technologies ?? [],
	)
	const [categories, setCategories] = useState<SnippetCategory[]>(
		snippet?.categories ?? [],
	)
	const [techToAdd, setTechToAdd] = useState('')

	// UI state
	const [isFormatting, setIsFormatting] = useState(false)

	const handleDetectedLanguage = (detected: EditorLanguage) => {
		logger.info('🔍 handleDetectedLanguage called with:', detected)
		logger.info('Language detected in form:', detected)

		const primaryTech = LANGUAGE_TO_PRIMARY_TECHNOLOGY[detected]
		logger.info('📍 Primary tech mapping:', primaryTech)
		logger.info('Primary tech for detected language:', primaryTech)

		if (!primaryTech) {
			logger.warn('⚠️ No primary technology mapping found for:', detected)
			logger.warn('No primary technology mapping found for:', detected)
			return
		}

		logger.info('📝 Current technologies before update:', technologies)
		setTechnologies((prev) => {
			const updated = prev.includes(primaryTech)
				? [primaryTech, ...prev.filter((t) => t !== primaryTech)]
				: [primaryTech, ...prev]
			logger.info('✅ Updated technologies array:', updated)
			logger.info('Updated technologies array:', updated)
			return updated
		})
	}

	// Set default technology/categories based on language in create mode
	useEffect(() => {
		if (mode === 'create' && technologies.length === 0) {
			const primaryTech = LANGUAGE_TO_PRIMARY_TECHNOLOGY[language]
			if (primaryTech && TECHNOLOGY_CATEGORY_MAP[primaryTech]) {
				setTechnologies([primaryTech])
				const cats = TECHNOLOGY_CATEGORY_MAP[primaryTech]
				if (cats) {
					setCategories(cats)
				}
			}
		}
	}, [language, mode])

	// Helper: Get primary (first) selected technology
	const primaryTechnology = technologies[0] as SnippetTechnology | undefined

	// Auto-sync categories when primary technology changes
	useEffect(() => {
		if (primaryTechnology && TECHNOLOGY_CATEGORY_MAP[primaryTechnology]) {
			const mappedCats = TECHNOLOGY_CATEGORY_MAP[primaryTechnology]
			setCategories((prev) => {
				const newCats = mappedCats.filter((c) => !prev.includes(c))
				return [...prev, ...newCats]
			})
		}
	}, [primaryTechnology])

	// Helper: Derive formatter language from selected technology
	const formatterLanguage = primaryTechnology
		? TECHNOLOGY_TO_EDITOR_LANGUAGE[primaryTechnology] ||
			(primaryTechnology as EditorLanguage)
		: language

	// Log formatter language changes
	useEffect(() => {
		logger.info('📤 formatterLanguage updated to:', formatterLanguage)
		logger.info('📤 primaryTechnology:', primaryTechnology)
		logger.info('Formatter language updated:', formatterLanguage)
	}, [formatterLanguage, primaryTechnology])

	function toggleCategory(cat: SnippetCategory) {
		setCategories((prev) =>
			prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
		)
	}

	function handleAddTechnology(value: string) {
		const tech = value as SnippetTechnology
		if (technologies.includes(tech)) {
			setTechnologies((prev) => prev.filter((item) => item !== tech))
		} else {
			setTechnologies((prev) => [...prev, tech])

			// Auto-add categories based on technology
			const cats = TECHNOLOGY_CATEGORY_MAP[tech]
			if (cats) {
				setCategories((prev) => {
					const newCats = cats.filter((c) => !prev.includes(c))
					return [...prev, ...newCats]
				})
			}
		}
		setTechToAdd('')
	}

	function removeTechnology(tech: SnippetTechnology) {
		setTechnologies((prev) => prev.filter((item) => item !== tech))
	}

	return {
		// State
		title,
		setTitle,
		description,
		setDescription,
		code,
		setCode,
		language,
		visibility,
		setVisibility,
		technologies,
		setTechnologies,
		categories,
		setCategories,
		techToAdd,
		setTechToAdd,
		isFormatting,
		setIsFormatting,

		// Computed values
		primaryTechnology,
		formatterLanguage,

		// Handlers
		handleDetectedLanguage,
		toggleCategory,
		handleAddTechnology,
		removeTechnology,
	}
}
