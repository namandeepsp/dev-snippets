'use client'

import { Button } from '@/shared/ui/design-system'
import { useRouter } from 'next/navigation'

type SnippetFormActionsProps = {
	mode: 'create' | 'edit'
	canSubmit: boolean
	isSaving: boolean
}

export function SnippetFormActions({
	mode,
	canSubmit,
	isSaving,
}: SnippetFormActionsProps) {
	const router = useRouter()

	return (
		<div className="flex items-center gap-4 pt-4">
			<Button
				type="submit"
				disabled={!canSubmit}
				isLoading={isSaving}
				size="md"
				className="bg-linear-to-r from-sky-500 to-blue-500 px-6 text-white shadow-lg shadow-blue-600/30 hover:from-sky-600 hover:to-blue-600"
			>
				{mode === 'edit' ? 'Update Snippet' : 'Create Snippet'}
			</Button>

			<Button
				type="button"
				onClick={() => router.back()}
				disabled={isSaving}
				variant="outline"
				size="md"
				className="border-gray-300 bg-white px-6 text-slate-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
			>
				Cancel
			</Button>
		</div>
	)
}
