'use client'

import { AuthProvider } from '@/features/auth/ui/store/auth.store'
import { formatterRegistry } from '@/features/editor/formatter/formatter.registry'
import { logger } from '@/shared/utils/logger'
import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		formatterRegistry.initializeLanguageDetection().catch((error) => {
			logger.warn('Failed to initialize language detection:', error)
		})
	}, [])

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
