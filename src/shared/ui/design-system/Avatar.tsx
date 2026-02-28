import { cn } from '@/shared/utils/utils'
import type { HTMLAttributes } from 'react'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
	size?: AvatarSize
	name?: string
	src?: string | null
}

export function Avatar({
	size = 'md',
	name,
	src,
	className,
	...props
}: AvatarProps) {
	const isClickable = typeof props.onClick === 'function'
	const sizes = {
		xs: 'w-6 h-6 text-xs',
		sm: 'w-8 h-8 text-sm',
		md: 'w-10 h-10 text-base',
		lg: 'w-12 h-12 text-lg',
		xl: 'w-16 h-16 text-2xl',
	}

	const getInitials = (name?: string) => {
		if (!name) return '?'
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	const baseStyles =
		'rounded-full object-cover flex items-center justify-center font-medium'

	if (src) {
		return (
			<img
				src={src}
				alt={name || 'Avatar'}
				className={cn(
					baseStyles,
					sizes[size],
					isClickable && 'cursor-pointer',
					className,
				)}
				{...props}
			/>
		)
	}

	return (
		<div
			className={cn(
				baseStyles,
				sizes[size],
				isClickable && 'cursor-pointer',
				'bg-linear-to-br from-blue-500 to-purple-600 text-white',
				className,
			)}
		>
			{getInitials(name)}
		</div>
	)
}
