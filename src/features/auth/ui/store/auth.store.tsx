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

type AuthContextValue = {
	user: User | null

	loading: boolean

	error: Error | null

	refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)
	const previousUser = useRef<User | null>(null)

	useEffect(() => {
		setLoading(true)
		setError(null)

		try {
			const unsubscribe = authPort.onAuthStateChanged((newUser) => {
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

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext)

	if (!ctx) {
		throw new Error('useAuth must be used within an AuthProvider')
	}

	return ctx
}

export function useIsAuthenticated(): boolean {
	const { user, loading } = useAuth()
	return !loading && user !== null
}

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

export function useUserId(): string {
	const user = useAuthenticatedUser()
	return user.id
}
