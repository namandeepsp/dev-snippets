import { getCurrentServerUser } from '@/features/auth/auth.server.container'
import { RequireAuth } from '@/features/auth/ui/RequireAuth'
import { snippetService } from '@/features/snippets/snippet.server.container'
import { SnippetForm } from '@/features/snippets/ui/SnippetForm'
import { SnippetFormSkeleton } from '@/features/snippets/ui/SnippetFormSkeleton'
import { notFound, redirect } from 'next/navigation'

type Props = {
	params: Promise<{ id: string }>
}

export default async function EditSnippetPage({ params }: Props) {
	const { id } = await params

	let currentUser = null
	try {
		currentUser = await getCurrentServerUser()
	} catch {
		redirect(`/login?redirect=/snippets/${id}/edit`)
	}

	const snippet = await snippetService.getById(id)

	if (!snippet) {
		notFound()
	}

	if (snippet.ownerId !== currentUser?.id) {
		redirect(`/snippets/${id}`)
	}

	return (
		<RequireAuth fallback={<SnippetFormSkeleton maxWidth="max-w-4xl" />}>
			<div className="mx-auto max-w-4xl px-4 py-8">
				<h1 className="mb-6 text-3xl font-bold">
					Edit Snippet
					<span className="ml-2 hidden text-sm font-normal text-slate-500 sm:inline dark:text-slate-400">
						(Ctrl/Cmd+S to save)
					</span>
				</h1>
				<SnippetForm mode="edit" snippet={snippet} />
			</div>
		</RequireAuth>
	)
}
