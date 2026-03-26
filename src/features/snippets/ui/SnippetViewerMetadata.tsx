'use client'

import { formatDate } from '@/shared/utils/date'
import Link from 'next/link'
import { LuHeart } from 'react-icons/lu'

/**
 * ============================================================================
 * SNIPPET VIEWER METADATA
 * ============================================================================
 *
 * Displays author info, stats (views/likes), and timestamps.
 */

interface Author {
	id: string
	username: string
	name: string
	avatarUrl: string | null
}

interface SnippetViewerMetadataProps {
	author: Author
	viewsCount: number
	likesCount: number
	isLiked: boolean
	createdAt: number
	updatedAt: number
	onLikeClick: () => void
}

export function SnippetViewerMetadata({
	author,
	viewsCount,
	likesCount,
	isLiked,
	createdAt,
	updatedAt,
	onLikeClick,
}: SnippetViewerMetadataProps) {
	const isUpdated = updatedAt > createdAt

	return (
		<div className="space-y-3 border-y border-default py-4">
			<div className="flex items-start justify-between gap-3">
				{/* Author */}
				<Link
					href={`/profile/${author.username}`}
					className="flex min-w-0 items-center gap-3 transition hover:opacity-80"
				>
					{author.avatarUrl ? (
						<img
							src={author.avatarUrl}
							alt={author.name}
							className="w-10 h-10 rounded-full"
						/>
					) : (
						<div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
							<span className="text-sm font-medium">
								{author.name.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
					<div className="min-w-0">
						<p className="truncate font-medium leading-tight">
							{author.name}
						</p>
						<p className="truncate text-xs text-gray-500">
							@{author.username}
						</p>
					</div>
				</Link>

				{/* Stats */}
				<div className="flex shrink-0 items-center gap-4 text-sm text-gray-500">
					<span
						className="flex items-center gap-1"
						aria-label={`${viewsCount + 1} views`}
					>
						👁 {viewsCount + 1}
					</span>
					<button
						onClick={onLikeClick}
						className="flex items-center gap-1 transition-colors hover:text-red-500"
						aria-label={`${likesCount} likes`}
					>
						<LuHeart
							className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
						/>
						{likesCount}
					</button>
				</div>
			</div>

			{/* Dates */}
			<div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:justify-end">
				<time
					dateTime={new Date(createdAt).toISOString()}
					className="rounded-full bg-slate-200 px-2 py-1 text-slate-700 dark:bg-slate-800/70 dark:text-slate-400"
				>
					Published {formatDate(createdAt)}
				</time>
				{isUpdated && (
					<time
						dateTime={new Date(updatedAt).toISOString()}
						className="rounded-full bg-slate-200 px-2 py-1 text-slate-700 dark:bg-slate-800/70 dark:text-slate-400"
					>
						Updated {formatDate(updatedAt)}
					</time>
				)}
			</div>
		</div>
	)
}
