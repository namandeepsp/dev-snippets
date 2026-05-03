import { Skeleton } from '@/shared/ui/design-system'

type Props = {
	maxWidth?: 'max-w-4xl' | 'max-w-5xl'
}

export function SnippetFormSkeleton({ maxWidth = 'max-w-5xl' }: Props) {
	return (
		<div className={`mx-auto ${maxWidth} px-4 py-8`}>
			<Skeleton className="mb-6 h-9 w-48" />
			<div className="space-y-8">
				{/* Title and Description */}
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

				{/* Visibility */}
				<div>
					<Skeleton className="mb-2 h-5 w-20" />
					<Skeleton className="h-10 w-full" />
				</div>

				{/* Files Section with Tabs */}
				<div className="space-y-4">
					<Skeleton className="h-5 w-12" />
					{/* File Tabs */}
					<div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
						<div className="flex gap-1 overflow-x-auto">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton
									key={i}
									className={`h-8 w-24 rounded-md ${i === 0 ? 'bg-gray-200 dark:bg-slate-700' : 'bg-gray-100 dark:bg-slate-800'}`}
								/>
							))}
						</div>
						<Skeleton className="shrink-0 h-8 w-8 rounded-md" />
						<Skeleton className="shrink-0 h-8 w-8 rounded-md" />
					</div>

					{/* Filename and Language - Responsive Layout */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						{/* Filename Input with Extension */}
						<div className="flex flex-col gap-1 flex-1">
							<div className="flex items-center gap-2">
								<Skeleton className="h-10 flex-1 sm:max-w-48 rounded-lg" />
								<Skeleton className="h-6 w-12 rounded-md" />
							</div>
						</div>

						{/* Language Select and Delete Button */}
						<div className="flex gap-3">
							<Skeleton className="h-10 w-32 rounded-lg" />
							<Skeleton className="h-10 w-10 rounded-lg" />
						</div>
					</div>

					{/* Code Editor */}
					<EditorLikeSkeleton heightClassName="h-80" lineCount={12} />
				</div>

				{/* Technologies */}
				<div>
					<Skeleton className="mb-2 h-5 w-20" />
					<div className="flex gap-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex gap-2">
								<Skeleton className="h-5 w-5 rounded-full" />
								<Skeleton className="h-5 w-15" />
							</div>
						))}
					</div>
				</div>

				{/* Categories */}
				<div>
					<Skeleton className="mb-2 h-5 w-24" />
					<div className="flex flex-wrap gap-2">
						{Array.from({ length: 7 }).map((_, i) => (
							<Skeleton key={i} className="h-7 w-20 rounded-full" />
						))}
					</div>
				</div>

				{/* Action Buttons */}
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
			{/* Header with buttons */}
			<div className="flex items-center justify-between border-b border-white/10 bg-[#303841] px-4 py-2 dark:bg-[#1E1E1E]">
				<Skeleton className="h-6 w-20 rounded-md bg-white/20 dark:bg-white/10" />
				<div className="flex gap-2">
					<Skeleton className="h-8 w-16 rounded-lg bg-white/20 dark:bg-white/10" />
					<Skeleton className="h-8 w-16 rounded-lg bg-white/20 dark:bg-white/10" />
				</div>
			</div>

			{/* Code lines */}
			<div className={`${heightClassName} px-4 py-4`}>
				<div className="space-y-3">
					{Array.from({ length: lineCount }).map((_, idx) => (
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

			{/* Footer */}
			<div className="border-t border-white/10 bg-[#303841] px-4 py-2 dark:bg-[#1E1E1E]">
				<Skeleton className="h-3 w-32 bg-white/15 dark:bg-white/10" />
			</div>
		</div>
	)
}
