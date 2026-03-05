import { cn } from '@/shared/utils/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'outline'
	| 'ghost'
	| 'danger'
	| 'glass'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	isLoading?: boolean
	leftIcon?: ReactNode
	rightIcon?: ReactNode
	children: ReactNode
	ref?: React.Ref<HTMLButtonElement>
}

export function Button({
	variant = 'primary',
	size = 'md',
	isLoading = false,
	leftIcon,
	rightIcon,
	className,
	disabled,
	children,
	ref,
	...props
}: ButtonProps) {
	const baseStyles =
		'inline-flex cursor-pointer items-center justify-center gap-2.5 font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-4'

	const variants = {
		primary:
			'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] focus:ring-blue-500/20 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40',
		secondary:
			'bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-[0.98] focus:ring-gray-400/20 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
		outline:
			'border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] focus:ring-gray-400/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600',
		ghost:
			'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400/20 dark:text-gray-300 dark:hover:bg-gray-800',
		danger:
			'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] focus:ring-red-500/20 shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40',
		glass:
			'border border-white/55 bg-white/70 text-slate-900 backdrop-blur-xl hover:bg-white/85 active:scale-[0.98] focus:ring-blue-500/20 dark:border-white/20 dark:bg-slate-900/45 dark:text-slate-100 dark:hover:bg-slate-900/65',
	}

	const sizes = {
		sm: 'px-4 py-2 text-sm rounded-lg',
		md: 'px-5 py-2.5 text-base rounded-xl',
		lg: 'px-6 py-3.5 text-lg rounded-2xl',
	}

	return (
		<button
			ref={ref}
			className={cn(baseStyles, variants[variant], sizes[size], className)}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? (
				<>
					<svg
						className="animate-spin h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					<span>Loading...</span>
				</>
			) : (
				<>
					{leftIcon && <span className="shrink-0">{leftIcon}</span>}
					{children}
					{rightIcon && <span className="shrink-0">{rightIcon}</span>}
				</>
			)}
		</button>
	)
}
