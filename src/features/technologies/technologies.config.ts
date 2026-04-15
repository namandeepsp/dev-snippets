import type { EditorLanguage } from '../editor/editor.config'
import type {
	SnippetCategory,
	SnippetTechnology,
} from '../snippets/core/snippet.types'

export type TechnologyOption = {
	value: SnippetTechnology
	label: string
	iconKey: SnippetTechnology
}

export const TECHNOLOGY_OPTIONS: TechnologyOption[] = [
	{ value: 'javascript', label: 'JavaScript', iconKey: 'javascript' },
	{ value: 'typescript', label: 'TypeScript', iconKey: 'typescript' },
	{ value: 'react', label: 'React', iconKey: 'react' },
	{ value: 'redux', label: 'Redux', iconKey: 'redux' },
	{ value: 'node', label: 'Node.js', iconKey: 'node' },
	{ value: 'express', label: 'Express', iconKey: 'express' },
	{ value: 'golang', label: 'Go', iconKey: 'golang' },
	{ value: 'java', label: 'Java', iconKey: 'java' },
	{ value: 'webpack', label: 'Webpack', iconKey: 'webpack' },
	{ value: 'rollup', label: 'Rollup', iconKey: 'rollup' },
	{
		value: 'browser-extension',
		label: 'Browser Extension',
		iconKey: 'browser-extension',
	},
	{ value: 'nextjs', label: 'Next.js', iconKey: 'nextjs' },
	{ value: 'angular', label: 'Angular', iconKey: 'angular' },
	{ value: 'python', label: 'Python', iconKey: 'python' },
	{ value: 'markdown', label: 'Markdown', iconKey: 'markdown' },
	{ value: 'sql', label: 'SQL', iconKey: 'sql' },
	{ value: 'postgres-sql', label: 'PostgreSQL', iconKey: 'postgres-sql' },
	{ value: 'nosql', label: 'NoSQL', iconKey: 'nosql' },
	{ value: 'docker', label: 'Docker', iconKey: 'docker' },
	{ value: 'dev-ops', label: 'DevOps', iconKey: 'dev-ops' },
	{ value: 'json', label: 'JSON', iconKey: 'json' },
	{ value: 'html', label: 'HTML', iconKey: 'html' },
	{ value: 'css', label: 'CSS', iconKey: 'css' },
	{ value: 'yaml', label: 'YAML', iconKey: 'yaml' },
]

export const TECHNOLOGIES: SnippetTechnology[] = TECHNOLOGY_OPTIONS.map(
	(option) => option.value,
)

export const TECHNOLOGY_TO_EDITOR_LANGUAGE: Partial<
	Record<SnippetTechnology, EditorLanguage>
> = {
	javascript: 'javascript',
	typescript: 'typescript',
	react: 'javascript',
	redux: 'javascript',
	node: 'javascript',
	express: 'javascript',
	golang: 'go',
	webpack: 'javascript',
	rollup: 'javascript',
	'browser-extension': 'javascript',
	nextjs: 'typescript',
	angular: 'typescript',
	python: 'python',
	markdown: 'markdown',
	sql: 'sql',
	'postgres-sql': 'sql',
	nosql: 'json',
	docker: 'yaml',
	'dev-ops': 'bash',
	json: 'json',
	html: 'html',
	css: 'css',
	yaml: 'yaml',
}

export const LANGUAGE_TO_PRIMARY_TECHNOLOGY: Partial<
	Record<EditorLanguage, SnippetTechnology>
> = {
	javascript: 'javascript',
	typescript: 'typescript',
	go: 'golang',
	java: 'java',
	python: 'python',
	markdown: 'markdown',
	sql: 'sql',
	json: 'json',
	html: 'html',
	css: 'css',
	yaml: 'yaml',
	bash: 'dev-ops',
	dockerfile: 'docker',
	rust: 'rust',
	ruby: 'ruby',
	php: 'php',
	csharp: 'csharp',
	cpp: 'cpp',
}

export const PRIMARY_LANGUAGE_TECHNOLOGIES = new Set(
	Object.values(LANGUAGE_TO_PRIMARY_TECHNOLOGY),
)

export function getTechnologyOption(
	technology: SnippetTechnology,
): TechnologyOption {
	return (
		TECHNOLOGY_OPTIONS.find((option) => option.value === technology) ?? {
			value: technology,
			label: technology,
			iconKey: technology,
		}
	)
}

export const CATEGORIES: SnippetCategory[] = [
	'language',
	'framework',
	'bundler',
	'platform',
	'library',
	'frontend',
	'hooks',
	'backend',
	'middleware',
	'database',
	'devops',
	'testing',
	'security',
	'performance',
	'design',
	'algorithms',
	'data-structures',
	'miscellaneous',
	'queries',
	'infrastructure',
	'deployment',
	'utilities',
	'network',
	'data',
	'architecture',
	'types',
	'state',
	'events',
	'storage',
	'validation',
	'api',
	'microservices',
]

export const TECHNOLOGY_CATEGORY_MAP: Record<
	SnippetTechnology,
	SnippetCategory[]
> = {
	javascript: ['language'],
	typescript: ['language'],
	react: ['framework', 'frontend'],
	redux: ['library'],
	node: ['platform', 'backend'],
	express: ['framework', 'backend'],
	golang: ['language', 'backend', 'microservices'],
	java: ['language', 'backend', 'microservices'],
	webpack: ['bundler'],
	rollup: ['bundler'],
	'browser-extension': ['platform'],
	nextjs: ['framework', 'frontend', 'backend'],
	angular: ['framework', 'frontend', 'backend'],
	python: ['language', 'backend'],
	rust: ['language', 'backend'],
	ruby: ['language', 'backend'],
	php: ['language', 'backend'],
	csharp: ['language', 'backend'],
	cpp: ['language', 'backend'],
	markdown: ['language'],
	sql: ['language', 'database', 'backend'],
	'postgres-sql': ['language', 'database', 'backend'],
	nosql: ['database', 'backend'],
	docker: ['devops', 'infrastructure'],
	'dev-ops': ['devops', 'infrastructure'],
	json: ['language'],
	html: ['language', 'frontend'],
	css: ['language', 'frontend'],
	yaml: ['language'],
}
