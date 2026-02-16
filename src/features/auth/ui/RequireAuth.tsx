'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'
import { useAuth } from '../auth.client.container'

type Props = {
	children: ReactNode
	redirectTo?: string
	fallback?: ReactNode
}

/**
 * ============================================================================
 * REQUIRE AUTH
 * ============================================================================
 *
 * Protects routes that require authentication.
 *
 * @example
 * ```tsx
 * <RequireAuth redirectTo="/login">
 *   <SettingsPage />
 * </RequireAuth>
 * ```
 */
export function RequireAuth({
	children,
	redirectTo = '/login',
	fallback = (
		<div className="flex h-screen items-center justify-center">Loading...</div>
	),
}: Props) {
	const { user, loading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!loading && !user) {
			const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(
				window.location.pathname,
			)}`

			router.replace(redirectUrl)
		}
	}, [user, loading, router, redirectTo])

	if (loading) {
		return <>{fallback}</>
	}

	if (!user) {
		return null
	}

	return <>{children}</>
}
