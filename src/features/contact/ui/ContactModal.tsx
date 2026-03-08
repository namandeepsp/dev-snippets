'use client'

import { Button } from '@/shared/ui/design-system'
import { useRouter } from 'next/navigation'
import { type KeyboardEvent as ReactKeyboardEvent, useEffect } from 'react'
import { LuX } from 'react-icons/lu'

type ContactModalProps = {
	children: React.ReactNode
}

export function ContactModal({ children }: ContactModalProps) {
	const router = useRouter()

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				router.back()
			}
		}

		globalThis.addEventListener('keydown', onKeyDown)

		return () => {
			globalThis.removeEventListener('keydown', onKeyDown)
		}
	}, [router])

	function onOverlayClick() {
		router.back()
	}

	function onPanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
		event.stopPropagation()
	}

	return (
		<div className="fixed inset-0 z-50">
			<button
				type="button"
				aria-label="Close contact form"
				className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
				onClick={onOverlayClick}
			/>
			<div className="relative flex min-h-full items-center justify-center p-4">
				<div
					className="w-full max-w-xl rounded-2xl border border-default bg-background p-6 shadow-2xl"
					onKeyDown={onPanelKeyDown}
				>
					<div className="mb-5 flex items-start justify-between gap-4">
						<div>
							<h2 className="text-xl font-semibold">Email Us</h2>
							<p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
								Share your message and we will get back to you.
							</p>
						</div>
						<Button
							type="button"
							onClick={() => router.back()}
							variant="ghost"
							size="sm"
							className="h-9 w-9 p-0 text-base"
							aria-label="Close contact form"
						>
							<LuX className="h-4 w-4 stroke-[2.6]" />
						</Button>
					</div>
					{children}
				</div>
			</div>
		</div>
	)
}
