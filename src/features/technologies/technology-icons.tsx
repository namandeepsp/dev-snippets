'use client'

import { cn } from '@/shared/utils/utils'
import type { IconType } from 'react-icons'
import { FaJava } from 'react-icons/fa'
import {
	LuBraces,
	LuCode,
	LuDatabase,
	LuFileText,
	LuPuzzle,
	LuServer,
} from 'react-icons/lu'
import {
	SiAngular,
	SiCss,
	SiDocker,
	SiExpress,
	SiGo,
	SiHtml5,
	SiJavascript,
	SiMarkdown,
	SiNextdotjs,
	SiNodedotjs,
	SiPostgresql,
	SiPython,
	SiReact,
	SiRedux,
	SiRollupdotjs,
	SiTypescript,
	SiWebpack,
} from 'react-icons/si'
import type { SnippetTechnology } from '../snippets/core/snippet.types'

const iconClass = 'h-3.5 w-3.5 shrink-0 text-slate-700 dark:text-slate-200'

type IconConfig = {
	icon: IconType
	className?: string
}

const TECHNOLOGY_ICON_MAP: Partial<Record<SnippetTechnology, IconConfig>> = {
	javascript: { icon: SiJavascript },
	typescript: { icon: SiTypescript },
	react: { icon: SiReact },
	redux: { icon: SiRedux },
	node: { icon: SiNodedotjs },
	express: {
		icon: SiExpress,
		className: 'h-4 w-4 drop-shadow-[0_0_0.2px_currentColor]',
	},
	golang: { icon: SiGo },
	java: {
		icon: FaJava,
		className:
			'h-4 w-4 scale-110 text-slate-900 dark:text-white drop-shadow-[0_0_0.8px_currentColor]',
	},
	webpack: { icon: SiWebpack },
	rollup: { icon: SiRollupdotjs },
	'browser-extension': { icon: LuPuzzle },
	nextjs: { icon: SiNextdotjs },
	angular: { icon: SiAngular },
	python: { icon: SiPython },
	markdown: { icon: SiMarkdown },
	sql: { icon: LuDatabase },
	'postgres-sql': { icon: SiPostgresql },
	nosql: { icon: LuDatabase },
	docker: { icon: SiDocker },
	'dev-ops': { icon: LuServer },
	json: { icon: LuBraces },
	html: { icon: SiHtml5 },
	css: { icon: SiCss },
	yaml: { icon: LuFileText },
}

export function TechnologyIcon({
	technology,
	className,
}: {
	technology: SnippetTechnology
	className?: string
}) {
	const config = TECHNOLOGY_ICON_MAP[technology]
	const Icon = config?.icon ?? LuCode
	const classes = cn(iconClass, config?.className, className)

	return <Icon className={classes} aria-hidden />
}
