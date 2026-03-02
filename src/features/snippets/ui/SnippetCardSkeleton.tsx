import { Skeleton } from '@/shared/ui/design-system'

type Props = {
	compact?: boolean
	isPrivate?: boolean
}

export function SnippetCardSkeleton({
	compact = false,
	isPrivate = false,
}: Props) {
	return (
		<div
			className={`rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 ${compact ? 'p-4' : 'p-5'}`}
		>
			<Skeleton className="mb-3 h-6 w-3/4" />
			<Skeleton className="mb-2 h-4 w-full" />
			<Skeleton className="mb-4 h-4 w-2/3" />

			<div className="mb-4 flex gap-2">
				<Skeleton className="h-5 w-16 rounded-full" />
				<Skeleton className="h-5 w-14 rounded-full" />
				<Skeleton className="h-5 w-12 rounded-full" />
			</div>

			{isPrivate ? (
				<div className="flex items-center justify-between gap-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-24" />
				</div>
			) : (
				<div className="flex flex-col gap-4">
					<Skeleton className="h-4 w-full" />
					<div className="flex items-center justify-between gap-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-24" />
					</div>
				</div>
			)}
		</div>
	)
}
