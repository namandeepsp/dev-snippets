'use client'

/**
 * ============================================================================
 * SNIPPET VIEWER HEADER
 * ============================================================================
 *
 * Displays snippet title and visibility badge.
 */

interface SnippetViewerHeaderProps {
	title: string
	visibility: 'public' | 'private' | 'shared'
	description?: string
}

export function SnippetViewerHeader({
	title,
	visibility,
	description,
}: SnippetViewerHeaderProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-start justify-between gap-4">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
					{title}
				</h1>

				<span
					className={`
            px-3 py-1 rounded-full text-xs font-medium capitalize
            ${visibility === 'public' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
            ${visibility === 'private' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' : ''}
            ${visibility === 'shared' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
          `}
				>
					{visibility}
				</span>
			</div>

			{description && (
				<p className="text-lg text-gray-600 dark:text-gray-400">
					{description}
				</p>
			)}
		</div>
	)
}
