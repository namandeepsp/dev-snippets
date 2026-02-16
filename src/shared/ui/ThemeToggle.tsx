'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	return (
		<button
			type="button"
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
			className="rounded-lg border border-default px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-slate-800"
		>
			{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
		</button>
	)
}
