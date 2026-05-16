'use client'

export function VersionHistoryModalSkeleton() {
	return (
		<div className="space-y-6">
			{/* Version Selector Skeleton */}
			<div className="space-y-2">
				<div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
				<div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
			</div>

			{/* Version Info Skeleton */}
			<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 space-y-3">
				<div className="flex items-center justify-between">
					<div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					<div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
				</div>
				<div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
			</div>

			{/* Code Section Skeleton */}
			<div className="space-y-3">
				<div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

				{/* File Header Skeleton */}
				<div className="flex items-center justify-between px-1">
					<div className="flex items-center gap-2">
						<div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
						<div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					</div>
					<div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
				</div>

				{/* Code Block Skeleton */}
				<div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
					<div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					<div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					<div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					<div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
					<div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
				</div>
			</div>
		</div>
	)
}
