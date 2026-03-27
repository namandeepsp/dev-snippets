import type { Metadata } from 'next'
import { SnippetsPageClient } from './SnippetsPageClient'

export const metadata: Metadata = {
	title: 'Community Snippets - DevSnippets',
	description:
		'Discover reusable code snippets shared by the DevSnippets community.',
	alternates: {
		canonical: '/snippets',
	},
}

export default function SnippetsPage() {
	return <SnippetsPageClient />
}
