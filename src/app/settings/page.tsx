import type { Metadata } from 'next'
import { SettingsPageClient } from './SettingsPageClient'

export const metadata: Metadata = {
	title: 'Account Settings - DevSnippets',
	description: 'Manage your DevSnippets profile, account, and session.',
	robots: {
		index: false,
		follow: false,
	},
}

export default function SettingsPage() {
	return <SettingsPageClient />
}
