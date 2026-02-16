import { TECHNOLOGY_COLORS } from '../core/snippet.colors'
import type { SnippetTechnology } from '../core/snippet.types'

type Props = {
	/** The technology to display */
	technology: SnippetTechnology
	/** Size variant */
	size?: 'sm' | 'md' | 'lg'
	/** Whether to show as a link */
	href?: string
	/** Optional click handler */
	onClick?: () => void
}

const sizeClasses = {
	sm: 'px-2 py-0.5 text-xs',
	md: 'px-2.5 py-0.5 text-xs',
	lg: 'px-3 py-1 text-sm',
}

/**
 * ============================================================================
 * TECHNOLOGY BADGE
 * ============================================================================
 *
 * Displays a technology tag with consistent styling and colors.
 * Used in snippet cards, detail pages, and filters.
 */

export function TechnologyBadge({
	technology,
	size = 'md',
	href,
	onClick,
}: Props) {
	const baseColor = TECHNOLOGY_COLORS[technology] || 'bg-gray-500'
	const colorClass = `${baseColor} text-white`

	const content = (
		<span
			className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size]}
        ${href || onClick ? 'cursor-pointer hover:opacity-80 transition' : ''}
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
			{technology}
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
