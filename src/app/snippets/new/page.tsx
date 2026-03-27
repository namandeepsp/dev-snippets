import type { Metadata } from 'next'
import { NewSnippetPageClient } from './NewSnippetPageClient'

export const metadata: Metadata = {
	title: 'Create Snippet - DevSnippets',
	description: 'Create a new code snippet and share it with your team.',
	robots: {
		index: false,
		follow: false,
	},
}

export default function NewSnippetPage() {
	return <NewSnippetPageClient />
}
