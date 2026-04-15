'use client'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'
import { useAuth } from '../auth.client.container'

type Props = {
	children: ReactNode
	redirectTo?: string
	fallback?: ReactNode
}
export function RequireAuth({
	children,
	redirectTo = '/login',
	fallback = null,
}: Props) {
	const { user, loading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!loading && !user) {
			const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(
				globalThis.location.pathname,
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
