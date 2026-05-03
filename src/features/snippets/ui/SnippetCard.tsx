'use client'

import type { PublicUser } from '@/features/user/core/user.types'
import { formatDate } from '@/shared/utils/date'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiEdit3 } from 'react-icons/fi'
import type { Snippet } from '../core/snippet.types'
import { TechnologyBadge } from './TechnologyBadge'

type Props = {
	snippet: Snippet & { author?: PublicUser }
	showAuthor?: boolean
	compact?: boolean
	showEditButton?: boolean
}

export function SnippetCard({
	snippet,
	showAuthor = false,
	compact = false,
	showEditButton = false,
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
	const router = useRouter()

	return (
		<div
			role="link"
			tabIndex={0}
			onClick={(event) => {
				const targetUrl = `/snippets/${snippet.id}`
				if (event.ctrlKey || event.metaKey) {
					window.open(targetUrl, '_blank', 'noopener,noreferrer')
					return
				}

				router.push(targetUrl)
			}}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					router.push(`/snippets/${snippet.id}`)
				}
			}}
			className={`
        relative group flex h-full flex-col rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50
        hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md
        transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20
        ${compact ? 'p-4' : 'p-5'}
      `}
			aria-label={`View snippet: ${snippet.title}`}
		>
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

				{snippet.visibility !== 'public' && (
					<span
						className="text-xs text-gray-500 capitalize"
						aria-label={`${snippet.visibility} snippet`}
					>
						🔒 {!compact && snippet.visibility}
					</span>
				)}
			</div>

			{snippet.description && !compact && (
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
					{snippet.description}
				</p>
			)}

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

			<div className="mt-auto flex flex-col gap-2 text-xs text-gray-500">
				{showAuthor && (
					<div
						className="flex items-center gap-1.5"
						onClick={(e) => {
							e.stopPropagation()
							e.preventDefault()
							router.push(`/profile/${author.username}`)
						}}
					>
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
						<button
							type="button"
							className="hover:text-foreground transition cursor-pointer"
						>
							@{author.username}
						</button>
					</div>
				)}

				<div className="flex items-center justify-between gap-3">
					{!compact && (
						<time dateTime={new Date(date).toISOString()} className="truncate">
							{dateLabel} {formatDate(date)}
						</time>
					)}

					<div className="flex items-center gap-2">
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

				{showEditButton && (
					<Link
						href={`/snippets/${snippet.id}/edit`}
						target="_blank"
						rel="noreferrer"
						aria-label={`Edit snippet: ${snippet.title}`}
						className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 opacity-0 transition-all duration-200 hover:bg-gray-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
						onClick={(event) => event.stopPropagation()}
					>
						<FiEdit3 className="h-5 w-5" aria-hidden="true" />
					</Link>
				)}
			</div>
		</div>
	)
}
