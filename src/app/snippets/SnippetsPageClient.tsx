'use client'

import { EmptySnippetsState } from '@/features/snippets/ui/EmptySnippetsState'
import { SnippetCard } from '@/features/snippets/ui/SnippetCard'
import { SnippetCardSkeleton } from '@/features/snippets/ui/SnippetCardSkeleton'
import { Suspense } from 'react'
import { SnippetsHeader } from './SnippetsHeader'
import { useSnippetsFilters } from './useSnippetsFilters'
import { useSnippetsPagination } from './useSnippetsPagination'

const PAGE_SIZE = 5

function SnippetsPageContent() {
	const {
		sortBy,
		showLikedOnly,
		selectedTechnologies,
		updateURL,
		toggleTechnology,
		clearTechnologies,
	} = useSnippetsFilters()

	const { snippets, initialLoading, loadingMore, hasMore, sentinelRef } =
		useSnippetsPagination(sortBy, showLikedOnly, selectedTechnologies)

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<SnippetsHeader
				sortBy={sortBy}
				showLikedOnly={showLikedOnly}
				selectedTechnologies={selectedTechnologies}
				onSortChange={(sort) => updateURL(sort, undefined)}
				onLikedToggle={(liked) => updateURL(undefined, liked)}
				onTechnologyToggle={toggleTechnology}
				onClearTechnologies={clearTechnologies}
			/>

			{initialLoading ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<SnippetCardSkeleton key={i} />
					))}
				</div>
			) : snippets.length === 0 ? (
				showLikedOnly ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
							You haven't liked any snippets yet
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-500">
							Explore community snippets and like the ones you find useful
						</p>
					</div>
				) : (
					<EmptySnippetsState variant="community" />
				)
			) : (
				<>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{snippets.map((snippet) => (
							<SnippetCard key={snippet.id} snippet={snippet} showAuthor />
						))}
					</div>

					{hasMore && <div ref={sentinelRef} className="h-6 w-full" />}

					{loadingMore && (
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{[...Array(PAGE_SIZE)].map((_, i) => (
								<SnippetCardSkeleton key={`loading-${i}`} />
							))}
						</div>
					)}

					{!hasMore && snippets.length > 0 && (
						<p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
							No more snippets to load.
						</p>
					)}
				</>
			)}
		</div>
	)
}

export function SnippetsPageClient() {
	return (
		<Suspense
			fallback={
				<div className="mx-auto max-w-6xl px-4 py-8">
					<div className="mb-8">
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">
							Community Snippets
						</h1>
						<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
							Discover reusable code snippets shared by the community
						</p>
					</div>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[...Array(6)].map((_, i) => (
							<SnippetCardSkeleton key={i} />
						))}
					</div>
				</div>
			}
		>
			<SnippetsPageContent />
		</Suspense>
	)
}
