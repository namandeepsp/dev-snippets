import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Header } from '@/shared/ui/Header'
import { Toaster } from '@/shared/ui/design-system'
import { Providers } from './providers'

export const metadata: Metadata = {
	title: 'DevSnippets',
	description:
		'Store, share, and manage reusable code snippets across technologies.',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen bg-background text-foreground">
				<Providers>
					<Header />
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	)
}
