'use client'

import type { SnippetVisibility } from '../core/snippet.types'

type SnippetFormVisibilityProps = {
	visibility: SnippetVisibility
	setVisibility: (value: SnippetVisibility) => void
	isSaving: boolean
}

export function SnippetFormVisibility({
	visibility,
	setVisibility,
	isSaving,
}: SnippetFormVisibilityProps) {
	return (
		<div>
			<label className="block mb-2 font-medium">Visibility</label>
			<div className="flex gap-4">
				{(['private', 'public', 'shared'] as const).map((v) => (
					<label key={v} className="flex items-center gap-2">
						<input
							type="radio"
							name="visibility"
							value={v}
							checked={visibility === v}
							onChange={(e) =>
								setVisibility(e.target.value as SnippetVisibility)
							}
							disabled={isSaving}
							className="rounded border-default text-foreground focus:ring-foreground/20"
						/>
						<span className="text-sm capitalize">{v}</span>
					</label>
				))}
			</div>
			<p className="mt-1 text-xs text-gray-500">
				{visibility === 'private' && 'Only you can view this snippet'}
				{visibility === 'public' && 'Anyone can view this snippet'}
				{visibility === 'shared' && 'Share with specific users (coming soon)'}
			</p>
		</div>
	)
}
