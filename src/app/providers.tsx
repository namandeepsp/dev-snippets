'use client'

import { AuthProvider } from '@/features/auth/ui/store/auth.store'
import { formatterRegistry } from '@/features/editor/formatter/formatter.registry'
import { logger } from '@/shared/utils/logger'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useEffect, useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 5, // 5 minutes
						gcTime: 1000 * 60 * 10, // 10 minutes
						retry: 1,
					},
				},
			}),
	)

	useEffect(() => {
		formatterRegistry.initializeLanguageDetection().catch((error) => {
			logger.warn('Failed to initialize language detection:', error)
		})
	}, [])

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<AuthProvider>{children}</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	)
}
