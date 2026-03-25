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
	nextjs: 'bg-zinc-300 dark:bg-black',
	angular: 'bg-emerald-600 dark:bg-emerald-500',

	// Backend
	node: 'bg-green-600',
	express: 'bg-gray-600',

	// Languages
	golang: 'bg-cyan-500',
	python: 'bg-emerald-500',
	java: 'bg-red-600',
	rust: 'bg-orange-700',
	ruby: 'bg-red-500',
	php: 'bg-purple-600',
	csharp: 'bg-green-600',
	cpp: 'bg-blue-700',

	// Build tools
	webpack: 'bg-blue-600',
	rollup: 'bg-red-500 dark:bg-red-600',

	// Platforms
	'browser-extension': 'bg-orange-500',

	// Data
	markdown: 'bg-slate-500',
	sql: 'bg-indigo-500',
	'postgres-sql': 'bg-indigo-700',
	nosql: 'bg-green-700',
	json: 'bg-gray-700',
	html: 'bg-orange-600',
	css: 'bg-blue-600',
	yaml: 'bg-red-600',

	// DevOps
	docker: 'bg-sky-600',
	'dev-ops': 'bg-zinc-600',
}
