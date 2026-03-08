import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Header } from '@/shared/ui/Header'
import { TooltipProvider } from '@/shared/ui/Tooltip'
import { Toaster } from '@/shared/ui/design-system'
import { Providers } from './providers'

export const metadata: Metadata = {
	title: 'DevSnippets',
	description:
		'Store, share, and manage reusable code snippets across technologies.',
	icons: {
		icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
		shortcut: ['/icon.svg'],
		apple: [{ url: '/icon.svg' }],
	},
}

export default function RootLayout({
	children,
	modal,
}: {
	children: React.ReactNode
	modal: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen bg-background text-foreground">
				<Providers>
					<Header />
					<main className="pt-18.25">{children}</main>
					{modal}
					<Toaster />
					<TooltipProvider />
				</Providers>
			</body>
		</html>
	)
}
