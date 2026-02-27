'use client'

import { useTheme } from '@/shared/hooks/useTheme'
import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
	const { resolvedTheme } = useTheme()

	return (
		<SonnerToaster
			theme={resolvedTheme}
			position="top-right"
			toastOptions={{
				style: {
					borderRadius: '16px',
					backdropFilter: 'blur(14px)',
				},
				className:
					'rounded-2xl border border-white/50 bg-white/85 text-slate-900 shadow-xl shadow-slate-900/10 dark:border-white/15 dark:bg-slate-900/85 dark:text-slate-100',
			}}
			richColors
		/>
	)
}

export { toast } from 'sonner'
