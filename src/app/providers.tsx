'use client'

import { AuthBootstrapLoader } from '@/features/auth/ui/AuthBootstrapLoader'
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
			<AuthProvider>
				<AuthBootstrapLoader />
				{children}
			</AuthProvider>
		</ThemeProvider>
	)
}
