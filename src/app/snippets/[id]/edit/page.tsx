import { RequireAuth } from '@/features/auth/ui/RequireAuth'
import { snippetService } from '@/features/snippets/snippet.server.container'
import { SnippetForm } from '@/features/snippets/ui/SnippetForm'
import { notFound } from 'next/navigation'

type Props = {
	params: Promise<{ id: string }>
}

export default async function EditSnippetPage({ params }: Props) {
	const { id } = await params
	const snippet = await snippetService.getById(id)

	if (!snippet) {
		notFound()
	}

	return (
		<RequireAuth>
			<div className="mx-auto max-w-4xl px-4 py-8">
				<h1 className="mb-6 text-3xl font-bold">Edit Snippet</h1>
				<SnippetForm mode="edit" snippet={snippet} />
			</div>
		</RequireAuth>
	)
}
