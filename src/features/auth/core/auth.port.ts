import type { User } from '@/features/user/core/user.types'
import type {
	AuthProvider,
	EmailCredentials,
	Session,
	SignInResult,
	SignUpCredentials,
} from './auth.types'

/**
 * ============================================================================
 * AUTHENTICATION PORT
 * ============================================================================
 *
 * This interface defines HOW the application performs authentication.
 *
 * Key principles:
 * 1. Auth is BEHAVIOR, not DATA - No repository methods
 * 2. Returns User type (from User feature) - Not its own user type
 * 3. Session management is part of the port
 * 4. Different implementations can swap out the entire auth system
 *
 * Implementations:
 * - FirebaseAuthAdapter (Firebase Auth + session cookies)
 * - Auth0Adapter (Auth0 authentication)
 * - CustomJWTAdapter (Custom backend with JWT)
 */

export interface AuthPort {
	/* ----------------------------------------------------------------------- */
	/* SIGN IN
	/* ----------------------------------------------------------------------- */

	/**
	 * Sign in with email and password.
	 *
	 * Returns the authenticated user's profile AND session information.
	 * The implementation is responsible for:
	 * 1. Authenticating with the provider
	 * 2. Creating a session
	 * 3. Storing the session (cookie, localStorage, etc.)
	 * 4. Fetching/creating the user profile
	 */
	signInWithEmailAndPassword(
		credentials: EmailCredentials,
	): Promise<SignInResult>

	/**
	 * Sign in with Google OAuth.
	 *
	 * This may be a redirect flow or popup, depending on the environment.
	 * The implementation should handle the OAuth callback and session creation.
	 */
	signInWithGoogle(): Promise<SignInResult>

	/**
	 * Sign in with a specific OAuth provider.
	 *
	 * Generic method for any OAuth provider (Google, GitHub, Microsoft, etc.)
	 */
	signInWithProvider(
		provider: Exclude<AuthProvider, 'email'>,
	): Promise<SignInResult>

	/* ----------------------------------------------------------------------- */
	/* SIGN UP
	/* ----------------------------------------------------------------------- */

	/**
	 * Create a new account with email and password.
	 *
	 * This both creates the auth account AND signs the user in.
	 * The implementation should:
	 * 1. Create the auth account
	 * 2. Create a session
	 * 3. Create the user profile (via UserService)
	 */
	signUpWithEmailAndPassword(
		credentials: SignUpCredentials,
	): Promise<SignInResult>

	/* ----------------------------------------------------------------------- */
	/* SESSION
	/* ----------------------------------------------------------------------- */

	/**
	 * Get the current session.
	 *
	 * Returns null if no valid session exists.
	 * This should NOT validate with the server - it's a client-side check.
	 */
	getCurrentSession(): Promise<Session | null>

	/**
	 * Get the currently authenticated user.
	 *
	 * Returns null if no valid session exists.
	 * This fetches the full user profile, not just session data.
	 */
	getCurrentUser(): Promise<User | null>

	/**
	 * Validate the current session with the server.
	 *
	 * This is different from getCurrentSession() - it actually verifies
	 * the session with the auth provider/backend.
	 * Returns the user profile if session is valid, null otherwise.
	 */
	validateSession(): Promise<User | null>

	/* ----------------------------------------------------------------------- */
	/* SIGN OUT
	/* ----------------------------------------------------------------------- */

	/**
	 * Sign out the current user.
	 *
	 * Clears the session and signs out from the auth provider.
	 */
	signOut(): Promise<void>

	/* ----------------------------------------------------------------------- */
	/* STATE OBSERVATION
	/* ----------------------------------------------------------------------- */

	/**
	 * Subscribe to authentication state changes.
	 *
	 * Returns an unsubscribe function.
	 * The callback receives the authenticated user (or null) on every change.
	 */
	onAuthStateChanged(callback: (user: User | null) => void): () => void
}

/**
 * ============================================================================
 * AUTHENTICATION ERROR TYPES
 * ============================================================================
 */

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
