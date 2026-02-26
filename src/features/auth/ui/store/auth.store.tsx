'use client'

import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'

import type { User } from '@/features/user/core/user.types'
import { toast } from '@/shared/ui/design-system'
import { authPort } from '../../auth.client.container'

/**
 * ============================================================================
 * AUTH CONTEXT
 * ============================================================================
 *
 * Provides reactive authentication state to the entire application.
 *
 * Key principles:
 * 1. Uses canonical User type - No custom AuthUser type
 * 2. Single source of truth - Subscribes to authPort.onAuthStateChanged
 * 3. Proper SSR handling - No hydration mismatches
 * 4. Error resilient - Catches and exposes auth errors
 */

type AuthContextValue = {
	/** The authenticated user, or null if not authenticated */
	user: User | null

	/** Whether we're still checking authentication status */
	loading: boolean

	/** Error that occurred during authentication, if any */
	error: Error | null

	/** Manually refresh the user profile */
	refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/* ----------------------------------------------------------------------- */
/* PROVIDER
/* ----------------------------------------------------------------------- */

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)
	const previousUser = useRef<User | null>(null)

	// Subscribe to auth state changes
	useEffect(() => {
		setLoading(true)
		setError(null)

		try {
			const unsubscribe = authPort.onAuthStateChanged((newUser) => {
				// Detect session expiration: user was logged in, now logged out
				if (previousUser.current && !newUser && !loading) {
					toast.warning('Session expired', {
						description: 'Please sign in again to continue',
					})
				}

				previousUser.current = newUser
				setUser(newUser)
				setLoading(false)
				setError(null)
			})

			return unsubscribe
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Authentication failed'))
			setLoading(false)
		}
	}, [])

	// Manual refresh function
	const refresh = async () => {
		try {
			setLoading(true)
			const user = await authPort.getCurrentUser()
			setUser(user)
			setError(null)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to refresh user'))
		} finally {
			setLoading(false)
		}
	}

	const value: AuthContextValue = {
		user,
		loading,
		error,
		refresh,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* ----------------------------------------------------------------------- */
/* HOOK
/* ----------------------------------------------------------------------- */

/**
 * Use authentication state in components.
 *
 * This is the primary way to access auth state in client components.
 *
 * @example
 * ```tsx
 * function ProfileButton() {
 *   const { user, loading } = useAuth()
 *
 *   if (loading) return <Spinner />
 *   if (!user) return <SignInButton />
 *
 *   return <UserMenu user={user} />
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext)

	if (!ctx) {
		throw new Error('useAuth must be used within an AuthProvider')
	}

	return ctx
}

/* ----------------------------------------------------------------------- */
/* COMPOSITION HOOKS
/* ----------------------------------------------------------------------- */

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
	const { user, loading } = useAuth()
	return !loading && user !== null
}

/**
 * Get current user with guaranteed existence
 * @throws If user is not authenticated
 */
export function useAuthenticatedUser(): User {
	const { user, loading } = useAuth()

	if (loading) {
		throw new Error('Auth is still loading')
	}

	if (!user) {
		throw new Error('User is not authenticated')
	}

	return user
}

/**
 * Get current user ID with guaranteed existence
 * @throws If user is not authenticated
 */
export function useUserId(): string {
	const user = useAuthenticatedUser()
	return user.id
}
