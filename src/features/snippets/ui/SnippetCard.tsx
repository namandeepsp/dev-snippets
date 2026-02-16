import type { PublicUser } from '@/features/user/core/user.types'
import { formatDate } from '@/shared/utils/date'
import Link from 'next/link'
import type { Snippet } from '../core/snippet.types'
import { TechnologyBadge } from './TechnologyBadge'

type Props = {
	/** The snippet to display */
	snippet: Snippet & { author?: PublicUser }
	/** Whether to show author information */
	showAuthor?: boolean
	/** Whether to show compact version (for grids) */
	compact?: boolean
}

/**
 * ============================================================================
 * SNIPPET CARD
 * ============================================================================
 *
 * Displays a snippet preview in a card format.
 * Used in grids, lists, and profile pages.
 *
 * Features:
 * - Title and description
 * - Technology badges
 * - Author info (optional)
 * - View and like counts
 * - Publish/update date
 */

export function SnippetCard({
	snippet,
	showAuthor = false,
	compact = false,
}: Props) {
	const author = snippet.author || {
		id: snippet.ownerId,
		username: snippet.ownerId,
		name: snippet.ownerName,
		avatarUrl: null,
	}

	const isUpdated = snippet.updatedAt > snippet.createdAt
	const date = isUpdated ? snippet.updatedAt : snippet.createdAt
	const dateLabel = isUpdated ? 'Updated' : 'Published'

	return (
		<Link
			href={`/snippets/${snippet.id}`}
			className={`
        group block rounded-lg border border-default bg-card
        hover:border-foreground/20 hover:shadow-md
        transition-all focus:outline-none focus:ring-2 focus:ring-foreground/20
        ${compact ? 'p-4' : 'p-5'}
      `}
			aria-label={`View snippet: ${snippet.title}`}
		>
			{/* Header */}
			<div className="mb-3 flex items-start justify-between gap-2">
				<h3
					className={`
          font-semibold tracking-tight group-hover:text-foreground/80 transition
          ${compact ? 'text-base' : 'text-lg'}
          line-clamp-1
        `}
				>
					{snippet.title}
				</h3>

				{/* Visibility indicator - only for owner view */}
				{snippet.visibility !== 'public' && (
					<span
						className="text-xs text-gray-500 capitalize"
						aria-label={`${snippet.visibility} snippet`}
					>
						🔒 {!compact && snippet.visibility}
					</span>
				)}
			</div>

			{/* Description */}
			{snippet.description && !compact && (
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
					{snippet.description}
				</p>
			)}

			{/* Technologies */}
			{snippet.technologies.length > 0 && (
				<div className="flex flex-wrap gap-1.5 mb-3">
					{snippet.technologies.slice(0, compact ? 2 : 3).map((tech) => (
						<TechnologyBadge
							key={tech}
							technology={tech}
							size={compact ? 'sm' : 'md'}
						/>
					))}
					{snippet.technologies.length > (compact ? 2 : 3) && (
						<span className="text-xs text-gray-500">
							+{snippet.technologies.length - (compact ? 2 : 3)}
						</span>
					)}
				</div>
			)}

			{/* Footer */}
			<div className="flex items-center justify-between text-xs text-gray-500">
				{/* Author */}
				{showAuthor && (
					<div className="flex items-center gap-1.5">
						{author.avatarUrl ? (
							<img
								src={author.avatarUrl}
								alt={author.name}
								className="w-5 h-5 rounded-full"
							/>
						) : (
							<div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
								<span className="text-[10px] font-medium">
									{author.name.charAt(0).toUpperCase()}
								</span>
							</div>
						)}
						<span className="hover:text-foreground transition">
							@{author.username}
						</span>
					</div>
				)}

				{/* Metadata */}
				<div className="flex items-center gap-3">
					{/* Date - only on non-compact */}
					{!compact && (
						<time
							dateTime={new Date(date).toISOString()}
							className="hidden sm:block"
						>
							{dateLabel} {formatDate(date)}
						</time>
					)}

					{/* Stats */}
					<span
						className="flex items-center gap-1"
						aria-label={`${snippet.viewsCount} views`}
					>
						👁 {snippet.viewsCount}
					</span>
					<span
						className="flex items-center gap-1"
						aria-label={`${snippet.likesCount} likes`}
					>
						❤️ {snippet.likesCount}
					</span>
				</div>
			</div>
		</Link>
	)
}
