import {
	type User as FirebaseUser,
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	onAuthStateChanged as firebaseOnAuthStateChanged,
	signInWithEmailAndPassword as firebaseSignInWithEmail,
	signOut as firebaseSignOut,
	getAuth,
	getRedirectResult,
	signInWithPopup,
	signInWithRedirect,
	updateProfile,
} from 'firebase/auth'

import type { User } from '@/features/user/core/user.types'
import { firebaseApp } from '@/services/firebase/firebase.client'
import { logger } from '@/shared/utils/logger'
import {
	AuthError,
	type AuthErrorCode,
	AuthErrorMessages,
	type AuthPort,
} from '../../core/auth.port'
import type {
	AuthProvider,
	EmailCredentials,
	Session,
	SignInResult,
	SignUpCredentials,
} from '../../core/auth.types'

const auth = getAuth(firebaseApp)
const googleProvider = new GoogleAuthProvider()

/**
 * ============================================================================
 * FIREBASE AUTH CLIENT
 * ============================================================================
 *
 * Firebase implementation of AuthPort for the BROWSER environment.
 *
 * Key responsibilities:
 * 1. Authenticate with Firebase Auth (email/password, Google)
 * 2. Create HTTP-only session cookies via API routes
 * 3. Sync user profiles with UserService
 * 4. Manage client-side auth state
 *
 * This is NOT used in Node.js environments (tests, scripts, server components).
 * See FirebaseAdminAuthClient for server-side implementation.
 */

export class FirebaseAuthClient implements AuthPort {
	/* ----------------------------------------------------------------------- */
	/* SIGN IN
	/* ----------------------------------------------------------------------- */

	async signInWithEmailAndPassword(
		credentials: EmailCredentials,
	): Promise<SignInResult> {
		try {
			const { email, password } = credentials
			const result = await firebaseSignInWithEmail(auth, email, password)

			// Create session cookie
			const { user, session, isNewUser } = await this.createSessionCookie(
				result.user,
			)

			return {
				user,
				session,
				isNewUser,
			}
		} catch (error: any) {
			throw this.mapFirebaseError(error)
		}
	}

	async signInWithGoogle(): Promise<SignInResult> {
		try {
			const result = await signInWithPopup(auth, googleProvider)

			// Create session cookie
			const { user, session, isNewUser } = await this.createSessionCookie(
				result.user,
			)

			return {
				user,
				session,
				isNewUser,
			}
		} catch (error: any) {
			const code = error?.code as string | undefined
			if (
				code === 'auth/popup-blocked' ||
				code === 'auth/cancelled-popup-request' ||
				code === 'auth/operation-not-supported-in-this-environment'
			) {
				await signInWithRedirect(auth, googleProvider)
				return new Promise<never>(() => {})
			}

			throw this.mapFirebaseError(error)
		}
	}

	async signInWithProvider(
		provider: Exclude<AuthProvider, 'email'>,
	): Promise<SignInResult> {
		// For now, only Google is implemented
		if (provider === 'google') {
			return this.signInWithGoogle()
		}

		throw new AuthError(
			`Provider ${provider} not implemented`,
			'UNKNOWN_ERROR',
			provider,
		)
	}

	/* ----------------------------------------------------------------------- */
	/* SIGN UP
	/* ----------------------------------------------------------------------- */

	async signUpWithEmailAndPassword(
		credentials: SignUpCredentials,
	): Promise<SignInResult> {
		try {
			const { email, password, name } = credentials
			const result = await createUserWithEmailAndPassword(auth, email, password)

			// Keep Firebase Auth profile in sync with our user profile name
			const displayName = name.trim()
			if (displayName) {
				await updateProfile(result.user, { displayName })
			}

			// Create session cookie
			const { user, session } = await this.createSessionCookie(
				result.user,
				displayName || undefined,
			)

			return {
				user,
				session,
				isNewUser: true,
			}
		} catch (error: any) {
			throw this.mapFirebaseError(error)
		}
	}

	/* ----------------------------------------------------------------------- */
	/* SESSION
	/* ----------------------------------------------------------------------- */

