import { Skeleton } from '@/shared/ui/design-system'

export default function SnippetDetailLoading() {
	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			{/* Breadcrumb */}
			<nav className="mb-6 flex items-center gap-2 text-sm">
				<Skeleton className="h-4 w-14" />
				<Skeleton className="h-4 w-2" />
				<Skeleton className="h-4 w-40" />
			</nav>

			<article className="space-y-8">
				{/* Title and Description */}
				<div className="space-y-4">
					<div className="flex items-start justify-between gap-4">
						<Skeleton className="h-10 w-3/5" />
						<Skeleton className="h-7 w-20 rounded-full" />
					</div>
					<Skeleton className="h-5 w-4/5" />
				</div>

				{/* Author and Stats */}
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

				{/* Technologies */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<div className="flex flex-wrap gap-2">
						<Skeleton className="h-6 w-20 rounded-full" />
						<Skeleton className="h-6 w-16 rounded-full" />
						<Skeleton className="h-6 w-24 rounded-full" />
					</div>
				</div>

				{/* Code Section */}
				<div className="space-y-6">
					{/* Code Header */}
					<div className="flex items-center justify-between px-1">
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-8 w-28 rounded-lg" />
					</div>

					{/* Multiple Code Blocks */}
					{Array.from({ length: 2 }).map((_, blockIdx) => (
						<div key={blockIdx} className="space-y-2">
							{/* File Header (only show for multiple files) */}
							{blockIdx > 0 && (
								<div className="flex items-center justify-between px-1">
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-4 w-16" />
									</div>
									<Skeleton className="h-4 w-16" />
								</div>
							)}

							{/* Code Block */}
							<CodeBlockSkeleton />
						</div>
					))}
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-4 pt-4">
					<Skeleton className="h-10 w-28" />
					<Skeleton className="h-10 w-24" />
				</div>
			</article>
		</div>
	)
}

function CodeBlockSkeleton() {
	const lineWidths = [
		'w-[92%]',
		'w-[78%]',
		'w-[88%]',
		'w-[66%]',
		'w-[84%]',
		'w-[74%]',
		'w-[90%]',
		'w-[70%]',
		'w-[82%]',
	]

	return (
		<div className="flex flex-col gap-2 overflow-hidden rounded-xl border-b border-[#D4D4D4] bg-[#4F565E] px-4 py-2 dark:border-gray-700 dark:bg-[#333333]">
			{/* Header with language and buttons */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-2">
					<Skeleton className="h-6 w-20 rounded-md bg-white/25 dark:bg-white/10" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-16 rounded-[10px] bg-white/20 dark:bg-white/10" />
					<Skeleton className="h-8 w-16 rounded-[10px] bg-white/20 dark:bg-white/10" />
					<Skeleton className="h-8 w-16 rounded-[10px] bg-white/20 dark:bg-white/10" />
				</div>
			</div>

			{/* Code lines */}
			<div className="overflow-hidden bg-[#303841] py-4 dark:bg-[#1E1E1E]">
				<div className="space-y-3 px-4">
					{lineWidths.map((width, idx) => (
						<Skeleton
							key={idx}
							className={`h-3 ${width} rounded-sm bg-white/15 dark:bg-white/10`}
						/>
					))}
				</div>
			</div>

			{/* Footer with line count and language info */}
			<div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D4D4D4] py-1.5 dark:border-gray-600">
				<div className="flex items-center gap-2">
					<Skeleton className="h-3.5 w-3.5 rounded-full bg-white/20 dark:bg-white/10" />
					<Skeleton className="h-3 w-24 bg-white/20 dark:bg-white/10" />
					<Skeleton className="h-3 w-3 rounded-sm bg-white/20 dark:bg-white/10" />
					<Skeleton className="h-3 w-28 bg-white/20 dark:bg-white/10" />
				</div>
				<Skeleton className="hidden h-3 w-24 sm:block bg-white/20 dark:bg-white/10" />
				<Skeleton className="h-3 w-16 sm:hidden bg-white/20 dark:bg-white/10" />
			</div>
		</div>
	)
}
