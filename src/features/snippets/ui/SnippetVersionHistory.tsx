'use client'

import { Button } from '@/shared/ui/design-system'
import { formatDate } from '@/shared/utils/date'
import type { SnippetVersion } from '../core/snippet.types'

/**
 * ============================================================================
 * SNIPPET VERSION HISTORY
 * ============================================================================
 *
 * Displays version history with last 3 versions and "view all" link.
 */

interface SnippetVersionHistoryProps {
	versions: SnippetVersion[]
	authorName: string
	ownerId: string
}

export function SnippetVersionHistory({
	versions,
	authorName,
	ownerId,
}: SnippetVersionHistoryProps) {
	if (versions.length <= 1) return null

	return (
		<div className="space-y-3 pt-4 border-t border-default">
			<h2 className="text-sm font-medium text-gray-500">
				Version History ({versions.length})
			</h2>
			<div className="space-y-2">
				{versions
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
								by {version.createdBy === ownerId ? authorName : 'User'}
							</span>
						</div>
					))}
				{versions.length > 3 && (
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
	)
}
