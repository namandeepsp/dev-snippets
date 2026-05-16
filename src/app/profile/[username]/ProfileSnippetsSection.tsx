'use client'

import { EmptySnippetsState } from '@/features/snippets/ui/EmptySnippetsState'
import { SnippetCard } from '@/features/snippets/ui/SnippetCard'
import { SnippetCardSkeleton } from '@/features/snippets/ui/SnippetCardSkeleton'
import { queryKeys } from '@/shared/hooks/query-keys'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
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
	const sentinelRef = useRef<HTMLDivElement | null>(null)

	const { data, isFetchingNextPage, fetchNextPage, hasNextPage } =
		useInfiniteQuery({
			queryKey: queryKeys.profile.snippets(username),
			queryFn: ({ pageParam }) =>
				getProfileSnippetsPage({
					username,
					limit: pageSize,
					cursor: pageParam,
				}),
			initialPageParam: null as Awaited<
				ReturnType<typeof getProfileSnippetsPage>
			>['nextCursor'],
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialData: {
				pages: [{ items: initialSnippets, nextCursor: initialCursor }],
				pageParams: [null],
			},
		})

	const snippets = data.pages.flatMap((p) => p.items)

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
					<SnippetCard
						key={snippet.id}
						snippet={snippet}
						showEditButton={isOwnProfile}
					/>
				))}
			</div>

			{hasNextPage && <div ref={sentinelRef} className="h-6 w-full" />}

			{isFetchingNextPage && (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{[...Array(pageSize)].map((_, i) => (
						<SnippetCardSkeleton key={`loading-${i}`} />
					))}
				</div>
			)}

			{!hasNextPage && snippets.length > 0 && (
				<p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
					No more snippets to load.
				</p>
			)}
		</>
	)
}
