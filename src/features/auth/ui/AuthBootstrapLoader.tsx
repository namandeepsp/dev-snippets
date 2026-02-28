'use client'

import { PageLoader } from '@/shared/ui/PageLoader'
import { usePathname } from 'next/navigation'
import { useAuth } from './store/auth.store'

/**
 * Displays a full-screen loader while initial auth state is resolving.
 * This ensures first paint doesn't show the wrong signed-in/out UI.
 */
export function AuthBootstrapLoader() {
	const { loading } = useAuth()
	const pathname = usePathname()
	const isSettingsRoute = pathname?.startsWith('/settings')

	if (!loading || pathname === '/login' || isSettingsRoute) {
		return null
	}

	return (
		<div className="hidden max-[850px]:block">
			<PageLoader fullScreen />
		</div>
	)
}
