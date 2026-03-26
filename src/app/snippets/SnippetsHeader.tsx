'use client'

import { useAuth } from '@/features/auth/ui/store/auth.store'
import type { SnippetSortBy } from '@/features/snippets/core/repositories/snippet.repository'
import type { SnippetTechnology } from '@/features/snippets/core/snippet.types'
import { TechnologyBadge } from '@/features/snippets/ui/TechnologyBadge'
import { TECHNOLOGY_OPTIONS } from '@/features/technologies/technologies.config'
import { Button, Select } from '@/shared/ui/design-system'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { Tooltip } from 'react-tooltip'

interface SnippetsHeaderProps {
	sortBy: SnippetSortBy
	showLikedOnly: boolean
	selectedTechnologies: SnippetTechnology[]
	onSortChange: (sort: SnippetSortBy) => void
	onLikedToggle: (liked: boolean) => void
	onTechnologyToggle: (tech: SnippetTechnology) => void
	onClearTechnologies: () => void
}

export function SnippetsHeader({
	sortBy,
	showLikedOnly,
	selectedTechnologies,
	onSortChange,
	onLikedToggle,
	onTechnologyToggle,
	onClearTechnologies,
}: SnippetsHeaderProps) {
	const { user } = useAuth()

	return (
		<div className="mb-8 flex flex-col gap-4">
			<div className="flex flex-row gap-4 items-center justify-between">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">
						Community Snippets
					</h1>
					<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
						Discover reusable code snippets shared by the community
					</p>
				</div>

				<div className="flex flex-row items-center gap-3">
					{user && (
						<>
							{showLikedOnly ? (
								<AiFillHeart
									className="w-6 h-6 cursor-pointer text-red-500 transition-colors"
									data-tooltip-id="liked-filter"
									data-tooltip-content="Show all snippets"
									onClick={() => onLikedToggle(!showLikedOnly)}
								/>
							) : (
								<AiOutlineHeart
									className="w-6 h-6 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors"
									data-tooltip-id="liked-filter"
									data-tooltip-content="Show liked snippets only"
									onClick={() => onLikedToggle(!showLikedOnly)}
								/>
							)}
							<Tooltip id="liked-filter" place="bottom" />
						</>
					)}

					<Select
						uiSize="sm"
						className="min-w-40 w-full"
						value={sortBy}
						onChange={(e) => onSortChange(e.target.value as SnippetSortBy)}
					>
						<option value="latest">Latest</option>
						<option value="oldest">Oldest</option>
						<option value="views">Most Viewed</option>
						<option value="title">Title (A-Z)</option>
					</Select>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Filter by Technology
					</label>
					{selectedTechnologies.length > 0 && (
						<Button
							onClick={onClearTechnologies}
							variant="ghost"
							size="sm"
							className="text-xs"
						>
							Clear all
						</Button>
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					{TECHNOLOGY_OPTIONS.map((tech) => (
						<TechnologyBadge
							key={tech.value}
							technology={tech.value}
							size="md"
							selected={selectedTechnologies.includes(tech.value)}
							onClick={() => onTechnologyToggle(tech.value)}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
