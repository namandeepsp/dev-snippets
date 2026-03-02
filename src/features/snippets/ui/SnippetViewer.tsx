'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import { snippetApiClient } from '@/features/snippets/snippet.client.container'
import { useRequireAuth } from '@/shared/ui/AuthRequired'
import { Button } from '@/shared/ui/design-system'
import { formatDate } from '@/shared/utils/date'
import { logger } from '@/shared/utils/logger'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LuHeart } from 'react-icons/lu'
import type { EnrichedSnippet } from '../core/snippet.types'
import { toggleLikeAction } from '../snippet.actions'
import { TechnologyBadge } from './TechnologyBadge'
import { CodeBlock } from './code/CodeBlock'

type Props = {
	/** The snippet to display */
	snippet: EnrichedSnippet
}

/**
 * ============================================================================
 * SNIPPET VIEWER
 * ============================================================================
 *
 * Displays a full snippet with all metadata and actions.
 * Used on the snippet detail page.
 *
 * Features:
 * - Title, description, code
 * - Author profile link
 * - Edit/delete buttons (owner only)
 * - Version history
 * - Share options
 */

export function SnippetViewer({ snippet }: Props) {
	const router = useRouter()
	const { user } = useAuth()
	const { requireAuth, modal } = useRequireAuth()
	const [isDeleting, setIsDeleting] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [isLiked, setIsLiked] = useState(snippet.isLikedByUser ?? false)

	const likesCount = Math.max(
		0,
		snippet.likesCount +
			(isLiked && !snippet.isLikedByUser ? 1 : 0) +
			(!isLiked && snippet.isLikedByUser ? -1 : 0),
	)

	const author = snippet.author || {
		id: snippet.ownerId,
		username: snippet.ownerId,
		name: snippet.ownerName,
		avatarUrl: null,
	}

	const isOwner = user?.id === snippet.ownerId
	const isUpdated = snippet.updatedAt > snippet.createdAt

	async function handleDelete() {
		if (!isOwner) return

		setIsDeleting(true)
		try {
			await snippetApiClient.delete(snippet.id)
			router.replace('/snippets')
		} catch (error) {
			logger.error('Failed to delete snippet', error)
			globalThis.alert('Failed to delete snippet. Please try again.')
		} finally {
			setIsDeleting(false)
			setShowDeleteConfirm(false)
		}
	}

	function handleLike() {
		requireAuth(() => {
			setIsLiked(!isLiked)
			toggleLikeAction(snippet.id).catch((error) => {
				logger.error('Failed to toggle like', error)
			})
		})
	}

	return (
		<article className="space-y-8">
			{/* Header */}
			<div className="space-y-4">
				<div className="flex items-start justify-between gap-4">
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
						{snippet.title}
					</h1>

					{/* Visibility badge */}
					<span
						className={`
            px-3 py-1 rounded-full text-xs font-medium capitalize
            ${snippet.visibility === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
            ${snippet.visibility === 'private' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' : ''}
            ${snippet.visibility === 'shared' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
          `}
					>
						{snippet.visibility}
					</span>
				</div>

				{snippet.description && (
					<p className="text-lg text-gray-600 dark:text-gray-400">
						{snippet.description}
					</p>
				)}
			</div>

			{/* Author & Metadata Bar */}
			<div className="flex flex-wrap items-center justify-between gap-4 border-y border-default py-4">
				<div className="flex items-center gap-4">
					{/* Author */}
					<Link
						href={`/profile/${author.username}`}
						className="flex items-center gap-3 hover:opacity-80 transition"
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
						<div>
							<p className="font-medium">{author.name}</p>
							<p className="text-sm text-gray-500">@{author.username}</p>
						</div>
					</Link>

					<div className="h-8 w-px bg-default" aria-hidden="true" />

					{/* Dates */}
					<div className="text-sm text-gray-500">
						<time dateTime={new Date(snippet.createdAt).toISOString()}>
							Published {formatDate(snippet.createdAt)}
						</time>
						{isUpdated && (
							<>
								<span className="mx-1">·</span>
								<time dateTime={new Date(snippet.updatedAt).toISOString()}>
									Updated {formatDate(snippet.updatedAt)}
								</time>
							</>
						)}
					</div>
				</div>

				{/* Stats */}
				<div className="flex items-center gap-4 text-sm">
					<span
						className="flex items-center gap-1"
						aria-label={`${snippet.viewsCount + 1} views`}
					>
						👁 {snippet.viewsCount + 1}
					</span>
					<button
						onClick={handleLike}
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

			{/* Technologies */}
			{snippet.technologies.length > 0 && (
				<div className="space-y-2">
					<h2 className="text-sm font-medium text-gray-500">Technologies</h2>
					<div className="flex flex-wrap gap-2">
						{snippet.technologies.map((tech) => (
							<TechnologyBadge key={tech} technology={tech} size="lg" />
						))}
					</div>
				</div>
			)}

			{/* Code */}
			<div className="space-y-2">
				<div className="flex items-center justify-between px-1">
					<h2 className="text-sm font-medium text-gray-500">Code</h2>
					<span className="text-xs font-medium text-gray-400">
						{snippet.language}
					</span>
				</div>
				<CodeBlock
					code={snippet.code}
					language={snippet.language}
					showLineNumbers
					snippetId={snippet.id}
					snippetTitle={snippet.title}
					snippetDescription={snippet.description}
					visibility={snippet.visibility}
				/>
			</div>

			{/* Owner Actions */}
			{isOwner && (
				<div className="flex items-center gap-4 pt-4 border-t border-default">
					<Link
						href={`/snippets/${snippet.id}/edit`}
						className="rounded-md border border-default px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
					>
						Edit Snippet
					</Link>

					<Button
						onClick={() => setShowDeleteConfirm(true)}
						disabled={isDeleting}
						variant="ghost"
						className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50 transition disabled:opacity-50"
					>
						{isDeleting ? 'Deleting...' : 'Delete'}
					</Button>
				</div>
			)}

			{/* Version History */}
			{snippet.versions.length > 1 && (
				<div className="space-y-3 pt-4 border-t border-default">
					<h2 className="text-sm font-medium text-gray-500">
						Version History ({snippet.versions.length})
					</h2>
					<div className="space-y-2">
						{snippet.versions
							.slice(-3)
							.reverse()
							.map((version) => (
								<div
									key={version.version}
									className="flex items-center gap-4 text-sm"
								>
									<span className="font-mono text-gray-400">
										v{version.version}
									</span>
									<time
										dateTime={new Date(version.createdAt).toISOString()}
										className="text-gray-500"
									>
										{formatDate(version.createdAt)}
									</time>
									<span className="text-gray-600 dark:text-gray-400">
										by{' '}
										{version.createdBy === snippet.ownerId
											? author.name
											: 'User'}
									</span>
								</div>
							))}
						{snippet.versions.length > 3 && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-auto px-0 py-0 text-sm text-blue-600 hover:underline dark:text-blue-400"
							>
								View all versions
							</Button>
						)}
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
						<h3 className="text-lg font-semibold mb-2">Delete Snippet</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-6">
							Are you sure you want to delete "{snippet.title}"? This action
							cannot be undone.
						</p>
						<div className="flex justify-end gap-3">
							<Button
								onClick={() => setShowDeleteConfirm(false)}
								variant="ghost"
								className="rounded-md border border-default px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
							>
								Cancel
							</Button>
							<Button
								onClick={handleDelete}
								disabled={isDeleting}
								variant="ghost"
								className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
							>
								{isDeleting ? 'Deleting...' : 'Delete'}
							</Button>
						</div>
					</div>
				</div>
			)}

			{modal}
		</article>
	)
}
