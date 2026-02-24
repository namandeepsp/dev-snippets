'use client'

import { useTheme } from '@/shared/hooks/useTheme'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	const items: Array<{
		id: 'light' | 'dark' | 'system'
		label: string
		icon: string
	}> = [
		{ id: 'light', label: 'Light', icon: '☀️' },
		{ id: 'dark', label: 'Dark', icon: '🌙' },
		{ id: 'system', label: 'System', icon: '💻' },
	]

	return (
		<div className="inline-flex rounded-full border border-white/30 bg-white/55 p-1 shadow-sm backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55">
			{items.map((item) => {
				const active = theme === item.id

				return (
					<button
						key={item.id}
						type="button"
						onClick={() => setTheme(item.id)}
						aria-label={item.label}
						className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition ${
							active
								? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md shadow-blue-500/35'
								: 'text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800/60'
						}`}
					>
						<span className="sm:hidden" aria-hidden>
							{item.icon}
						</span>
						<span className="hidden sm:inline">{item.label}</span>
					</button>
				)
			})}
		</div>
	)
}
