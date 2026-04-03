import { Skeleton } from '@/shared/ui/design-system'

export function CodeEditorSkeleton() {
	const lineWidths = ['w-[94%]', 'w-[82%]', 'w-[88%]', 'w-[76%]', 'w-[90%]']

	return (
		<div className="relative max-h-150 overflow-hidden rounded-xl border-2 border-gray-200 bg-[#303841] dark:border-gray-700 dark:bg-[#1E1E1E]">
			<Skeleton className="absolute right-2 top-2 z-10 h-8 w-8 rounded-lg bg-white/20 dark:bg-white/10" />
			<div className="h-80 px-4 py-4">
				<div className="space-y-3">
					{Array.from({ length: 12 }).map((_, idx) => (
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
