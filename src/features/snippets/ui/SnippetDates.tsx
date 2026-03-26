'use client'

import { formatDate } from '@/shared/utils/date'

interface SnippetDatesProps {
	createdAt: number
	updatedAt: number
}

export function SnippetDates({ createdAt, updatedAt }: SnippetDatesProps) {
	const isUpdated = updatedAt > createdAt

	return (
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
	)
}
