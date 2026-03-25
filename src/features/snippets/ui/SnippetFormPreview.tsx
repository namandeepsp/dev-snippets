'use client'

import { TECHNOLOGY_OPTIONS } from '@/features/technologies/technologies.config'
import { TechnologyIcon } from '@/features/technologies/technology-icons'
import { Button } from '@/shared/ui/design-system'
import { TECHNOLOGY_COLORS } from '../core/snippet.colors'
import type { SnippetCategory, SnippetTechnology } from '../core/snippet.types'

type SnippetFormPreviewProps = {
	technologies: SnippetTechnology[]
	categories: SnippetCategory[]
	removeTechnology: (tech: SnippetTechnology) => void
	isSaving: boolean
}

export function SnippetFormPreview({
	technologies,
	categories,
	removeTechnology,
	isSaving,
}: SnippetFormPreviewProps) {
	if (technologies.length === 0 && categories.length === 0) {
		return null
	}

	return (
		<div className="rounded-md bg-gray-50 dark:bg-gray-900 p-4">
			<p className="text-sm font-medium mb-2">Selected:</p>
			<div className="flex flex-wrap gap-2">
				{technologies.map((tech) => {
					const techOption = TECHNOLOGY_OPTIONS.find(
						(option) => option.value === tech,
					)
					return (
						<Button
							key={tech}
							type="button"
							onClick={() => removeTechnology(tech)}
							disabled={isSaving}
							size="sm"
							className={`h-auto rounded-full px-3 py-1.5 text-xs font-medium shadow-none hover:opacity-90 ${
								tech === 'nextjs' ? 'text-black dark:text-white' : 'text-white'
							} ${TECHNOLOGY_COLORS[tech] || 'bg-gray-500'}`}
						>
							<span className="mr-1" aria-hidden>
								<TechnologyIcon
									technology={techOption?.iconKey ?? tech}
									className="text-black dark:text-white"
								/>
							</span>
							{techOption?.label ?? tech}
							<span className="ml-1" aria-hidden>
								×
							</span>
						</Button>
					)
				})}
				{categories.map((cat) => (
					<span
						key={cat}
						className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
					>
						{cat}
					</span>
				))}
			</div>
		</div>
	)
}
