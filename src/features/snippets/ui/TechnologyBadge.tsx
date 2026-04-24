import { getTechnologyOption } from '@/features/technologies/technologies.config'
import { TechnologyIcon } from '@/features/technologies/technology-icons'
import { TECHNOLOGY_COLORS } from '../core/snippet.colors'
import type { SnippetTechnology } from '../core/snippet.types'

type Props = {
	technology: SnippetTechnology
	size?: 'sm' | 'md' | 'lg'
	href?: string
	onClick?: () => void
	selected?: boolean
}

const sizeClasses = {
	sm: 'px-3 py-1 text-xs',
	md: 'px-3.5 py-1 text-xs',
	lg: 'px-4 py-1.5 text-sm',
}

export function TechnologyBadge({
	technology,
	size = 'md',
	href,
	onClick,
	selected = false,
}: Props) {
	const option = getTechnologyOption(technology)

	const baseColor =
		onClick && !selected
			? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
			: TECHNOLOGY_COLORS[technology] || 'bg-gray-500'
	const colorClass = baseColor

	const content = (
		<span
			className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size]}
        ${href || onClick ? 'cursor-pointer transition' : ''}
        ${onClick && !selected ? 'hover:bg-gray-300 dark:hover:bg-gray-600' : href || onClick ? 'hover:opacity-80' : ''}
        ${colorClass}
      `}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			onKeyDown={
				onClick
					? (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault()
								onClick()
							}
						}
					: undefined
			}
		>
			<span className="mr-1" aria-hidden>
				<TechnologyIcon
					technology={option.iconKey}
					className={`h-3 w-3 ${selected || !onClick ? 'text-white dark:text-white' : 'text-gray-800 dark:text-gray-100'}`}
				/>
			</span>
			{option.label}
		</span>
	)

	if (href) {
		return (
			<a href={href} className="no-underline">
				{content}
			</a>
		)
	}

	return content
}
