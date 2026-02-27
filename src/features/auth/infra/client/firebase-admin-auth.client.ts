import type { User } from '@/features/user/core/user.types'
import { userService } from '@/features/user/user.container'
import { adminAuth } from '@/services/firebase/firebase.server'
import { getAuthProvider } from '@/shared/utils/utils'
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

/**
 * ============================================================================
 * FIREBASE ADMIN AUTH CLIENT
 * ============================================================================
 *
 * ⚠️ IMPORTANT: This file is ONLY imported on the server!
 * Import this via auth.server.container.ts only.
 *
 * Used in:
 * - Server Components
 * - API Routes
 * - Tests and Scripts
 */

export class FirebaseAdminAuthClient implements AuthPort {
	/* ----------------------------------------------------------------------- */
	/* SESSION - Now uses dynamic imports for next/headers
    /* ----------------------------------------------------------------------- */

	/**
	 * Get current session from cookie.
	 * This method dynamically imports next/headers ONLY when called,
	 * and ONLY on the server.
	 */
	async getCurrentSession(): Promise<Session | null> {
		try {
			// Dynamic import - only runs when method is called
			const { cookies } = await import('next/headers')
			const cookieStore = await cookies()
			const sessionCookie = cookieStore.get('__session')?.value

			if (!sessionCookie) {
				return null
			}

			const decodedClaims = await adminAuth.verifySessionCookie(
				sessionCookie,
				true,
			)

			return {
				uid: decodedClaims.uid,
				createdAt: decodedClaims.auth_time * 1000,
				expiresAt: decodedClaims.exp * 1000,
				provider: getAuthProvider(decodedClaims.firebase?.sign_in_provider),
			}
		} catch {
			return null
		}
	}

	async getCurrentUser(): Promise<User | null> {
		try {
			const session = await this.getCurrentSession()
			if (!session) return null
			return userService.getUserById(session.uid)
		} catch {
			return null
		}
	}

	async validateSession(): Promise<User | null> {
		return this.getCurrentUser()
	}

	/* ----------------------------------------------------------------------- */
	/* SIGN OUT
    /* ----------------------------------------------------------------------- */

	async signOut(): Promise<void> {
		try {
			const { cookies } = await import('next/headers')
			const cookieStore = await cookies()
			cookieStore.delete('__session')
		} catch (error) {
			if (
				error instanceof Error &&
				error.message.includes('outside a request scope')
			) {
				// Expected when called from scripts/tests without Next request context.
				return
			}
			console.error('Failed to sign out:', error)
		}
	}

	/* ----------------------------------------------------------------------- */
	/* OTHER METHODS (unchanged)
    /* ----------------------------------------------------------------------- */

	async signInWithEmailAndPassword(
		credentials: EmailCredentials,
	): Promise<SignInResult> {
		try {
			const { email } = credentials
			const userRecord = await adminAuth.getUserByEmail(email)
			const user = await userService.getUserById(userRecord.uid)

			if (!user) {
				throw new Error('User profile not found')
			}

			const session: Session = {
				uid: user.id,
				createdAt: Date.now(),
				expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
				provider: 'email',
			}

			return {
				user,
				session,
				isNewUser: false,
			}
		} catch (error: any) {
			throw this.mapFirebaseError(error)
		}
	}

	async signInWithGoogle(): Promise<SignInResult> {
		throw new AuthError(
			'Google sign-in is not available in server environment',
			'UNKNOWN_ERROR',
			'google',
		)
	}

	async signInWithProvider(
		provider: Exclude<AuthProvider, 'email'>,
	): Promise<SignInResult> {
		throw new AuthError(
			`${provider} sign-in is not available in server environment`,
			'UNKNOWN_ERROR',
			provider,
		)
	}

	async signUpWithEmailAndPassword(
		credentials: SignUpCredentials,
	): Promise<SignInResult> {
		try {
			const { email, password, name } = credentials

			const userRecord = await adminAuth.createUser({
				email,
				password,
				displayName: name?.trim() || undefined,
				emailVerified: false,
			})

			const user = await userService.syncUserFromAuth(
				userRecord.uid,
				userRecord.email!,
				userRecord.displayName || name || email.split('@')[0],
				userRecord.photoURL || undefined,
			)

			const session: Session = {
				uid: user.id,
				createdAt: Date.now(),
				expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
				provider: 'email',
			}

			return {
				user,
				session,
				isNewUser: true,
			}
		} catch (error: any) {
			throw this.mapFirebaseError(error)
		}
	}

	onAuthStateChanged(callback: (user: User | null) => void): () => void {
		this.getCurrentUser()
			.then((user) => callback(user))
			.catch(() => callback(null))

		return () => {}
	}

	/* ----------------------------------------------------------------------- */
	/* PRIVATE HELPERS
    /* ----------------------------------------------------------------------- */

	private mapFirebaseError(error: any): AuthError {
		const code = error.code as string

		const errorMap: Record<string, AuthErrorCode> = {
			'auth/email-already-exists': 'EMAIL_ALREADY_EXISTS',
			'auth/user-not-found': 'USER_NOT_FOUND',
			'auth/invalid-email': 'INVALID_EMAIL',
			'auth/weak-password': 'WEAK_PASSWORD',
			'auth/user-disabled': 'USER_DISABLED',
		}

		const authErrorCode = errorMap[code] || 'UNKNOWN_ERROR'

		return new AuthError(
			error.message || AuthErrorMessages[authErrorCode],
			authErrorCode,
		)
	}
}
