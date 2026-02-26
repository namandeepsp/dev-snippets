import { cn } from '@/shared/utils/utils'

type EqualizerLoaderProps = {
	className?: string
}

export function EqualizerLoader({ className }: EqualizerLoaderProps) {
	const bars = [
		{ height: 'h-6', delay: '0ms', color: 'bg-blue-500/75 dark:bg-blue-400/75' },
		{ height: 'h-7', delay: '120ms', color: 'bg-blue-600/80 dark:bg-blue-500/80' },
		{ height: 'h-8', delay: '240ms', color: 'bg-blue-700/85 dark:bg-blue-500/85' },
		{ height: 'h-7', delay: '360ms', color: 'bg-blue-600/80 dark:bg-blue-500/80' },
		{ height: 'h-6', delay: '480ms', color: 'bg-blue-500/75 dark:bg-blue-400/75' },
	]

	return (
		<div
			role="status"
			aria-label="Loading"
			className={cn('mt-5 flex items-end justify-center gap-1.5', className)}
		>
			{bars.map((bar) => (
				<div
					key={`${bar.height}-${bar.delay}`}
					className={cn('w-1.5 rounded animate-bounce', bar.height, bar.color)}
					style={{ animationDelay: bar.delay, animationDuration: '900ms' }}
				/>
			))}
		</div>
	)
}
