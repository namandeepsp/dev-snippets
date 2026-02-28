import { Skeleton } from '@/shared/ui/design-system'

export default function SnippetDetailLoading() {
	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			<nav className="mb-6 flex items-center gap-2 text-sm">
				<Skeleton className="h-4 w-14" />
				<Skeleton className="h-4 w-2" />
				<Skeleton className="h-4 w-40" />
			</nav>

			<article className="space-y-8">
				<div className="space-y-4">
					<div className="flex items-start justify-between gap-4">
						<Skeleton className="h-10 w-3/5" />
						<Skeleton className="h-7 w-20 rounded-full" />
					</div>
					<Skeleton className="h-5 w-4/5" />
				</div>

				<div className="flex flex-wrap items-center justify-between gap-4 border-y border-default py-4">
					<div className="flex items-center gap-4">
						<Skeleton className="h-10 w-10 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-4 w-20" />
						</div>
						<Skeleton className="h-6 w-px rounded-none" />
						<Skeleton className="h-4 w-40" />
					</div>
					<Skeleton className="h-4 w-20" />
				</div>

				<div className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<div className="flex flex-wrap gap-2">
						<Skeleton className="h-6 w-20 rounded-full" />
						<Skeleton className="h-6 w-16 rounded-full" />
						<Skeleton className="h-6 w-24 rounded-full" />
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-4 w-20" />
					</div>
					<div className="rounded-xl border border-default bg-card p-4">
						{Array.from({ length: 9 }).map((_, idx) => (
							<Skeleton key={idx} className="mb-2 h-4 w-full last:mb-0" />
						))}
					</div>
				</div>

				<div className="flex items-center gap-4 pt-4">
					<Skeleton className="h-10 w-28" />
					<Skeleton className="h-10 w-24" />
				</div>
			</article>
		</div>
	)
}
