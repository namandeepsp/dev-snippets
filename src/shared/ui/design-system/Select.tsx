import { cn } from '@/shared/utils/utils'
import type { ReactNode, SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string
	error?: string
	helperText?: string
	variant?: 'default' | 'glass'
	uiSize?: 'sm' | 'md' | 'lg'
	leftIcon?: ReactNode
}

export function Select({
	label,
	error,
	helperText,
	variant = 'default',
	uiSize = 'md',
	leftIcon,
	className,
	children,
	...props
}: SelectProps) {
	const sizes = {
		sm: 'h-9 rounded-lg text-sm',
		md: 'h-11 rounded-xl text-sm',
		lg: 'h-12 rounded-2xl text-base',
	}

	return (
		<div className="w-max">
			{label && (
				<label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
					{label}
				</label>
			)}
			<div className="relative">
				{leftIcon && (
					<div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
						{leftIcon}
					</div>
				)}
				<select
					className={cn(
						'w-full cursor-pointer appearance-none border px-4 pr-10 transition-all duration-200',
						'text-gray-900 dark:text-gray-100',
						'focus:outline-none focus:ring-4',
						variant === 'glass' &&
							'border-white/55 bg-white/70 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/40',
						variant === 'default' &&
							'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
						error
							? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
							: 'focus:border-blue-500 focus:ring-blue-500/20',
						'disabled:cursor-not-allowed disabled:opacity-50',
						leftIcon && 'pl-10',
						sizes[uiSize],
						className,
					)}
					{...props}
				>
					{children}
				</select>
				<div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
					<svg
						viewBox="0 0 20 20"
						fill="none"
						stroke="currentColor"
						className="h-4 w-4"
					>
						<path
							d="M6 8l4 4 4-4"
							strokeWidth="1.7"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			</div>
			{error && (
				<p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
			)}
			{helperText && !error && (
				<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
					{helperText}
				</p>
			)}
		</div>
	)
}
