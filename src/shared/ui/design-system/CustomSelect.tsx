'use client'

import { cn } from '@/shared/utils/utils'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

type CustomSelectOption = {
	value: string
	label: string
	icon?: ReactNode
	disabled?: boolean
}

interface CustomSelectProps {
	options: CustomSelectOption[]
	value?: string
	onChange: (value: string) => void
	placeholder?: string
	disabled?: boolean
	className?: string
}

export function CustomSelect({
	options,
	value,
	onChange,
	placeholder = 'Select option',
	disabled = false,
	className,
}: CustomSelectProps) {
	const [open, setOpen] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)

	const selected = useMemo(
		() => options.find((option) => option.value === value),
		[options, value],
	)

	useEffect(() => {
		function handleOutside(event: MouseEvent) {
			if (!wrapperRef.current) return
			if (!wrapperRef.current.contains(event.target as Node)) {
				setOpen(false)
			}
		}

		document.addEventListener('mousedown', handleOutside)
		return () => document.removeEventListener('mousedown', handleOutside)
	}, [])

	return (
		<div ref={wrapperRef} className={cn('relative w-full', className)}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => setOpen((prev) => !prev)}
				className={cn(
					'flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-3 text-left text-sm transition-all',
					'focus:outline-none focus:ring-4 focus:ring-blue-500/20',
					'dark:border-gray-700 dark:bg-gray-900',
					'disabled:cursor-not-allowed disabled:opacity-50',
				)}
			>
				<span className="inline-flex items-center gap-2 text-gray-900 dark:text-gray-100">
					{selected?.icon && <span aria-hidden>{selected.icon}</span>}
					<span>{selected?.label ?? placeholder}</span>
				</span>
				<svg
					viewBox="0 0 20 20"
					fill="none"
					stroke="currentColor"
					className={cn(
						'h-4 w-4 text-gray-500 transition-transform dark:text-gray-400',
						open && 'rotate-180',
					)}
				>
					<path
						d="M6 8l4 4 4-4"
						strokeWidth="1.7"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>

			{open && (
				<div className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-gray-200 bg-white/95 p-1 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
					{options.map((option) => (
						<button
							key={option.value}
							type="button"
							disabled={option.disabled}
							onClick={() => {
								onChange(option.value)
								setOpen(false)
							}}
							className={cn(
								'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition',
								'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
								option.value === value &&
									'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
								option.disabled && 'cursor-not-allowed opacity-50',
							)}
						>
							{option.icon && <span aria-hidden>{option.icon}</span>}
							<span>{option.label}</span>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
