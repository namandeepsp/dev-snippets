import { Skeleton } from '@/shared/ui/design-system'

type Props = {
	maxWidth?: 'max-w-4xl' | 'max-w-5xl'
}

export function SnippetFormSkeleton({ maxWidth = 'max-w-5xl' }: Props) {
	return (
		<div className={`mx-auto ${maxWidth} px-4 py-8`}>
			<Skeleton className="mb-6 h-9 w-48" />
			<div className="space-y-8">
				<div className="space-y-4">
					<div className="flex flex-col gap-1">
						<Skeleton className="mb-2 h-5 w-16" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="flex flex-col gap-1">
						<Skeleton className="mb-2 h-5 w-24" />
						<Skeleton className="h-32 w-full" />
					</div>
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<Skeleton className="h-5 w-12" />
						<div className="flex items-center gap-4">
							<Skeleton className="h-8 w-32" />
							<Skeleton className="h-8 w-10 lg:w-36" />
						</div>
					</div>
					<EditorLikeSkeleton heightClassName="h-80" lineCount={12} />
				</div>

				<div>
					<Skeleton className="mb-2 h-5 w-20" />
					<div className="flex gap-4">
						<div className="flex gap-2">
							<Skeleton className="h-5 w-5 rounded-full" />
							<Skeleton className="h-5 w-15" />
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-5 w-5 rounded-full" />
							<Skeleton className="h-5 w-15" />
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-5 w-5 rounded-full" />
							<Skeleton className="h-5 w-15" />
						</div>
					</div>
				</div>

				<div>
					<Skeleton className="mb-2 h-5 w-40" />
					<Skeleton className="h-10 w-full" />
				</div>

				<div>
					<Skeleton className="mb-2 h-5 w-24" />
					<div className="flex flex-wrap gap-2">
						{Array.from({ length: 7 }).map((_, i) => (
							<Skeleton key={i} className="h-7 w-20 rounded-full" />
						))}
					</div>
				</div>

				<div className="flex items-center gap-4 pt-4">
					<Skeleton className="h-10 w-36 rounded-xl" />
					<Skeleton className="h-10 w-24 rounded-xl" />
				</div>
			</div>
		</div>
	)
}

type EditorLikeSkeletonProps = {
	heightClassName: string
	lineCount: number
}

function EditorLikeSkeleton({
	heightClassName,
	lineCount,
}: EditorLikeSkeletonProps) {
	const lineWidths = ['w-[94%]', 'w-[82%]', 'w-[88%]', 'w-[76%]', 'w-[90%]']

	return (
		<div className="relative max-h-150 overflow-hidden rounded-xl border-2 border-gray-200 bg-[#303841] dark:border-gray-700 dark:bg-[#1E1E1E]">
			<Skeleton className="absolute right-2 top-2 z-10 h-8 w-8 rounded-lg bg-white/20 dark:bg-white/10" />
			<div className={`${heightClassName} px-4 py-4`}>
				<div className="space-y-3">
					{Array.from({ length: lineCount }).map((_, idx) => (
						// Mirror editor active-line highlight for loading state.
						<Skeleton
							key={idx}
							className={`h-3 ${lineWidths[idx % lineWidths.length]} rounded-sm ${
								idx === 0
									? 'bg-[#00000059] dark:bg-[#ffffff0f] w-full h-4'
									: 'bg-white/15 dark:bg-white/10'
							}`}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
