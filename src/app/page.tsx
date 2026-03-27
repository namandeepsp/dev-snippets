import type { Metadata } from 'next'
import { HomePageClient } from './HomePageClient'

export const metadata: Metadata = {
	title: 'DevSnippets - Store and Share Code Snippets',
	description:
		'Store, organize, and share reusable code snippets across technologies.',
	alternates: {
		canonical: '/',
	},
}

export default function HomePage() {
	return <HomePageClient />
}
