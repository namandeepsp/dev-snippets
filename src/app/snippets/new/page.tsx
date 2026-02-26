'use client'

import { RequireAuth } from '@/features/auth/ui/RequireAuth'
import { SnippetForm } from '@/features/snippets/ui/SnippetForm'

export default function NewSnippetPage() {
	return (
		<RequireAuth>
			<div className="mx-auto max-w-5xl px-4 py-8">
				<h1 className="mb-6 text-3xl font-bold">Create Snippet</h1>
				<SnippetForm mode="create" />
			</div>
		</RequireAuth>
	)
}
