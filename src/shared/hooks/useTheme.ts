'use client'

import { useTheme as useNextTheme } from 'next-themes'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
	const { theme, setTheme, resolvedTheme } = useNextTheme()
	const resolved: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light'

	return {
		theme: (theme ?? 'system') as Theme,
		resolvedTheme: resolved,
		setTheme: (value: Theme) => setTheme(value),
	}
}
