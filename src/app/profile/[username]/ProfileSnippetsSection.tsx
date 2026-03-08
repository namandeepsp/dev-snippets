'use client'

import type { SnippetListCursor } from '@/features/snippets/core/repositories/snippet.repository'
import { EmptySnippetsState } from '@/features/snippets/ui/EmptySnippetsState'
import { SnippetCard } from '@/features/snippets/ui/SnippetCard'
import { SnippetCardSkeleton } from '@/features/snippets/ui/SnippetCardSkeleton'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getProfileSnippetsPage } from './actions'

type Props = {
	username: string
	isOwnProfile: boolean
	initialSnippets: Awaited<ReturnType<typeof getProfileSnippetsPage>>['items']
	initialCursor: Awaited<
		ReturnType<typeof getProfileSnippetsPage>
	>['nextCursor']
	pageSize: number
}

export function ProfileSnippetsSection({
	username,
	isOwnProfile,
	initialSnippets,
	initialCursor,
	pageSize,
}: Props) {
	const [snippets, setSnippets] = useState(initialSnippets)
	const [cursor, setCursor] = useState<SnippetListCursor | null>(initialCursor)
	const [hasMore, setHasMore] = useState(Boolean(initialCursor))
	const [loadingMore, setLoadingMore] = useState(false)
	const sentinelRef = useRef<HTMLDivElement | null>(null)
	const isFetchingRef = useRef(false)
	const requestedCursorRef = useRef<Set<string>>(new Set())

	useEffect(() => {
		setSnippets(initialSnippets)
		setCursor(initialCursor)
		setHasMore(Boolean(initialCursor))
		setLoadingMore(false)
		isFetchingRef.current = false
		requestedCursorRef.current.clear()
	}, [initialCursor, initialSnippets, username])

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
			const page = await getProfileSnippetsPage({
				username,
				limit: pageSize,
				cursor,
			})

			setSnippets((prev) => {
				const existingIds = new Set(prev.map((snippet) => snippet.id))
				const uniqueNewItems = page.items.filter(
					(snippet) => !existingIds.has(snippet.id),
				)
				return [...prev, ...uniqueNewItems]
			})
			setCursor(page.nextCursor)
			setHasMore(Boolean(page.nextCursor))
		} finally {
			isFetchingRef.current = false
			setLoadingMore(false)
		}
	}, [cursor, hasMore, pageSize, username])

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

	if (snippets.length === 0) {
		return isOwnProfile ? (
			<EmptySnippetsState variant="own-profile" />
		) : (
			<EmptySnippetsState variant="other-profile" />
		)
	}

	return (
		<>
			<p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
				Loaded {snippets.length} snippet{snippets.length === 1 ? '' : 's'}
			</p>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{snippets.map((snippet) => (
					<SnippetCard key={snippet.id} snippet={snippet} />
				))}
			</div>

			{hasMore && <div ref={sentinelRef} className="h-6 w-full" />}

			{loadingMore && (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{[...Array(pageSize)].map((_, i) => (
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
	)
}
