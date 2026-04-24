'use client'

import { Button } from '@/shared/ui/design-system'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'

type ConfirmationModalProps = {
	open: boolean
	onClose: () => void
	title: string
	description: string
	confirmText: string
	cancelText?: string
	onConfirm: () => void | Promise<void>
	isLoading?: boolean
	isDangerous?: boolean
}

export function ConfirmationModal({
	open,
	onClose,
	title,
	description,
	confirmText,
	cancelText = 'Cancel',
	onConfirm,
	isLoading = false,
	isDangerous = false,
}: ConfirmationModalProps) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!open || !mounted) return null

	const handleConfirm = async () => {
		await onConfirm()
	}

	return createPortal(
		<div
			className="fixed inset-0 z-120 bg-slate-900/20 p-4 backdrop-blur-md dark:bg-slate-900/35"
			onClick={onClose}
		>
			<div
				className="mx-auto mt-14 w-full max-w-md rounded-2xl border border-default bg-background/95 p-6 text-foreground shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:shadow-slate-900/30"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-4 flex items-center justify-between gap-2">
					<h2 className="text-lg font-semibold">{title}</h2>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-8 w-8 rounded-lg p-0"
						onClick={onClose}
						disabled={isLoading}
						aria-label="Close modal"
					>
						<LuX className="h-4 w-4" />
					</Button>
				</div>

				<p className="mb-6 text-sm text-foreground/70">{description}</p>

				<div className="flex gap-3 justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isLoading}
					>
						{cancelText}
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						disabled={isLoading}
						className={
							isDangerous
								? 'bg-red-600 hover:bg-red-700 text-white'
								: 'bg-foreground text-background hover:bg-foreground/90'
						}
					>
						{isLoading ? 'Loading...' : confirmText}
					</Button>
				</div>
			</div>
		</div>,
		document.body,
	)
}
