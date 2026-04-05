'use client'

import { RequireAuth } from '@/features/auth/ui/RequireAuth'
import { SnippetForm } from '@/features/snippets/ui/SnippetForm'
import { SnippetFormSkeleton } from '@/features/snippets/ui/SnippetFormSkeleton'

export function NewSnippetPageClient() {
	return (
		<RequireAuth fallback={<SnippetFormSkeleton />}>
			<div className="mx-auto max-w-5xl px-4 py-8">
				<h1 className="mb-6 text-3xl font-bold">
					Create Snippet
					<span className="ml-2 hidden text-sm font-normal text-slate-500 sm:inline dark:text-slate-400">
						(Ctrl/Cmd+S to save)
					</span>
				</h1>
				<SnippetForm mode="create" />
			</div>
		</RequireAuth>
	)
}
