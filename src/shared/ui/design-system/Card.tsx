import { cn } from '@/shared/utils/utils'
import type { HTMLAttributes, ReactNode } from 'react'

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'glass'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	variant?: CardVariant
	hoverable?: boolean
	children: ReactNode
}

export function Card({
	variant = 'elevated',
	hoverable = false,
	className,
	children,
	...props
}: CardProps) {
	const baseStyles = 'rounded-3xl transition-all duration-300'
	const isClickable = typeof props.onClick === 'function'

	const variants = {
		elevated:
			'bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 border border-gray-100 dark:border-gray-800',
		outlined:
			'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
		filled:
			'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750',
		glass:
			'border border-white/45 bg-white/60 shadow-2xl shadow-sky-900/15 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-black/30',
	}

	return (
		<div
			className={cn(
				baseStyles,
				variants[variant],
				isClickable && 'cursor-pointer',
				hoverable && 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}

export function CardHeader({
	className,
	children,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'px-8 py-6 border-b border-gray-100 dark:border-gray-800',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}

export function CardBody({
	className,
	children,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn('px-8 py-6', className)} {...props}>
			{children}
		</div>
	)
}

export function CardFooter({
	className,
	children,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'px-8 py-6 border-t border-gray-100 dark:border-gray-800',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}
