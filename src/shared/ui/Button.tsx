import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'primary' | 'secondary'
}

export function Button({
	variant = 'primary',
	className,
	...props
}: ButtonProps) {
	return (
		<button
			{...props}
			className={clsx(
				'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition',
				variant === 'primary' &&
					'bg-foreground text-background hover:opacity-90',
				variant === 'secondary' &&
					'border border-default hover:bg-gray-100 dark:hover:bg-slate-800',
				className,
			)}
		/>
	)
}
