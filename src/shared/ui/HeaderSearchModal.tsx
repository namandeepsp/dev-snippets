'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import type { SnippetSortBy } from '@/features/snippets/core/repositories/snippet.repository'
import type { SnippetTechnology } from '@/features/snippets/core/snippet.types'
import { searchSnippetsAction } from '@/features/snippets/snippet.actions'
import {
	type RecentSnippet,
	clearRecentSnippets,
	getRecentSnippets,
	removeRecentSnippet,
} from '@/features/snippets/ui/recent-snippets'
import { TECHNOLOGY_OPTIONS } from '@/features/technologies/technologies.config'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { Button, Select, Skeleton } from '@/shared/ui/design-system'
import { formatDate } from '@/shared/utils/date'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LuFilter, LuSearch, LuX } from 'react-icons/lu'

type SearchScope = 'public' | 'mine' | 'all-visible'
type SearchResult = NonNullable<
	Awaited<ReturnType<typeof searchSnippetsAction>>['data']
>[number]

type Props = {
	open: boolean
	onClose: () => void
}

function SearchResultsSkeleton() {
	return (
		<div className="space-y-2">
			{Array.from({ length: 3 }).map((_, index) => (
				<div
					key={`search-skeleton-${index}`}
					className="rounded-lg border border-default px-3 py-2"
				>
					<div className="space-y-2">
						<Skeleton className="h-4 w-2/3" />
						<div className="flex items-center justify-between gap-2">
							<Skeleton className="h-3 w-1/3" />
							<Skeleton className="h-3 w-12" />
						</div>
					</div>
				</div>
			))}
		</div>
	)
}

