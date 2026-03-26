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
import { useDebounce } from '@/shared/hooks/useDebounce'
import { Button } from '@/shared/ui/design-system'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'
import RecentlyOpenedSnippets from './components/RecentlyOpenedSnippets'
import SearchModalForm from './components/SearchModalForm'
import SearchResults from './components/SearchResults'
import SearchResultsSkeleton from './components/SearchResultsSkeleton'
import type { SearchResult, SearchScope } from './types'

type Props = {
	open: boolean
	onClose: () => void
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
					<SearchModalForm
						queryRef={queryRef}
						query={query}
						loadRecent={loadRecent}
						setQuery={setQuery}
						filtersRef={filtersRef}
						activeFilterCount={activeFilterCount}
						setShowFilters={setShowFilters}
						showFilters={showFilters}
						technology={technology}
						setTechnology={setTechnology}
						sortBy={sortBy}
						setSortBy={setSortBy}
						scope={scope}
						setScope={setScope}
						user={user}
					/>

					<div className="mt-3 max-h-[60vh] overflow-auto">
						{showRecent && !shouldSearch && (
							<RecentlyOpenedSnippets
								displayedRecent={displayedRecent}
								onClose={onClose}
								handleDeleteRecent={handleDeleteRecent}
								handleClearRecent={handleClearRecent}
							/>
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
								<SearchResults results={results} onClose={onClose} />
							)}
					</div>
				</div>
			</div>
		</div>,
		document.body,
	)
}
