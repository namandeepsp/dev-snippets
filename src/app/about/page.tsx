import type { Metadata } from 'next'
import { AboutPageClient } from './AboutPageClient'

export const metadata: Metadata = {
	title: 'About DevSnippets',
	description:
		'Learn how DevSnippets helps developers organize, share, and reuse code snippets.',
	alternates: {
		canonical: '/about',
	},
}

export default function AboutPage() {
	return <AboutPageClient />
}
