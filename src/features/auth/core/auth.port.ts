import type { User } from '@/features/user/core/user.types'
import type {
	AuthProvider,
	EmailCredentials,
	Session,
	SignInResult,
	SignUpCredentials,
} from './auth.types'

export interface AuthPort {
	signInWithEmailAndPassword(
		credentials: EmailCredentials,
	): Promise<SignInResult>

	signInWithGoogle(): Promise<SignInResult>

	signInWithProvider(
		provider: Exclude<AuthProvider, 'email'>,
	): Promise<SignInResult>

	signUpWithEmailAndPassword(
		credentials: SignUpCredentials,
	): Promise<SignInResult>

	getCurrentSession(): Promise<Session | null>

	getCurrentUser(): Promise<User | null>

	validateSession(): Promise<User | null>

	signOut(): Promise<void>

	onAuthStateChanged(callback: (user: User | null) => void): () => void
}

export class AuthError extends Error {
	constructor(
		message: string,
		public readonly code: AuthErrorCode,
		public readonly provider?: AuthProvider,
	) {
		super(message)
		this.name = 'AuthError'
	}
}

export type AuthErrorCode =
	| 'INVALID_CREDENTIALS'
	| 'EMAIL_ALREADY_EXISTS'
	| 'WEAK_PASSWORD'
	| 'INVALID_EMAIL'
	| 'USER_DISABLED'
	| 'USER_NOT_FOUND'
	| 'POPUP_BLOCKED'
	| 'POPUP_CLOSED'
	| 'UNAUTHORIZED_DOMAIN'
	| 'NETWORK_ERROR'
	| 'SESSION_EXPIRED'
	| 'UNKNOWN_ERROR'

export const AuthErrorMessages: Record<AuthErrorCode, string> = {
	INVALID_CREDENTIALS: 'Invalid email or password',
	EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
	WEAK_PASSWORD: 'Password should be at least 6 characters',
	INVALID_EMAIL: 'Please enter a valid email address',
	USER_DISABLED: 'This account has been disabled',
	USER_NOT_FOUND: 'No account found with this email',
	POPUP_BLOCKED: 'Sign-in popup was blocked by your browser',
	POPUP_CLOSED: 'Sign-in popup was closed before completing',
	UNAUTHORIZED_DOMAIN: 'This domain is not authorized for authentication',
	NETWORK_ERROR: 'Network error. Please check your connection',
	SESSION_EXPIRED: 'Your session has expired. Please sign in again',
	UNKNOWN_ERROR: 'An unexpected error occurred',
}
