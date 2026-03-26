'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import { snippetApiClient } from '@/features/snippets/snippet.client.container'
import { useRequireAuth } from '@/shared/ui/AuthRequired'
import { logger } from '@/shared/utils/logger'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { EnrichedSnippet } from '../core/snippet.types'
import { toggleLikeAction } from '../snippet.actions'
import { AuthorCard } from './AuthorCard'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { SnippetDates } from './SnippetDates'
import { SnippetOwnerActions } from './SnippetOwnerActions'
import { SnippetStats } from './SnippetStats'
import { SnippetVersionHistory } from './SnippetVersionHistory'
import { TechnologyBadge } from './TechnologyBadge'
import { VisibilityBadge } from './VisibilityBadge'
import { CodeBlock } from './code/CodeBlock'
import { saveRecentSnippet } from './recent-snippets'

type Props = {
	snippet: EnrichedSnippet
}

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

	useEffect(() => {
		saveRecentSnippet({
			id: snippet.id,
			title: snippet.title,
			language: snippet.language,
			ownerName: snippet.ownerName,
		})
	}, [snippet.id, snippet.title, snippet.language, snippet.ownerName])

	async function handleDelete() {
		if (!isOwner) return

		setIsDeleting(true)
		try {
			await snippetApiClient.delete(snippet.id)
			router.replace('/snippets')
		} catch (error) {
			logger.error('Failed to delete snippet', {
				error: error instanceof Error ? error.message : 'Unknown error',
			})
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
				logger.error('Failed to toggle like', {
					error: error instanceof Error ? error.message : 'Unknown error',
				})
			})
		})
	}

	return (
		<article className="space-y-8">
			<div className="space-y-4">
				<div className="flex items-start justify-between gap-4">
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
						{snippet.title}
					</h1>
					<VisibilityBadge visibility={snippet.visibility} />
				</div>
				{snippet.description && (
					<p className="text-lg text-gray-600 dark:text-gray-400">
						{snippet.description}
					</p>
				)}
			</div>

			<div className="space-y-3 border-y border-default py-4">
				<div className="flex items-start justify-between gap-3">
					<AuthorCard author={author} />
					<SnippetStats
						viewsCount={snippet.viewsCount}
						likesCount={likesCount}
						isLiked={isLiked}
						onLikeClick={handleLike}
					/>
				</div>
				<SnippetDates
					createdAt={snippet.createdAt}
					updatedAt={snippet.updatedAt}
				/>
			</div>

			{snippet.technologies.length > 0 && (
				<div className="space-y-2">
					<h2 className="text-sm font-medium text-gray-500">Technologies</h2>
					<div className="flex flex-wrap gap-2">
						{snippet.technologies.map((tech) => (
							<TechnologyBadge key={tech} technology={tech} size="md" />
						))}
					</div>
				</div>
			)}

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

			{isOwner && (
				<SnippetOwnerActions
					snippetId={snippet.id}
					isDeleting={isDeleting}
					onDeleteClick={() => setShowDeleteConfirm(true)}
				/>
			)}

			<SnippetVersionHistory
				versions={snippet.versions}
				authorName={author.name}
				ownerId={snippet.ownerId}
			/>

			<DeleteConfirmationModal
				isOpen={showDeleteConfirm}
				snippetTitle={snippet.title}
				isDeleting={isDeleting}
				onConfirm={handleDelete}
				onCancel={() => setShowDeleteConfirm(false)}
			/>

			{modal}
		</article>
	)
}
