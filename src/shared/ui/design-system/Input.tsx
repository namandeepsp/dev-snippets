import { cn } from '@/shared/utils/utils'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Skeleton } from './Skeleton'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: string
	helperText?: string
	leftIcon?: ReactNode
	rightIcon?: ReactNode
	variant?: 'default' | 'glass'
	loading?: boolean
}

export function Input({
	label,
	error,
	helperText,
	leftIcon,
	rightIcon,
	variant = 'default',
	className,
	loading = false,
	...props
}: InputProps) {
	return (
		<div className="w-full">
			{label && (
				<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
					{label}
				</label>
			)}
			{loading ? (
				<Skeleton className="h-10 w-full rounded-md" />
			) : (
				<div className="relative">
					{leftIcon && (
						<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
							{leftIcon}
						</div>
					)}
					<input
						className={cn(
							'w-full px-4 py-3 rounded-xl transition-all duration-200',
							'text-gray-900 dark:text-gray-100',
							'placeholder:text-gray-400 dark:placeholder:text-gray-500',
							'focus:outline-none focus:ring-4',
							variant === 'glass' &&
								'border border-white/55 bg-white/70 backdrop-blur-xl shadow-sm shadow-slate-900/5 dark:border-white/15 dark:bg-slate-900/40',
							variant === 'default' && 'border-2 bg-white dark:bg-gray-900',
							error
								? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
								: 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20',
							'disabled:opacity-50 disabled:cursor-not-allowed',
							leftIcon && 'pl-11',
							rightIcon && 'pr-11',
							className,
						)}
						{...props}
					/>
					{rightIcon && (
						<div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
							{rightIcon}
						</div>
					)}
				</div>
			)}
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

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
	label?: string
	error?: string
	helperText?: string
	rows?: number
	variant?: 'default' | 'glass'
}

export function Textarea({
	label,
	error,
	helperText,
	className,
	rows = 4,
	variant = 'default',
	...props
}: TextareaProps) {
	return (
		<div className="w-full">
			{label && (
				<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
					{label}
				</label>
			)}
			<textarea
				rows={rows}
				className={cn(
					'w-full px-4 py-3 rounded-xl transition-all duration-200',
					'text-gray-900 dark:text-gray-100',
					'placeholder:text-gray-400 dark:placeholder:text-gray-500',
					'focus:outline-none focus:ring-4',
					variant === 'glass' &&
						'border border-white/55 bg-white/70 backdrop-blur-xl shadow-sm shadow-slate-900/5 dark:border-white/15 dark:bg-slate-900/40',
					variant === 'default' && 'border-2 bg-white dark:bg-gray-900',
					error
						? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
						: 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20',
					'disabled:opacity-50 disabled:cursor-not-allowed',
					'resize-none',
					className,
				)}
				{...props}
			/>
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
