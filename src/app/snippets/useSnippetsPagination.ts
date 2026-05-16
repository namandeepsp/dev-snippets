import type { SnippetSortBy } from '@/features/snippets/core/repositories/snippet.repository'
import type { SnippetTechnology } from '@/features/snippets/core/snippet.types'
import { queryKeys } from '@/shared/hooks/query-keys'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { getPublicSnippetsPage } from './actions'

const PAGE_SIZE = 5

export function useSnippetsPagination(
	sortBy: SnippetSortBy,
	showLikedOnly: boolean,
	selectedTechnologies: SnippetTechnology[],
) {
	const sentinelRef = useRef<HTMLDivElement | null>(null)

	const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
		useInfiniteQuery({
			queryKey: queryKeys.snippets.publicList(
				sortBy,
				showLikedOnly,
				selectedTechnologies,
			),
			queryFn: ({ pageParam }) =>
				getPublicSnippetsPage({
					sortBy,
					limit: PAGE_SIZE,
					cursor: pageParam,
					likedOnly: showLikedOnly,
					technologies:
						selectedTechnologies.length > 0 ? selectedTechnologies : undefined,
				}),
			initialPageParam: null as Awaited<
				ReturnType<typeof getPublicSnippetsPage>
			>['nextCursor'],
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		})

	const snippets = data?.pages.flatMap((p) => p.items) ?? []
	const initialLoading =
		isFetching && !isFetchingNextPage && snippets.length === 0

	useEffect(() => {
		const node = sentinelRef.current
		if (!node) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					void fetchNextPage()
				}
			},
			{ rootMargin: '0px 0px 24px 0px', threshold: 0.9 },
		)

		observer.observe(node)
		return () => observer.disconnect()
	}, [fetchNextPage, hasNextPage, isFetchingNextPage])

	return {
		snippets,
		initialLoading,
		loadingMore: isFetchingNextPage,
		hasMore: Boolean(hasNextPage),
		sentinelRef,
	}
}
