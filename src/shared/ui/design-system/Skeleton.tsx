import { cn } from '@/shared/utils/utils'

type Props = {
	className?: string
}

export function Skeleton({ className }: Props) {
	return (
		<div
			className={cn(
				'animate-pulse rounded bg-gray-300 dark:bg-gray-600',
				className,
			)}
		/>
	)
}
