import type { SnippetTechnology } from './snippet.types'

/**
 * ============================================================================
 * TECHNOLOGY COLORS
 * ============================================================================
 *
 * Consistent color mapping for technology badges.
 * Uses Tailwind color classes for easy theming.
 */

export const TECHNOLOGY_COLORS: Record<SnippetTechnology, string> = {
	// JavaScript ecosystem
	javascript: 'bg-yellow-500',
	typescript: 'bg-blue-500',

	// Frontend frameworks
	react: 'bg-sky-500',
	redux: 'bg-purple-500',
	nextjs: 'bg-black dark:bg-white dark:text-black',
	angular: 'bg-red-600',

	// Backend
	node: 'bg-green-600',
	express: 'bg-gray-600',

	// Languages
	golang: 'bg-cyan-500',
	python: 'bg-emerald-500',

	// Build tools
	webpack: 'bg-blue-600',
	rollup: 'bg-red-500',

	// Platforms
	'browser-extension': 'bg-orange-500',

	// Data
	markdown: 'bg-slate-500',
	sql: 'bg-indigo-500',
	'postgres-sql': 'bg-indigo-700',

	// DevOps
	docker: 'bg-sky-600',
	'dev-ops': 'bg-zinc-600',
}