	async getCurrentSession(): Promise<Session | null> {
		// Session is stored in HTTP-only cookie
		// We can't read it directly from client-side JavaScript
		// Instead, we call an endpoint to validate and return session info
		try {
			const response = await fetch('/api/auth/session', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			})

			if (!response.ok) {
				return null
			}

			const data = await response.json()
			return data.session || null
		} catch {
			return null
		}
	}

	async getCurrentUser(): Promise<User | null> {
		const payload = await this.getSessionPayload()
		return payload.user
	}

	async validateSession(): Promise<User | null> {
		try {
			// Force token refresh and verification
			const firebaseUser = auth.currentUser

			if (!firebaseUser) {
				return null
			}

			// This will throw if token is invalid
			const idToken = await firebaseUser.getIdToken(true)

			// Validate with server
			const response = await fetch('/api/auth/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken }),
			})

			if (!response.ok) {
				return null
			}

			const data = await response.json()
			return data.user ?? null
		} catch {
			return null
		}
	}

	/* ----------------------------------------------------------------------- */
	/* SIGN OUT
	/* ----------------------------------------------------------------------- */

	async signOut(): Promise<void> {
		try {
			await firebaseSignOut(auth)
			await fetch('/api/auth/logout', { method: 'POST' })
		} catch (error: any) {
			throw this.mapFirebaseError(error)
		}
	}

	/* ----------------------------------------------------------------------- */
	/* STATE OBSERVATION
	/* ----------------------------------------------------------------------- */

	onAuthStateChanged(callback: (user: User | null) => void): () => void {
		return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) {
				callback(null)
				return
			}

			const payload = await this.getSessionPayload()
			if (payload.user) {
				callback(payload.user)
				return
			}

			try {
				await this.completeRedirectSession(firebaseUser)
				const hydrated = await this.getSessionPayload()
				callback(hydrated.user)
			} catch (error) {
				logger.error('Failed to hydrate auth session from Firebase user', error)
				callback(null)
			}
		})
	}

	/* ----------------------------------------------------------------------- */
	/* PRIVATE HELPERS
	/* ----------------------------------------------------------------------- */

	private async createSessionCookie(
		user: FirebaseUser,
		name?: string,
	): Promise<SignInResult> {
		const idToken = await user.getIdToken(true)
		const data = await this.postSessionWithRetry(idToken, name)

		if (!data?.user || !data?.session) {
			throw new Error('Session response missing user data')
		}

		return {
			user: data.user as User,
			session: data.session as Session,
			isNewUser:
				typeof data.isNewUser === 'boolean'
					? data.isNewUser
					: this.isNewUser(user),
		}
	}

	private async getSessionPayload(): Promise<{
		session: Session | null
		user: User | null
	}> {
		try {
			const response = await fetch('/api/auth/session', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			})

			if (!response.ok) {
				return { session: null, user: null }
			}

			const data = await response.json()
			return {
				session: (data.session as Session | null) ?? null,
				user: (data.user as User | null) ?? null,
			}
		} catch {
			return { session: null, user: null }
		}
	}

	private async completeRedirectSession(
		firebaseUser: FirebaseUser,
	): Promise<void> {
		const redirectResult = await getRedirectResult(auth).catch(() => null)
		const user = redirectResult?.user || firebaseUser
		await this.createSessionCookie(user)
	}

	private async postSessionWithRetry(
		idToken: string,
		name?: string,
		maxAttempts = 2,
	): Promise<any> {
		let lastError: unknown

		for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
			try {
				const response = await fetch('/api/auth/session', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ idToken, name }),
				})

				if (!response.ok) {
					const payload = await response
						.json()
						.catch(() => ({ error: 'Failed to create session cookie' }))
					throw new Error(payload?.error || 'Failed to create session cookie')
				}

				return await response.json()
			} catch (error) {
				lastError = error
				if (attempt < maxAttempts) {
					await new Promise((resolve) => setTimeout(resolve, attempt * 300))
				}
			}
		}

		throw lastError instanceof Error
			? lastError
			: new Error('Failed to create session cookie')
	}

	private isNewUser(user: FirebaseUser): boolean {
		// Firebase doesn't provide a reliable way to check if user just signed up
		// We can check metadata: if creation time is within last minute
		const creationTime = user.metadata?.creationTime
		if (!creationTime) return false

		const created = new Date(creationTime).getTime()
		const now = Date.now()

		return now - created < 60 * 1000 // Less than 1 minute ago
	}

	private mapFirebaseError(error: any): AuthError {
		const code = error.code as string

		const errorMap: Record<string, AuthErrorCode> = {
			'auth/invalid-credential': 'INVALID_CREDENTIALS',
			'auth/wrong-password': 'INVALID_CREDENTIALS',
			'auth/user-not-found': 'USER_NOT_FOUND',
			'auth/email-already-in-use': 'EMAIL_ALREADY_EXISTS',
			'auth/weak-password': 'WEAK_PASSWORD',
			'auth/invalid-email': 'INVALID_EMAIL',
			'auth/user-disabled': 'USER_DISABLED',
			'auth/popup-blocked': 'POPUP_BLOCKED',
			'auth/popup-closed-by-user': 'POPUP_CLOSED',
			'auth/unauthorized-domain': 'UNAUTHORIZED_DOMAIN',
			'auth/network-request-failed': 'NETWORK_ERROR',
		}

		const authErrorCode = errorMap[code] || 'UNKNOWN_ERROR'

		return new AuthError(AuthErrorMessages[authErrorCode], authErrorCode)
	}
}
