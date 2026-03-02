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

	// 1. Check authentication
	let currentUser = null
	try {
		currentUser = await getCurrentServerUser()
		console.log('Current user:', currentUser)
	} catch {
		// Not authenticated - redirect to login
		redirect(`/login?redirect=/snippets/${id}/edit`)
	}

	// 2. Fetch snippet
	const snippet = await snippetService.getById(id)

	if (!snippet) {
		notFound()
	}

	// 3. Check ownership
	if (snippet.ownerId !== currentUser?.id) {
		// Not the owner - redirect to view page
		redirect(`/snippets/${id}`)
	}

	return (
		<RequireAuth fallback={<SnippetFormSkeleton maxWidth="max-w-4xl" />}>
			<div className="mx-auto max-w-4xl px-4 py-8">
				<h1 className="mb-6 text-3xl font-bold">Edit Snippet</h1>
				<SnippetForm mode="edit" snippet={snippet} />
			</div>
		</RequireAuth>
	)
}
