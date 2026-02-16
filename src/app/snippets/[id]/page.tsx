import { getCurrentServerUser } from '@/features/auth/auth.server.container'
import type { EnrichedSnippet } from '@/features/snippets/core/snippet.types'
import { snippetService } from '@/features/snippets/snippet.server.container'
import { SnippetViewer } from '@/features/snippets/ui/SnippetViewer'
import { userService } from '@/features/user/user.container'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'

type Props = {
	params: Promise<{
		id: string
	}>
}

/**
 * ============================================================================
 * SNIPPET DETAIL PAGE
 * ============================================================================
 *
 * Server Component that displays a single snippet with full details.
 *
 * Handles:
 * - Public snippets - Anyone can view
 * - Private snippets - Only owner can view
 * - Shared snippets - Not yet implemented
 * - View counting - Incremented on each view
 * - Author enrichment - Full author profile
 */

// Cache the snippet fetch within the same request
const getSnippet = cache(async (id: string) => {
	return snippetService.getById(id)
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
	// Public snippets - anyone can view
	if (snippet.visibility === 'public') {
		return true
	}

	// Private snippets - only owner
	if (snippet.visibility === 'private') {
		return userId === snippet.ownerId
	}

	// Shared snippets - TODO: implement shared list
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

	// 1. Fetch snippet
	const snippet = await getSnippet(id)

	if (!snippet) {
		notFound()
	}

	// 2. Check authentication for private snippets
	let currentUser = null

	try {
		currentUser = await getCurrentServerUser()
	} catch {
		// Invalid session, continue as guest
	}

	// 3. Authorize access
	const isAuthorized = await checkAuthorization(snippet, currentUser?.id)

	if (!isAuthorized) {
		// Redirect to login with return URL
		const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_APP_URL)
		loginUrl.searchParams.set('redirect', `/snippets/${id}`)
		redirect(loginUrl.toString())
	}

	// 4. Increment view count (fire-and-forget, don't await)
	snippetService.incrementViews(id).catch(console.error)

	// 5. Fetch author profile
	const [author] = await Promise.all([
		userService.getPublicProfile(snippet.ownerId),
		// Add more parallel fetches here (likes, comments, etc.)
	])

	// 6. Enrich snippet with author data
	const enrichedSnippet: EnrichedSnippet = {
		...snippet,
		author: author || {
			id: snippet.ownerId,
			username: snippet.ownerId,
			name: snippet.ownerName,
			avatarUrl: null,
		},
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			{/* Breadcrumbs */}
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

			{/* Snippet Viewer */}
			<SnippetViewer snippet={enrichedSnippet} />

			{/* Edit Button - Only for owner */}
			{currentUser?.id === snippet.ownerId && (
				<div className="mt-8 flex justify-end">
					<a
						href={`/snippets/${snippet.id}/edit`}
						className="rounded-md border border-default px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
					>
						Edit Snippet
					</a>
				</div>
			)}
		</div>
	)
}
