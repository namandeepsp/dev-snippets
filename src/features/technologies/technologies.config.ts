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
	{ value: 'webpack', label: 'Webpack', iconKey: 'webpack' },
	{ value: 'rollup', label: 'Rollup', iconKey: 'rollup' },
	{
		value: 'browser-extension',
		label: 'Browser Extension',
		iconKey: 'browser-extension',
	},
	{ value: 'nextjs', label: 'Next.js', iconKey: 'nextjs' },
	{ value: 'angular', label: 'Angular', iconKey: 'angular' },
]

export const TECHNOLOGIES: SnippetTechnology[] = TECHNOLOGY_OPTIONS.map(
	(option) => option.value,
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
]
