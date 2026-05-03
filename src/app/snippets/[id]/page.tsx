import { getCurrentServerUser } from '@/features/auth/auth.server.container'
import type { EnrichedSnippet } from '@/features/snippets/core/snippet.types'
import { snippetService } from '@/features/snippets/snippet.server.container'
import { SnippetViewer } from '@/features/snippets/ui/SnippetViewer'
import { userService } from '@/features/user/user.container'
import { logger } from '@/shared/utils/logger'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'

type Props = {
	params: Promise<{
		id: string
	}>
}

const getSnippet = cache(async (id: string) => {
	return snippetService.getByIdWithoutVersions(id)
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params
	const snippet = await getSnippet(id)

	if (!snippet) {
		return {
			title: 'Snippet Not Found - DevSnippets',
		}
	}

	return {
		title: `${snippet.title} - DevSnippets`,
		description: snippet.description || 'View code snippet on DevSnippets',
		alternates: {
			canonical: `/snippets/${id}`,
		},
		robots:
			snippet.visibility === 'public'
				? { index: true, follow: true }
				: { index: false, follow: false },
		openGraph: {
			title: snippet.title,
			description: snippet.description || 'Code snippet',
			type: 'article',
			publishedTime: new Date(snippet.createdAt).toISOString(),
			modifiedTime: new Date(snippet.updatedAt).toISOString(),
			tags: snippet.technologies,
		},
	}
}

async function checkAuthorization(snippet: any, userId?: string) {
	if (snippet.visibility === 'public') {
		return true
	}

	if (snippet.visibility === 'private') {
		return userId === snippet.ownerId
	}

	if (snippet.visibility === 'shared') {
		return (
			userId === snippet.ownerId ||
			(userId && snippet.sharedWith?.includes(userId))
		)
	}

	return false
}

export default async function SnippetPage({ params }: Props) {
	const { id } = await params

	const snippet = await getSnippet(id)

	if (!snippet) {
		notFound()
	}

	let currentUser = null

	try {
		currentUser = await getCurrentServerUser()
	} catch {}

	const isAuthorized = await checkAuthorization(snippet, currentUser?.id)

	if (!isAuthorized) {
		if (!currentUser) {
			redirect(`/login?redirect=/snippets/${id}`)
		}
		notFound()
	}

	snippetService.incrementViews(id).catch((err) =>
		logger.error('Failed to increment views', {
			error: err instanceof Error ? err.message : 'Unknown error',
		}),
	)

	const [author, isLikedByUser] = await Promise.all([
		userService.getUserById(snippet.ownerId),
		currentUser?.id
			? snippetService.checkLikeStatus(id, currentUser.id)
			: Promise.resolve(false),
	])

	const enrichedSnippet: EnrichedSnippet = {
		...snippet,
		author: author || {
			id: snippet.ownerId,
			username: 'unknown',
			name: snippet.ownerName,
			avatarUrl: null,
		},
		isLikedByUser,
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			<nav className="mb-6 text-sm">
				<ol className="flex items-center gap-2">
					<li>
						<a href="/snippets" className="text-gray-500 hover:text-foreground">
							Snippets
						</a>
					</li>
					<li className="text-gray-500">/</li>
					<li className="text-foreground truncate">{snippet.title}</li>
				</ol>
			</nav>

			<SnippetViewer snippet={enrichedSnippet} />
		</div>
	)
}
