import { cn } from '@/shared/utils/utils'
import type { HTMLAttributes, ReactNode } from 'react'

type BadgeVariant =
	| 'default'
	| 'primary'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant
	size?: BadgeSize
	children: ReactNode
}

export function Badge({
	variant = 'default',
	size = 'md',
	className,
	children,
	...props
}: BadgeProps) {
	const baseStyles =
		'inline-flex items-center justify-center font-medium transition-colors'
	const isClickable = typeof props.onClick === 'function'

	const variants = {
		default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
		primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
		success:
			'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
		warning:
			'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
		danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
		info: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
	}

	const sizes = {
		sm: 'px-2 py-0.5 text-xs rounded-md',
		md: 'px-2.5 py-1 text-sm rounded-lg',
		lg: 'px-3 py-1.5 text-base rounded-xl',
	}

	return (
		<span
			className={cn(
				baseStyles,
				isClickable && 'cursor-pointer',
				variants[variant],
				sizes[size],
				className,
			)}
			{...props}
		>
			{children}
		</span>
	)
}