export function HeaderSearchModal({ open, onClose }: Props) {
	const { user } = useAuth()
	const [mounted, setMounted] = useState(false)
	const [query, setQuery] = useState('')
	const [technology, setTechnology] = useState<SnippetTechnology | 'all'>('all')
	const [sortBy, setSortBy] = useState<SnippetSortBy>('latest')
	const [scope, setScope] = useState<SearchScope>('public')
	const [results, setResults] = useState<SearchResult[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [searchError, setSearchError] = useState<string | null>(null)
	const [recent, setRecent] = useState<RecentSnippet[]>([])
	const [showFilters, setShowFilters] = useState(false)
	const [isSearchAreaFocused, setIsSearchAreaFocused] = useState(false)
	const latestRequestRef = useRef(0)
	const filtersRef = useRef<HTMLDivElement>(null)
	const queryRef = useRef<HTMLInputElement>(null)
	const searchAreaRef = useRef<HTMLDivElement>(null)
	const debouncedQuery = useDebounce(query, 250)

	const shouldSearch = useMemo(() => {
		return (
			query.trim().length > 0 ||
			technology !== 'all' ||
			sortBy !== 'latest' ||
			scope !== 'public'
		)
	}, [query, technology, sortBy, scope])
	const activeFilterCount = useMemo(() => {
		let count = 0
		if (technology !== 'all') count += 1
		if (sortBy !== 'latest') count += 1
		if (scope !== 'public') count += 1
		return count
	}, [technology, sortBy, scope])

	const loadRecent = useCallback(() => {
		setRecent(getRecentSnippets())
	}, [])

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		if (!open) return
		queryRef.current?.focus()
		loadRecent()
		setIsSearchAreaFocused(true)
	}, [open, loadRecent])

	useEffect(() => {
		if (!open) return

		function onEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		globalThis.addEventListener('keydown', onEscape)
		return () => globalThis.removeEventListener('keydown', onEscape)
	}, [open, onClose])

	useEffect(() => {
		if (!open || !shouldSearch) {
			setResults([])
			setSearchError(null)
			setIsSearching(false)
			return
		}

		let cancelled = false
		const requestId = latestRequestRef.current + 1
		latestRequestRef.current = requestId
		setIsSearching(true)
		setSearchError(null)

		const timeoutId = setTimeout(async () => {
			const response = await searchSnippetsAction({
				query: debouncedQuery,
				technology,
				sortBy,
				scope,
				limit: 8,
			})

			if (cancelled || requestId !== latestRequestRef.current) {
				return
			}

			if (!response.success) {
				setSearchError(response.error || 'Search failed')
				setResults([])
				setIsSearching(false)
				return
			}

			setResults(response.data || [])
			setIsSearching(false)
		}, 250)

		return () => {
			cancelled = true
			clearTimeout(timeoutId)
		}
	}, [open, shouldSearch, debouncedQuery, technology, sortBy, scope])

	useEffect(() => {
		if (!user && scope !== 'public') {
			setScope('public')
		}
	}, [scope, user])

	if (!open || !mounted) return null

	const showRecent =
		isSearchAreaFocused &&
		query.trim().length === 0 &&
		(user ? recent : recent.slice(0, 2)).length > 0
	const displayedRecent = user ? recent : recent.slice(0, 2)

	function handleDeleteRecent(snippetId: string) {
		removeRecentSnippet(snippetId)
		setRecent((prev) => prev.filter((item) => item.id !== snippetId))
	}

	function handleClearRecent() {
		clearRecentSnippets()
		setRecent([])
	}

	return createPortal(
		<div
			className="fixed inset-0 z-120 bg-slate-900/20 p-4 backdrop-blur-md dark:bg-slate-900/35"
			onClick={onClose}
		>
			<div
				className="mx-auto mt-14 w-full max-w-2xl rounded-2xl border border-default bg-background/95 p-4 text-foreground shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:shadow-slate-900/30"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-3 flex items-center justify-between gap-2">
					<h2 className="text-base font-semibold">
						Search Snippets
						<span className="ml-2 text-xs font-medium text-foreground/60">
							(Ctrl/Cmd + K)
						</span>
					</h2>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-8 w-8 rounded-lg p-0"
						onClick={onClose}
						aria-label="Close search"
					>
						<LuX className="h-4 w-4" />
					</Button>
				</div>

				<div
					ref={searchAreaRef}
					onFocus={() => setIsSearchAreaFocused(true)}
					onBlur={(event) => {
						if (!event.currentTarget.contains(event.relatedTarget as Node)) {
							setIsSearchAreaFocused(false)
							setShowFilters(false)
						}
					}}
				>
					<form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
						<div className="flex items-center gap-2">
							<div className="relative flex-1">
								<LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
								<input
									ref={queryRef}
									type="text"
									value={query}
									onFocus={loadRecent}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search by title, description, technology..."
									className="h-11 w-full rounded-xl border border-default bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
								/>
							</div>

							<div ref={filtersRef} tabIndex={-1} className="relative">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className={`h-11 rounded-xl ${activeFilterCount > 0 ? 'border-blue-400 text-blue-600 dark:border-blue-500 dark:text-blue-300' : ''}`}
									onClick={() => setShowFilters((prev) => !prev)}
								>
									<LuFilter className="h-4 w-4" />
									<span className="max-sm:hidden">Filters</span>
									{activeFilterCount > 0 && (
										<span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white dark:bg-blue-500">
											{activeFilterCount}
										</span>
									)}
								</Button>

								{showFilters && (
									<div className="absolute right-0 top-12 z-20 w-72 rounded-xl border border-default bg-background p-3 text-foreground shadow-xl">
										<div className="mb-2">
											<label className="mb-1 block text-xs font-medium text-foreground/65">
												Technology
											</label>
											<Select
												uiSize="sm"
												value={technology}
												onChange={(e) =>
													setTechnology(
														e.target.value as SnippetTechnology | 'all',
													)
												}
												className="w-full"
											>
												<option value="all">All technologies</option>
												{TECHNOLOGY_OPTIONS.map((item) => (
													<option key={item.value} value={item.value}>
														{item.label}
													</option>
												))}
											</Select>
										</div>

										<div className="mb-2">
											<label className="mb-1 block text-xs font-medium text-foreground/65">
												Sort
											</label>
											<Select
												uiSize="sm"
												value={sortBy}
												onChange={(e) =>
													setSortBy(e.target.value as SnippetSortBy)
												}
												className="w-full"
											>
												<option value="latest">Latest</option>
												<option value="oldest">Oldest</option>
												<option value="views">Most viewed</option>
												<option value="title">Title (A-Z)</option>
											</Select>
										</div>

										<div>
											<label className="mb-1 block text-xs font-medium text-foreground/65">
												Scope
											</label>
											<Select
												uiSize="sm"
												value={scope}
												onChange={(e) =>
													setScope(e.target.value as SearchScope)
												}
												className="w-full"
											>
												<option value="public">Public snippets</option>
												{user && (
													<option value="all-visible">
														Public + my snippets
													</option>
												)}
												{user && <option value="mine">My snippets only</option>}
											</Select>
										</div>
									</div>
								)}
							</div>
						</div>
					</form>

					<div className="mt-3 max-h-[60vh] overflow-auto">
						{showRecent && !shouldSearch && (
							<div>
								<div className="mb-2 flex items-center justify-between gap-2">
									<p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
										Recent snippets
									</p>
									<Button
										type="button"
										onClick={handleClearRecent}
										variant="ghost"
										className="text-xs font-medium text-foreground/60 transition hover:text-foreground hover:bg-transparent!"
									>
										Clear all
									</Button>
								</div>
								<div className="space-y-2">
									{displayedRecent.map((item) => (
										<div key={item.id} className="group relative">
											<Link
												href={`/snippets/${item.id}`}
												onClick={onClose}
												className="block rounded-lg border border-default px-3 py-2 pr-10 transition hover:bg-foreground/5"
											>
												<p className="text-sm font-medium">{item.title}</p>
												<p className="text-xs text-foreground/60">
													{item.ownerName} • {item.language} •{' '}
													{formatDate(item.viewedAt)}
												</p>
											</Link>
											<Button
												type="button"
												onClick={(event) => {
													event.stopPropagation()
													event.preventDefault()
													handleDeleteRecent(item.id)
												}}
												variant="ghost"
												className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md! p-1! text-foreground/50! opacity-100! transition! hover:bg-transparent! hover:text-foreground! sm:opacity-0! sm:group-hover:opacity-100! sm:group-focus-within:opacity-100!"
												aria-label={`Delete ${item.title} from recent`}
											>
												<LuX className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							</div>
						)}

						{isSearchAreaFocused && isSearching && <SearchResultsSkeleton />}

						{isSearchAreaFocused && searchError && (
							<p className="py-5 text-center text-sm text-red-500">
								{searchError}
							</p>
						)}

						{isSearchAreaFocused &&
							!isSearching &&
							!searchError &&
							shouldSearch &&
							results.length === 0 && (
								<p className="py-5 text-center text-sm text-foreground/60">
									No snippets found for your filters.
								</p>
							)}

						{isSearchAreaFocused &&
							!isSearching &&
							!searchError &&
							results.length > 0 && (
								<div className="space-y-2">
									{results.map((snippet) => (
										<Link
											key={snippet.id}
											href={`/snippets/${snippet.id}`}
											onClick={onClose}
											className="block rounded-lg border border-default px-3 py-2 transition hover:bg-foreground/5"
										>
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<p className="truncate text-sm font-medium">
														{snippet.title}
													</p>
													<p className="truncate text-xs text-foreground/60">
														@{snippet.author.username} • {snippet.language}
													</p>
												</div>
												<span className="text-xs text-foreground/60">
													{snippet.viewsCount} views
												</span>
											</div>
										</Link>
									))}
								</div>
							)}
					</div>
				</div>
			</div>
		</div>,
		document.body,
	)
}
