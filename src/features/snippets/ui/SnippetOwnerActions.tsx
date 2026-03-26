'use client'

import { Button } from '@/shared/ui/design-system'
import Link from 'next/link'

/**
 * ============================================================================
 * SNIPPET OWNER ACTIONS
 * ============================================================================
 *
 * Edit and delete buttons for snippet owner.
 */

interface SnippetOwnerActionsProps {
	snippetId: string
	isDeleting: boolean
	onDeleteClick: () => void
}

export function SnippetOwnerActions({
	snippetId,
	isDeleting,
	onDeleteClick,
}: SnippetOwnerActionsProps) {
	return (
		<div className="flex items-center gap-4 pt-4 border-t border-default">
			<Link
				href={`/snippets/${snippetId}/edit`}
				className="rounded-md border border-default px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
			>
				Edit Snippet
			</Link>

			<Button
				onClick={onDeleteClick}
				disabled={isDeleting}
				variant="ghost"
				className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50 transition disabled:opacity-50"
			>
				{isDeleting ? 'Deleting...' : 'Delete'}
			</Button>
		</div>
	)
}
