'use client'

import { Button } from '@/shared/ui/design-system'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { LuCheck, LuX } from 'react-icons/lu'
import type { Feature } from './features-data'

type FeatureModalProps = {
	feature: Feature | null
	onClose: () => void
	onAction: (feature: Feature) => void
	isAuthenticated: boolean
}

export function FeatureModal({
	feature,
	onClose,
	onAction,
	isAuthenticated,
}: FeatureModalProps) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!feature || !mounted) return null

	const Icon = feature.icon
	const isUpcoming = feature.category === 'upcoming'
	const requiresAuthButNotLoggedIn = feature.requiresAuth && !isAuthenticated

	return createPortal(
		<div
			className="fixed inset-0 z-120 bg-slate-900/20 p-4 backdrop-blur-md dark:bg-slate-900/35"
			onClick={onClose}
		>
			<div
				className="mx-auto mt-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-default bg-background/95 p-8 text-foreground shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:shadow-slate-900/30"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="mb-6 flex items-start justify-between gap-4">
					<div className="flex items-start gap-4">
						<div className="rounded-lg bg-foreground/10 p-3">
							<Icon className="h-6 w-6 text-foreground" />
						</div>
						<div>
							<h2 className="text-2xl font-bold">{feature.title}</h2>
							<p className="mt-1 text-sm text-foreground/60">
								{feature.description}
							</p>
						</div>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-8 w-8 rounded-lg p-0 flex-shrink-0"
						onClick={onClose}
						aria-label="Close modal"
					>
						<LuX className="h-4 w-4" />
					</Button>
				</div>

				{/* Status Badge */}
				{isUpcoming && (
					<div className="mb-6 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
						Coming Soon
					</div>
				)}

				{/* Details Section */}
				<div className="mb-8 space-y-6">
					<div>
						<h3 className="mb-2 font-semibold text-foreground">
							About this feature
						</h3>
						<p className="text-sm text-foreground/70 leading-relaxed">
							{feature.details}
						</p>
					</div>

					{/* Usage Steps */}
					{!isUpcoming && (
						<div>
							<h3 className="mb-3 font-semibold text-foreground">How to use</h3>
							<ol className="space-y-2">
								{feature.usageSteps.map((step, index) => (
									<li
										key={index}
										className="flex gap-3 text-sm text-foreground/70"
									>
										<span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium">
											{index + 1}
										</span>
										<span className="pt-0.5">{step}</span>
									</li>
								))}
							</ol>
						</div>
					)}

					{/* Requirements */}
					{feature.requiresAuth && (
						<div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
							<div className="flex gap-2 text-sm text-blue-900 dark:text-blue-200">
								<LuCheck className="h-5 w-5 flex-shrink-0" />
								<span>This feature requires you to be logged in</span>
							</div>
						</div>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex gap-3 justify-end border-t border-default pt-6">
					<Button type="button" variant="outline" onClick={onClose}>
						Close
					</Button>

					{isUpcoming ? (
						<Button
							type="button"
							disabled
							className="opacity-50 cursor-not-allowed"
						>
							{feature.actionLabel}
						</Button>
					) : requiresAuthButNotLoggedIn ? (
						<Link href="/login" className="flex-1">
							<Button
								type="button"
								className="w-full bg-foreground text-background hover:bg-foreground/90"
								onClick={() => onAction(feature)}
							>
								Sign In to Use
							</Button>
						</Link>
					) : (
						<Link href={feature.actionHref || '#'} className="flex-1">
							<Button
								type="button"
								className="w-full bg-foreground text-background hover:bg-foreground/90"
								onClick={() => onAction(feature)}
							>
								{feature.actionLabel}
							</Button>
						</Link>
					)}
				</div>
			</div>
		</div>,
		document.body,
	)
}
