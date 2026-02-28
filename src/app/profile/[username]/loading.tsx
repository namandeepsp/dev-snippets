import { Skeleton } from '@/shared/ui/design-system'

export default function ProfileLoading() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			{/* Profile Header Skeleton */}
			<div className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
				<Skeleton className="h-24 w-24 rounded-full dark:bg-gray-800" />

				<div className="flex-1 space-y-3">
					<Skeleton className="h-8 w-56 dark:bg-gray-800" />
					<Skeleton className="h-5 w-32 dark:bg-gray-800" />
					<Skeleton className="h-4 w-80 max-w-full dark:bg-gray-800" />

					<div className="mt-4 flex gap-6">
						<Skeleton className="h-4 w-28 dark:bg-gray-800" />
						<Skeleton className="h-4 w-24 dark:bg-gray-800" />
					</div>
				</div>
			</div>

			{/* Section Header Skeleton */}
			<div className="mb-6 flex items-center justify-between">
				<Skeleton className="h-8 w-36 dark:bg-gray-800" />
				<Skeleton className="h-4 w-24 dark:bg-gray-800" />
			</div>

			{/* Snippet Cards Skeleton */}
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<div
						key={index}
						className="rounded-lg border border-default bg-card p-5"
					>
						<Skeleton className="mb-3 h-6 w-3/4 dark:bg-gray-800" />
						<Skeleton className="mb-2 h-4 w-full dark:bg-gray-800" />
						<Skeleton className="mb-4 h-4 w-2/3 dark:bg-gray-800" />
						<div className="mb-4 flex gap-2">
							<Skeleton className="h-5 w-16 rounded-full dark:bg-gray-800" />
							<Skeleton className="h-5 w-14 rounded-full dark:bg-gray-800" />
							<Skeleton className="h-5 w-12 rounded-full dark:bg-gray-800" />
						</div>
						<div className="flex items-center justify-between">
							<Skeleton className="h-4 w-24 dark:bg-gray-800" />
							<Skeleton className="h-4 w-16 dark:bg-gray-800" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
