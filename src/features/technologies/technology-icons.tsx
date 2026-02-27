import { cn } from '@/shared/utils/utils'
import type { IconType } from 'react-icons'
import { LuCode, LuPuzzle } from 'react-icons/lu'
import {
	SiAngular,
	SiExpress,
	SiGo,
	SiJavascript,
	SiNextdotjs,
	SiNodedotjs,
	SiReact,
	SiRedux,
	SiRollupdotjs,
	SiTypescript,
	SiWebpack,
} from 'react-icons/si'
import type { SnippetTechnology } from '../snippets/core/snippet.types'

const iconClass = 'h-3.5 w-3.5 shrink-0 text-slate-700 dark:text-slate-200'

const TECHNOLOGY_ICON_MAP: Partial<Record<SnippetTechnology, IconType>> = {
	javascript: SiJavascript,
	typescript: SiTypescript,
	react: SiReact,
	redux: SiRedux,
	node: SiNodedotjs,
	express: SiExpress,
	golang: SiGo,
	webpack: SiWebpack,
	rollup: SiRollupdotjs,
	'browser-extension': LuPuzzle,
	nextjs: SiNextdotjs,
	angular: SiAngular,
}

export function TechnologyIcon({
	technology,
	className,
}: {
	technology: SnippetTechnology
	className?: string
}) {
	const classes = cn(iconClass, className)
	const Icon = TECHNOLOGY_ICON_MAP[technology] ?? LuCode
	return <Icon className={classes} aria-hidden />
}
