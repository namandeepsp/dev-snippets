'use client'

import { useTheme } from '@/shared/hooks/useTheme'
import { useEffect, useState } from 'react'
import { Button } from './design-system'

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
		tooltip: string
	}> = [
		{ id: 'light', label: 'Light', icon: '☀️', tooltip: 'Light mode' },
		{ id: 'dark', label: 'Dark', icon: '🌙', tooltip: 'Dark mode' },
		{ id: 'system', label: 'System', icon: '💻', tooltip: 'System preference' },
	]

	const cycleTheme = () => {
		const currentIndex = items.findIndex((item) => item.id === theme)
		const nextIndex = (currentIndex + 1) % items.length
		setTheme(items[nextIndex].id)
	}

	const currentItem = items.find((item) => item.id === theme) || items[0]

	return (
		<>
			{/* Desktop: Three-way toggle */}
			<div className="inline-flex rounded-full border border-white/30 bg-white/55 p-1 shadow-sm backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/55 max-[850px]:hidden">
				{items.map((item) => {
					const active = theme === item.id

					return (
						<Button
							key={item.id}
							type="button"
							onClick={() => setTheme(item.id)}
							aria-label={item.label}
							variant="ghost"
							size="sm"
							className={`rounded-full px-2.5 py-1.5 text-base transition ${
								active
									? 'bg-linear-to-r from-sky-500 to-blue-500 text-white shadow-md shadow-blue-500/35'
									: 'text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800/60'
							}`}
							data-tooltip-id="app-tooltip"
							data-tooltip-content={item.tooltip}
						>
							{item.icon}
						</Button>
					)
				})}
			</div>

			{/* Mobile: Single circular toggle */}
			<Button
				type="button"
				onClick={cycleTheme}
				aria-label={`Theme: ${currentItem.label}`}
				variant="glass"
				size="sm"
				className="hidden h-10 w-10 rounded-full p-1 text-xl shadow-sm backdrop-blur-xl border-white/30 dark:border-white/15 max-[850px]:flex"
			>
				{currentItem.icon}
			</Button>
		</>
	)
}
