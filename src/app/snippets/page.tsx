'use client'

import { SnippetCard } from '@/features/snippets/ui/SnippetCard'
import { EqualizerLoader, Select } from '@/shared/ui/design-system'
import type { SnippetSortBy } from '@/features/snippets/core/repositories/snippet.repository'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getPublicSnippetsPage } from './actions'

const PAGE_SIZE = 5

export default function SnippetsPage() {
	const [snippets, setSnippets] = useState<
		Awaited<ReturnType<typeof getPublicSnippetsPage>>['items']
	>([])
	const [initialLoading, setInitialLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const [cursor, setCursor] = useState<
		Awaited<ReturnType<typeof getPublicSnippetsPage>>['nextCursor']
	>(null)
	const [sortBy, setSortBy] = useState<SnippetSortBy>('latest')
	const sentinelRef = useRef<HTMLDivElement | null>(null)
	const isFetchingRef = useRef(false)
	const requestedCursorRef = useRef<Set<string>>(new Set())

	const loadFirstPage = useCallback(async () => {
		setInitialLoading(true)
		setLoadingMore(false)
		setHasMore(true)
		setCursor(null)
		requestedCursorRef.current.clear()
		isFetchingRef.current = true

		try {
			const page = await getPublicSnippetsPage({
				sortBy,
				limit: PAGE_SIZE,
				cursor: null,
			})

			setSnippets(page.items)
			setCursor(page.nextCursor)
			setHasMore(Boolean(page.nextCursor))
		} finally {
			isFetchingRef.current = false
			setInitialLoading(false)
		}
	}, [sortBy])

	const loadMore = useCallback(async () => {
		if (!hasMore || !cursor || isFetchingRef.current) {
			return
		}

		const cursorKey = `${String(cursor.sortValue)}::${cursor.id}`
		if (requestedCursorRef.current.has(cursorKey)) {
			return
		}
		requestedCursorRef.current.add(cursorKey)

		setLoadingMore(true)
		isFetchingRef.current = true

		try {
			const page = await getPublicSnippetsPage({
				sortBy,
				limit: PAGE_SIZE,
				cursor,
			})

			setSnippets((prev) => {
				const existingIds = new Set(prev.map((item) => item.id))
				const uniqueNewItems = page.items.filter((item) => !existingIds.has(item.id))
				return [...prev, ...uniqueNewItems]
			})
			setCursor(page.nextCursor)
			setHasMore(Boolean(page.nextCursor))
		} finally {
			isFetchingRef.current = false
			setLoadingMore(false)
		}
	}, [cursor, hasMore, sortBy])

	useEffect(() => {
		loadFirstPage()
	}, [loadFirstPage])

	useEffect(() => {
		const node = sentinelRef.current
		if (!node) return

		const observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0]
				if (first?.isIntersecting) {
					void loadMore()
				}
			},
			{
				rootMargin: '0px 0px 24px 0px',
				threshold: 0.9,
			},
		)

		observer.observe(node)
		return () => observer.disconnect()
	}, [loadMore])

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight mb-2">
						Public Snippets
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Discover reusable code snippets shared by the community
					</p>
				</div>

				<Select
					uiSize="sm"
					className="min-w-40"
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value as SnippetSortBy)}
				>
					<option value="latest">Latest</option>
					<option value="oldest">Oldest</option>
					<option value="views">Most Viewed</option>
					<option value="title">Title (A-Z)</option>
				</Select>
			</div>

			{initialLoading ? (
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
			) : snippets.length === 0 ? (
				<div className="rounded-lg border border-dashed border-default p-16 text-center">
					<h3 className="text-lg font-medium mb-2">No snippets yet</h3>
					<p className="text-gray-600 dark:text-gray-400">
						Be the first to share a code snippet with the community!
					</p>
				</div>
			) : (
				<>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{snippets.map((snippet) => (
							<SnippetCard key={snippet.id} snippet={snippet} showAuthor />
						))}
					</div>

					{hasMore && <div ref={sentinelRef} className="h-10 w-full" />}

					{loadingMore && (
						<EqualizerLoader />
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
