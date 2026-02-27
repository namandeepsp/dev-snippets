'use client'

import { AuthProvider } from '@/features/auth/ui/store/auth.store'
import '@/features/editor/formatter'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<AuthProvider>{children}</AuthProvider>
		</ThemeProvider>
	)
}
