import type { FirestoreSnippet } from '../../src/features/snippets/core/snippet.types'
import { createSnippetFile } from '../../src/features/snippets/core/snippet.utils'

export type SnippetTemplate = Pick<
	FirestoreSnippet,
	| 'title'
	| 'description'
	| 'files'
	| 'primaryLanguage'
	| 'technologies'
	| 'categories'
>

export const JS_SNIPPET_TEMPLATES: SnippetTemplate[] = [
	{
		title: 'Deep Clone Object',
		description: 'Create a deep copy of any object using JSON serialization',
		files: [
			createSnippetFile(
				'const deepClone = obj => JSON.parse(JSON.stringify(obj));',
				'javascript',
			),
		],
		primaryLanguage: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities'],
	},
	{
		title: 'Check if Array is Empty',
		description: 'Safely check if a value is an empty array',
		files: [
			createSnippetFile(
				'const isEmpty = arr => !Array.isArray(arr) || arr.length === 0;',
				'javascript',
			),
		],
		primaryLanguage: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities'],
	},
	{
		title: 'Generate Random Hex Color',
		description: 'Generate a random hex color code',
		files: [
			createSnippetFile(
				'const randomColor = () => `#${Math.floor(Math.random()*16777215).toString(16)}`;',
				'javascript',
			),
		],
		primaryLanguage: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities'],
	},
]
