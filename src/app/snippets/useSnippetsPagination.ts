import type { SnippetSortBy } from '@/features/snippets/core/repositories/snippet.repository'
import type { SnippetTechnology } from '@/features/snippets/core/snippet.types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getPublicSnippetsPage } from './actions'

const PAGE_SIZE = 5

export function useSnippetsPagination(
	sortBy: SnippetSortBy,
	showLikedOnly: boolean,
	selectedTechnologies: SnippetTechnology[],
) {
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
	const hasInitializedRef = useRef(false)
	const lastParamsRef = useRef<string>('')

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
				technologies:
					selectedTechnologies.length > 0 ? selectedTechnologies : undefined,
			})

			setSnippets(page.items)
			setCursor(page.nextCursor)
			setHasMore(Boolean(page.nextCursor))
		} finally {
			isFetchingRef.current = false
			setInitialLoading(false)
		}
	}, [sortBy, showLikedOnly, selectedTechnologies])

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
				technologies:
					selectedTechnologies.length > 0 ? selectedTechnologies : undefined,
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
	}, [cursor, hasMore, sortBy, showLikedOnly, selectedTechnologies])

	useEffect(() => {
		const currentParams = `${sortBy}::${showLikedOnly}::${selectedTechnologies.join(',')}`

		if (lastParamsRef.current !== currentParams) {
			lastParamsRef.current = currentParams
			hasInitializedRef.current = false
		}

		if (!hasInitializedRef.current) {
			hasInitializedRef.current = true
			loadFirstPage()
		}
	}, [sortBy, showLikedOnly, selectedTechnologies, loadFirstPage])

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

	return {
		snippets,
		initialLoading,
		loadingMore,
		hasMore,
		sentinelRef,
	}
}
