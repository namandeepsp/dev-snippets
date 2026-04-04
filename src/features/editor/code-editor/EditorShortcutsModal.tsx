'use client'

import { Button } from '@/shared/ui/design-system'
import { useEffect, useRef } from 'react'
import type { EditorShortcut } from './editor.shortcuts'

type EditorShortcutsModalProps = {
	isOpen: boolean
	onClose: () => void
	shortcuts: EditorShortcut[]
}

export function EditorShortcutsModal({
	isOpen,
	onClose,
	shortcuts,
}: EditorShortcutsModalProps) {
	const containerRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault()
				onClose()
				return
			}

			if (event.key !== 'Tab') return

			const container = containerRef.current
			if (!container) return

			const focusable = Array.from(
				container.querySelectorAll<HTMLElement>(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
				),
			).filter(
				(el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'),
			)

			if (focusable.length === 0) return

			const first = focusable[0]
			const last = focusable[focusable.length - 1]
			const active = document.activeElement as HTMLElement | null

			if (event.shiftKey) {
				if (!active || active === first) {
					event.preventDefault()
					last.focus()
				}
			} else if (!active || active === last) {
				event.preventDefault()
				first.focus()
			}
		}

		document.addEventListener('keydown', handleKeyDown)

		const focusable = containerRef.current?.querySelector<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		)
		focusable?.focus()

		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, onClose])

	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onClick={onClose}
		>
			<div
				ref={containerRef}
				className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-xl bg-card p-6 shadow-xl"
				onClick={(event) => event.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-label="Editor shortcuts"
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<h3 className="text-lg font-semibold">Editor shortcuts</h3>
						<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
							These shortcuts are available in the editor.
						</p>
					</div>
					<Button
						type="button"
						variant="ghost"
						onClick={onClose}
						className="rounded-md border border-default px-3 py-1.5 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
					>
						Close
					</Button>
				</div>

				<div className="mt-5 max-h-[60vh] overflow-y-auto pr-1 divide-y divide-slate-200/70 text-sm dark:divide-slate-700/60">
					{shortcuts.map((shortcut) => (
						<div
							key={shortcut.label}
							className="flex flex-wrap items-center justify-between gap-3 py-3"
						>
							<span className="font-medium text-slate-800 dark:text-slate-100">
								{shortcut.label}
							</span>
							<div className="flex flex-wrap items-center gap-2">
								{shortcut.keys.map((key) => (
									<span
										key={key}
										className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
									>
										{key}
									</span>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
