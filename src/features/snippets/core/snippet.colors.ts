import type { SnippetTechnology } from './snippet.types'

export const TECHNOLOGY_COLORS: Record<SnippetTechnology, string> = {
	javascript: 'bg-yellow-500',
	typescript: 'bg-blue-500',

	react: 'bg-sky-500',
	redux: 'bg-purple-500',
	nextjs: 'bg-gray-200 dark:bg-black text-zinc-900 dark:text-white',
	angular: 'bg-emerald-600 dark:bg-emerald-500',

	node: 'bg-green-600',
	express: 'bg-gray-600',

	golang: 'bg-cyan-500',
	python: 'bg-emerald-500',
	java: 'bg-red-600',
	rust: 'bg-orange-700',
	ruby: 'bg-red-500',
	php: 'bg-purple-600',
	csharp: 'bg-green-600',
	cpp: 'bg-blue-700',

	webpack: 'bg-blue-600',
	rollup: 'bg-red-500 dark:bg-red-600',

	'browser-extension': 'bg-orange-500',

	markdown: 'bg-slate-500',
	sql: 'bg-indigo-500',
	'postgres-sql': 'bg-indigo-700',
	nosql: 'bg-green-700',
	json: 'bg-gray-700',
	html: 'bg-orange-600',
	css: 'bg-blue-600',
	yaml: 'bg-red-600',

	docker: 'bg-sky-600',
	'dev-ops': 'bg-zinc-600',
}
