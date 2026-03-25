'use client'

import { SNIPPET_TITLE_MAX_LENGTH } from '../core/snippet.types'

type SnippetFormTitleDescriptionProps = {
	title: string
	setTitle: (title: string) => void
	description: string
	setDescription: (description: string) => void
	isSaving: boolean
	titleLength: number
}

export function SnippetFormTitleDescription({
	title,
	setTitle,
	description,
	setDescription,
	isSaving,
	titleLength,
}: SnippetFormTitleDescriptionProps) {
	return (
		<div className="space-y-4">
			<div>
				<label htmlFor="title" className="block mb-2 font-medium">
					Title <span className="text-red-500">*</span>
				</label>
				<input
					id="title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g., React useState Hook Example"
					className="w-full rounded-lg border border-default bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-foreground/20"
					disabled={isSaving}
					name="title"
					maxLength={SNIPPET_TITLE_MAX_LENGTH}
					required
				/>
				<p className="mt-1 text-right text-xs text-gray-500">
					{titleLength}/{SNIPPET_TITLE_MAX_LENGTH}
				</p>
			</div>

			<div>
				<label htmlFor="description" className="block mb-2 font-medium">
					Description
				</label>
				<textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Briefly describe what this snippet does..."
					rows={3}
					className="w-full min-h-32 field-sizing-content rounded-lg border border-default bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-foreground/20"
					name="description"
					disabled={isSaving}
				/>
			</div>
		</div>
	)
}
