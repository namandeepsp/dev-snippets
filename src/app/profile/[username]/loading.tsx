import { SnippetCardSkeleton } from '@/features/snippets/ui/SnippetCardSkeleton'
import { Skeleton } from '@/shared/ui/design-system'

export default function ProfileLoading() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			{/* Profile Header Skeleton */}
			<div className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
				<Skeleton className="h-24 w-24 rounded-full" />

				<div className="flex-1 space-y-3">
					<Skeleton className="h-8 w-56" />
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-4 w-80 max-w-full" />

					<div className="mt-4 flex gap-6">
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-4 w-24" />
					</div>
				</div>
			</div>

			{/* Section Header Skeleton */}
			<div className="mb-6 flex items-center justify-between">
				<Skeleton className="h-8 w-36" />
				<Skeleton className="h-4 w-24" />
			</div>

			{/* Snippet Cards Skeleton */}
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<SnippetCardSkeleton key={index} isPrivate />
				))}
			</div>
		</div>
	)
}
