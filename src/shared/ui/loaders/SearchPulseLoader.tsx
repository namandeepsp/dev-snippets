import { cn } from '@/shared/utils/utils'

type SearchPulseLoaderProps = {
	label?: string
	className?: string
}

export function SearchPulseLoader({
	label = 'Searching snippets...',
	className,
}: SearchPulseLoaderProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			className={cn(
				'flex flex-col items-center justify-center gap-3 py-6 text-sm text-gray-600 dark:text-gray-300',
				className,
			)}
		>
			<div className="flex items-center gap-1.5">
				<span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:0ms]" />
				<span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:140ms]" />
				<span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:280ms]" />
			</div>
			<span>{label}</span>
		</div>
	)
}
