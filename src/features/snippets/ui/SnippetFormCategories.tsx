'use client'

import { CATEGORIES } from '@/features/technologies/technologies.config'
import { Button } from '@/shared/ui/design-system'
import type { SnippetCategory } from '../core/snippet.types'

type SnippetFormCategoriesProps = {
	selectedCategories: SnippetCategory[]
	toggleCategory: (cat: SnippetCategory) => void
	isSaving: boolean
}

export function SnippetFormCategories({
	selectedCategories,
	toggleCategory,
	isSaving,
}: SnippetFormCategoriesProps) {
	return (
		<div>
			<label className="block mb-2 font-medium">Categories</label>
			<div className="flex flex-wrap gap-2">
				{CATEGORIES.map((category) => (
					<Button
						key={category}
						type="button"
						onClick={() => toggleCategory(category)}
						disabled={isSaving}
						size="sm"
						variant={
							selectedCategories.includes(category) ? 'primary' : 'secondary'
						}
						className={`h-auto rounded-full px-3 py-1.5 text-xs font-medium transition ${
							selectedCategories.includes(category)
								? 'bg-foreground text-background shadow-none'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
						}`}
					>
						{category}
					</Button>
				))}
			</div>
		</div>
	)
}
