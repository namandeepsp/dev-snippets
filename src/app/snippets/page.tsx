import { snippetService } from '@/features/snippets/snippet.server.container'
import { SnippetCard } from '@/features/snippets/ui/SnippetCard'
import { userService } from '@/features/user/user.container'
import { Select } from '@/shared/ui/design-system'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
	title: 'Public Snippets - DevSnippets',
	description: 'Discover and explore code snippets from the community',
}

/**
 * ============================================================================
 * SNIPPETS PAGE
 * ============================================================================
 *
 * Server Component that displays all public snippets with author information.
 *
 * Why Server Component?
 * - Public data - No client state needed
 * - SEO - Snippets should be indexable
 * - Performance - Direct database access, parallel queries
 * - Streaming - Can use Suspense for progressive loading
 */

// Loading skeleton for streaming
function SnippetsSkeleton() {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{[...Array(6)].map((_, i) => (
				<div
					key={i}
					className="rounded-lg border border-default p-4 animate-pulse"
				>
					<div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
					<div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
					<div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
					<div className="flex gap-2">
						<div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
						<div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
					</div>
				</div>
			))}
		</div>
	)
}

// Async component that fetches and enriches snippets
async function SnippetsGrid() {
	// 1. Fetch all public snippets
	const snippets = await snippetService.listPublic()

	if (snippets.length === 0) {
		return (
			<div className="rounded-lg border border-dashed border-default p-16 text-center">
				<h3 className="text-lg font-medium mb-2">No snippets yet</h3>
				<p className="text-gray-600 dark:text-gray-400">
					Be the first to share a code snippet with the community!
				</p>
			</div>
		)
	}

	// 2. Get unique author IDs
	const authorIds = [...new Set(snippets.map((s) => s.ownerId))]

	// 3. Fetch all authors in parallel
	const authors = await userService.getUsersByIds(authorIds)

	// 4. Enrich snippets with author data
	const enrichedSnippets = snippets.map((snippet) => ({
		...snippet,
		author: authors[snippet.ownerId] || {
			id: snippet.ownerId,
			username: 'unknown',
			name: snippet.ownerName,
			avatarUrl: null,
		},
	}))

	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{enrichedSnippets.map((snippet) => (
				<SnippetCard
					key={snippet.id}
					snippet={snippet}
					showAuthor // We'll add this prop to show author info
				/>
			))}
		</div>
	)
}

export default async function SnippetsPage() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight mb-2">
						Public Snippets
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Discover reusable code snippets shared by the community
					</p>
				</div>

				{/* Filter/Sort - To be implemented */}
				<div className="flex gap-2">
					<Select uiSize="sm" className="min-w-40">
						<option>Latest</option>
						<option>Most viewed</option>
						<option>Most liked</option>
					</Select>
				</div>
			</div>

			{/* Snippets Grid with Streaming */}
			<Suspense fallback={<SnippetsSkeleton />}>
				<SnippetsGrid />
			</Suspense>
		</div>
	)
}
