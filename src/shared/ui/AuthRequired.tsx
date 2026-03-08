'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import Link from 'next/link'
import { type ReactNode, useState } from 'react'
import { Button } from './design-system'

type Props = {
	children: (props: { isAuthenticated: boolean }) => ReactNode
}

export function AuthRequired({ children }: Props) {
	const { user } = useAuth()
	const [showModal, setShowModal] = useState(false)

	return (
		<>
			{children({ isAuthenticated: !!user })}

			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-xl">
						<h3 className="text-lg font-semibold mb-2">Sign in required</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-6">
							Please sign in to access this feature.
						</p>
						<div className="flex gap-3">
							<Button
								onClick={() => setShowModal(false)}
								variant="ghost"
								className="flex-1 rounded-md border border-default px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
							>
								Cancel
							</Button>
							<Link
								href="/login"
								className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition text-center"
							>
								Sign In
							</Link>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export function useRequireAuth() {
	const { user } = useAuth()
	const [showModal, setShowModal] = useState(false)

	const requireAuth = (callback: () => void) => {
		if (!user) {
			setShowModal(true)
			return
		}
		callback()
	}

	const loginUrl = globalThis.localStorage
		? `/login?redirect=${encodeURIComponent(globalThis.location.pathname)}`
		: '/login'

	const modal = showModal ? (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-xl">
				<h3 className="text-lg font-semibold mb-2">Sign in required</h3>
				<p className="text-gray-600 dark:text-gray-400 mb-6">
					Please sign in to access this feature.
				</p>
				<div className="flex gap-3">
					<Button
						onClick={() => setShowModal(false)}
						variant="ghost"
						className="flex-1 rounded-md border border-default px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
					>
						Cancel
					</Button>
					<Link
						href={loginUrl}
						className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition text-center"
					>
						Sign In
					</Link>
				</div>
			</div>
		</div>
	) : null

	return { requireAuth, modal, isAuthenticated: !!user }
}
