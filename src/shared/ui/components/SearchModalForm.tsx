import type { SnippetSortBy } from '@/features/snippets/core/repositories/snippet.repository'
import type { SnippetTechnology } from '@/features/snippets/core/snippet.types'
import { TECHNOLOGY_OPTIONS } from '@/features/technologies/technologies.config'
import type { User } from '@/features/user/user.container'
import type { RefObject } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { LuFilter, LuSearch, LuX } from 'react-icons/lu'
import { Button, Select } from '../design-system'
import type { SearchScope } from '../types'

type Props = {
	query: string
	setQuery: (value: string) => void
	showFilters: boolean
	setShowFilters: (value: boolean | ((prev: boolean) => boolean)) => void
	technology: SnippetTechnology | 'all'
	setTechnology: (value: SnippetTechnology | 'all') => void
	sortBy: SnippetSortBy
	setSortBy: (value: SnippetSortBy) => void
	scope: SearchScope
	setScope: (value: SearchScope) => void
	user: User | null
	filtersRef: RefObject<HTMLDivElement | null>
	queryRef: RefObject<HTMLInputElement | null>
	loadRecent: () => void
}

export default function SearchModalForm({
	query,
	setQuery,
	showFilters,
	setShowFilters,
	technology,
	setTechnology,
	sortBy,
	setSortBy,
	scope,
	setScope,
	user,
	queryRef,
	loadRecent,
	filtersRef,
}: Props) {
	const [tempTechnology, setTempTechnology] = useState<
		SnippetTechnology | 'all'
	>(technology)
	const [tempSortBy, setTempSortBy] = useState<SnippetSortBy>(sortBy)
	const [tempScope, setTempScope] = useState<SearchScope>(scope)

	useEffect(() => {
		if (showFilters) {
			setTempTechnology(technology)
			setTempSortBy(sortBy)
			setTempScope(scope)
		}
	}, [showFilters])

	const tempActiveFilterCount = useMemo(() => {
		let count = 0
		if (tempTechnology !== 'all') count += 1
		if (tempSortBy !== 'latest') count += 1
		if (tempScope !== 'public') count += 1
		return count
	}, [tempTechnology, tempSortBy, tempScope])

	const handleApplyFilters = () => {
		setTechnology(tempTechnology)
		setSortBy(tempSortBy)
		setScope(tempScope)
		setShowFilters(false)
	}

	const handleCloseFilters = () => {
		setTempTechnology(technology)
		setTempSortBy(sortBy)
		setTempScope(scope)
		setShowFilters(false)
	}

	return (
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
						className={`h-11 rounded-xl ${tempActiveFilterCount > 0 ? 'border-blue-400 text-blue-600 dark:border-blue-500 dark:text-blue-300' : ''}`}
						onClick={() => setShowFilters(!showFilters)}
					>
						<LuFilter className="h-4 w-4" />
						<span className="max-sm:hidden">Filters</span>
						{tempActiveFilterCount > 0 && (
							<span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white dark:bg-blue-500">
								{tempActiveFilterCount}
							</span>
						)}
					</Button>

					{showFilters && (
						<div
							className="absolute right-0 top-12 z-20 w-72 rounded-xl border border-default bg-background p-3 text-foreground shadow-xl"
							onBlur={(event) => {
								if (
									!event.currentTarget.contains(event.relatedTarget as Node)
								) {
									handleCloseFilters()
								}
							}}
							tabIndex={-1}
						>
							<div className="mb-3 flex items-center justify-between">
								<h3 className="text-sm font-semibold">Filters</h3>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-6 w-6 rounded p-0"
									onClick={handleCloseFilters}
									aria-label="Close filters"
								>
									<LuX className="h-4 w-4" />
								</Button>
							</div>
							<div className="mb-2">
								<label className="mb-1 block text-xs font-medium text-foreground/65">
									Technology
								</label>
								<Select
									uiSize="sm"
									value={tempTechnology}
									onChange={(e) =>
										setTempTechnology(
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
									value={tempSortBy}
									onChange={(e) =>
										setTempSortBy(e.target.value as SnippetSortBy)
									}
									className="w-full"
								>
									<option value="latest">Latest</option>
									<option value="oldest">Oldest</option>
									<option value="views">Most viewed</option>
									<option value="title">Title (A-Z)</option>
								</Select>
							</div>

							<div className="mb-3">
								<label className="mb-1 block text-xs font-medium text-foreground/65">
									Scope
								</label>
								<Select
									uiSize="sm"
									value={tempScope}
									onChange={(e) => setTempScope(e.target.value as SearchScope)}
									className="w-full"
								>
									<option value="public">Public snippets</option>
									{user && (
										<option value="all-visible">Public + my snippets</option>
									)}
									{user && <option value="mine">My snippets only</option>}
								</Select>
							</div>

							<div className="flex">
								<Button
									type="button"
									size="sm"
									className="flex-1"
									onClick={handleApplyFilters}
								>
									Apply
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</form>
	)
}
