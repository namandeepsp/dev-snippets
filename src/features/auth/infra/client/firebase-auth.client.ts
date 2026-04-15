import {
	type User as FirebaseUser,
	createUserWithEmailAndPassword,
	onAuthStateChanged as firebaseOnAuthStateChanged,
	signInWithEmailAndPassword as firebaseSignInWithEmail,
	signOut as firebaseSignOut,
	getAuth,
	getRedirectResult,
	updateProfile,
} from 'firebase/auth'

import type { User } from '@/features/user/core/user.types'
import { firebaseApp } from '@/services/firebase/firebase.client'
import { logger } from '@/shared/utils/logger'
import { AuthError, type AuthPort } from '../../core/auth.port'
import type {
	AuthProvider,
	EmailCredentials,
	Session,
	SignInResult,
	SignUpCredentials,
} from '../../core/auth.types'
import { mapFirebaseError } from './firebase-auth-errors.utils'
import {
	handleGooglePopupError,
	signInWithGooglePopup,
} from './firebase-auth-providers.utils'
import {
	callLogoutEndpoint,
	fetchSessionPayload,
	isNewUser,
	postSessionWithRetry,
	validateSessionWithServer,
} from './firebase-auth-session.utils'

const auth = getAuth(firebaseApp)

export class FirebaseAuthClient implements AuthPort {
	async signInWithEmailAndPassword(
		credentials: EmailCredentials,
	): Promise<SignInResult> {
		try {
			const { email, password } = credentials
			const result = await firebaseSignInWithEmail(auth, email, password)
			return this.createSessionCookie(result.user)
		} catch (error: any) {
			throw mapFirebaseError(error)
		}
	}

	async signInWithGoogle(): Promise<SignInResult> {
		try {
			const result = await signInWithGooglePopup(auth)
			return this.createSessionCookie(result.user)
		} catch (error: any) {
			if (await handleGooglePopupError(auth, error)) {
				return new Promise<never>(() => {})
			}
			throw mapFirebaseError(error)
		}
	}

	async signInWithProvider(
		provider: Exclude<AuthProvider, 'email'>,
	): Promise<SignInResult> {
		if (provider === 'google') {
			return this.signInWithGoogle()
		}

		throw new AuthError(
			`Provider ${provider} not implemented`,
			'UNKNOWN_ERROR',
			provider,
		)
	}

	async signUpWithEmailAndPassword(
		credentials: SignUpCredentials,
	): Promise<SignInResult> {
		try {
			const { email, password, name } = credentials
			const result = await createUserWithEmailAndPassword(auth, email, password)

			const displayName = name.trim()
			if (displayName) {
				await updateProfile(result.user, { displayName })
			}

			return this.createSessionCookie(result.user, displayName || undefined)
		} catch (error: any) {
			throw mapFirebaseError(error)
		}
	}

	async getCurrentSession(): Promise<Session | null> {
		const { session } = await fetchSessionPayload()
		return session
	}

	async getCurrentUser(): Promise<User | null> {
		const { user } = await fetchSessionPayload()
		return user
	}

	async validateSession(): Promise<User | null> {
		try {
			const firebaseUser = auth.currentUser

			if (!firebaseUser) {
				return null
			}

			const idToken = await firebaseUser.getIdToken(true)
			return validateSessionWithServer(idToken)
		} catch {
			return null
		}
	}

	async signOut(): Promise<void> {
		try {
			await firebaseSignOut(auth)
			await callLogoutEndpoint()
		} catch (error: any) {
			throw mapFirebaseError(error)
		}
	}

	onAuthStateChanged(callback: (user: User | null) => void): () => void {
		return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) {
				callback(null)
				return
			}

			const { user } = await fetchSessionPayload()
			if (user) {
				callback(user)
				return
			}

			try {
				await this.completeRedirectSession(firebaseUser)
				const { user: hydrated } = await fetchSessionPayload()
				callback(hydrated)
			} catch (error) {
				logger.error('Failed to hydrate auth session from Firebase user', error)
				callback(null)
			}
		})
	}

	private async createSessionCookie(
		user: FirebaseUser,
		name?: string,
	): Promise<SignInResult> {
		const idToken = await user.getIdToken(true)
		const data = await postSessionWithRetry(idToken, name)

		if (!data?.user || !data?.session) {
			throw new Error('Session response missing user data')
		}

		return {
			user: data.user as User,
			session: data.session as Session,
			isNewUser:
				typeof data.isNewUser === 'boolean' ? data.isNewUser : isNewUser(user),
		}
	}

	private async completeRedirectSession(
		firebaseUser: FirebaseUser,
	): Promise<void> {
		const redirectResult = await getRedirectResult(auth).catch(() => null)
		const user = redirectResult?.user || firebaseUser
		await this.createSessionCookie(user)
	}
}
