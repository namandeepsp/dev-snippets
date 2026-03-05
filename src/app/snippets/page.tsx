'use client'

import { useAuth } from '@/features/auth/ui/store/auth.store'
import type { SnippetSortBy } from '@/features/snippets/core/repositories/snippet.repository'
import { EmptySnippetsState } from '@/features/snippets/ui/EmptySnippetsState'
import { SnippetCard } from '@/features/snippets/ui/SnippetCard'
import { SnippetCardSkeleton } from '@/features/snippets/ui/SnippetCardSkeleton'
import { Select } from '@/shared/ui/design-system'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { Tooltip } from 'react-tooltip'
import { getPublicSnippetsPage } from './actions'

const PAGE_SIZE = 5

function SnippetsPageContent() {
	const { user } = useAuth()
	const router = useRouter()
	const searchParams = useSearchParams()

	const sortBy = (searchParams.get('sort') as SnippetSortBy) || 'latest'
	const showLikedOnly = searchParams.get('liked') === 'true'

	const [snippets, setSnippets] = useState<
		Awaited<ReturnType<typeof getPublicSnippetsPage>>['items']
	>([])
	const [initialLoading, setInitialLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const [cursor, setCursor] =
		useState<Awaited<ReturnType<typeof getPublicSnippetsPage>>['nextCursor']>(
			null,
		)
	const sentinelRef = useRef<HTMLDivElement | null>(null)
	const isFetchingRef = useRef(false)
	const requestedCursorRef = useRef<Set<string>>(new Set())

	const updateURL = useCallback(
		(newSort?: SnippetSortBy, newLiked?: boolean) => {
			const params = new URLSearchParams()
			const sort = newSort ?? sortBy
			const liked = newLiked ?? showLikedOnly

			if (sort !== 'latest') params.set('sort', sort)
			if (liked) params.set('liked', 'true')

			const query = params.toString()
			router.push(`/snippets${query ? `?${query}` : ''}`, { scroll: false })
		},
		[router, sortBy, showLikedOnly],
	)

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
				likedOnly: showLikedOnly,
			})

			setSnippets(page.items)
			setCursor(page.nextCursor)
			setHasMore(Boolean(page.nextCursor))
		} finally {
			isFetchingRef.current = false
			setInitialLoading(false)
		}
	}, [sortBy, showLikedOnly])

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
				likedOnly: showLikedOnly,
			})

			setSnippets((prev) => {
				const existingIds = new Set(prev.map((item) => item.id))
				const uniqueNewItems = page.items.filter(
					(item) => !existingIds.has(item.id),
				)
				return [...prev, ...uniqueNewItems]
			})
			setCursor(page.nextCursor)
			setHasMore(Boolean(page.nextCursor))
		} finally {
			isFetchingRef.current = false
			setLoadingMore(false)
		}
	}, [cursor, hasMore, sortBy, showLikedOnly])

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
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">
						Community Snippets
					</h1>
					<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
						Discover reusable code snippets shared by the community
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 sm:items-center">
					{user && (
						<>
							<span
								className="cursor-pointer"
								data-tooltip-id="liked-filter"
								data-tooltip-content={
									showLikedOnly
										? 'Show all snippets'
										: 'Show liked snippets only'
								}
								onClick={() => updateURL(undefined, !showLikedOnly)}
							>
								{showLikedOnly ? (
									<AiFillHeart className="w-6 h-6 text-red-500" />
								) : (
									<AiOutlineHeart className="w-6 h-6" />
								)}
							</span>
							<Tooltip id="liked-filter" place="bottom" />
						</>
					)}

					<Select
						uiSize="sm"
						className="min-w-40 w-full"
						value={sortBy}
						onChange={(e) =>
							updateURL(e.target.value as SnippetSortBy, undefined)
						}
					>
						<option value="latest">Latest</option>
						<option value="oldest">Oldest</option>
						<option value="views">Most Viewed</option>
						<option value="title">Title (A-Z)</option>
					</Select>
				</div>
			</div>

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

export default function SnippetsPage() {
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
