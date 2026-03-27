import type { Metadata } from 'next'
import { LoginPageClient } from './LoginPageClient'

export const metadata: Metadata = {
	title: 'Sign in to DevSnippets',
	description: 'Sign in or create an account to save and share code snippets.',
	robots: {
		index: false,
		follow: false,
	},
}

export default function LoginPage() {
	return <LoginPageClient />
}
