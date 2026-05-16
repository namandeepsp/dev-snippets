'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import { snippetApiClient } from '@/features/snippets/snippet.client.container'
import { queryKeys } from '@/shared/hooks/query-keys'
import { useRequireAuth } from '@/shared/ui/AuthRequired'
import { Button } from '@/shared/ui/design-system'
import { logger } from '@/shared/utils/logger'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LuDownload } from 'react-icons/lu'
import type { EnrichedSnippet } from '../core/snippet.types'
import { toggleLikeAction } from '../snippet.actions'
import { AuthorCard } from './AuthorCard'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { SnippetDates } from './SnippetDates'
import { SnippetOwnerActions } from './SnippetOwnerActions'
import { SnippetStats } from './SnippetStats'
import { SnippetVersionHistory } from './SnippetVersionHistory'
import { TechnologyBadge } from './TechnologyBadge'
import { VersionHistoryModal } from './VersionHistoryModal'
import { VisibilityBadge } from './VisibilityBadge'
import { CodeBlock } from './code/CodeBlock'
import { downloadSingleFile, exportSnippet } from './code/export-utils'
import { saveRecentSnippet } from './recent-snippets'

type Props = {
	snippet: EnrichedSnippet
}

export function SnippetViewer({ snippet }: Props) {
	const router = useRouter()
	const { user } = useAuth()
	const { requireAuth, modal } = useRequireAuth()
	const queryClient = useQueryClient()
	const [isDeleting, setIsDeleting] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [showVersionHistory, setShowVersionHistory] = useState(false)

	const { data: versions = [], isFetching: versionsLoading } = useQuery({
		queryKey: queryKeys.snippets.versionHistory(snippet.id),
		queryFn: () => snippetApiClient.getVersionHistory(snippet.id),
		enabled: showVersionHistory,
	})

	const handleOpenVersionHistory = () => setShowVersionHistory(true)

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
			primaryLanguage: snippet.primaryLanguage,
			ownerName: snippet.ownerName,
		})
	}, [snippet.id, snippet.title, snippet.primaryLanguage, snippet.ownerName])

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

			{snippet.files.length > 0 && (
				<div className="space-y-6">
					<div className="flex items-center justify-between px-1">
						<h2 className="text-sm font-medium text-gray-500">Code</h2>
						{snippet.files.length > 1 && (
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() => exportSnippet(snippet.files, snippet.title)}
								data-tooltip-id="app-tooltip"
								data-tooltip-content="Download all files as ZIP"
								className="gap-1.5"
							>
								<LuDownload className="h-4 w-4" />
								<span>Export All</span>
							</Button>
						)}
					</div>
					{snippet.files.map((file, index) => (
						<div key={file.id} className="space-y-2">
							{snippet.files.length > 1 && (
								<div className="flex items-center justify-between px-1">
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
											{file.filename}
										</span>
										<span className="text-xs font-medium text-gray-400">
											{file.language}
										</span>
									</div>
									{snippet.files.length > 1 && (
										<span className="text-xs text-gray-400">
											{index + 1} of {snippet.files.length}
										</span>
									)}
								</div>
							)}
							<CodeBlock
								code={file.code}
								language={file.language}
								filename={file.filename}
								showLineNumbers
								snippetId={snippet.id}
								snippetTitle={snippet.title}
								snippetDescription={snippet.description}
								visibility={snippet.visibility}
								onExport={() => downloadSingleFile(file, snippet.title)}
							/>
						</div>
					))}
				</div>
			)}

			{isOwner && (
				<SnippetOwnerActions
					snippetId={snippet.id}
					isDeleting={isDeleting}
					onDeleteClick={() => setShowDeleteConfirm(true)}
				/>
			)}

			<div className="border-t border-default pt-4">
				<Button
					type="button"
					variant="secondary"
					onClick={handleOpenVersionHistory}
					disabled={versionsLoading}
				>
					{versionsLoading ? 'Loading...' : 'Version History'}
				</Button>
			</div>

			{versions.length > 1 && (
				<SnippetVersionHistory
					versions={versions}
					authorName={author.name}
					ownerId={snippet.ownerId}
					onViewAll={handleOpenVersionHistory}
				/>
			)}

			<VersionHistoryModal
				isOpen={showVersionHistory}
				onClose={() => setShowVersionHistory(false)}
				versions={versions}
				authorName={author.name}
				ownerId={snippet.ownerId}
				snippetId={snippet.id}
				snippetTitle={snippet.title}
				snippetDescription={snippet.description}
				visibility={snippet.visibility}
				onRestore={
					isOwner
						? async (versionNumber) => {
								await snippetApiClient.restoreVersion(snippet.id, versionNumber)
								queryClient.invalidateQueries({
									queryKey: queryKeys.snippets.versionHistory(snippet.id),
								})
								window.location.reload()
							}
						: undefined
				}
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
