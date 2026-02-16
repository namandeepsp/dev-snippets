import type { User } from '@/features/user/core/user.types'

/**
 * ============================================================================
 * AUTHENTICATION TYPES
 * ============================================================================
 *
 * These types are PURELY for authentication concerns.
 *
 * Key principle:
 * - Auth feature does NOT define user shapes
 * - Auth feature IMPORTS user shapes from User feature
 * - Auth feature ONLY cares about authentication state and methods
 */

/* ------------------------------------------------------------------------- */
/* AUTHENTICATION PROVIDERS
/* ------------------------------------------------------------------------- */

export type AuthProvider = 'google' | 'email' | 'github' | 'microsoft'

export type AuthProviderConfig = {
	id: AuthProvider
	name: string
	icon?: string
}

/* ------------------------------------------------------------------------- */
/* CREDENTIALS
/* ------------------------------------------------------------------------- */

export type EmailCredentials = {
	email: string
	password: string
}

export type SignUpCredentials = EmailCredentials & {
	name: string
}

export type OAuthCredentials = {
	provider: Exclude<AuthProvider, 'email'>
	idToken?: string
	accessToken?: string
}

/* ------------------------------------------------------------------------- */
/* SESSION
/* ------------------------------------------------------------------------- */

/**
 * Session information.
 * This is what we store in the session cookie.
 */
export type Session = {
	/** User ID (matches User.id) */
	uid: string

	/** When the session was created */
	createdAt: number

	/** When the session expires */
	expiresAt: number

	/** Provider used to authenticate */
	provider: AuthProvider
}

/**
 * Session cookie payload
 * This is the actual data stored in the HTTP-only cookie
 */
export type SessionCookie = {
	session: Session
	signature: string
}

/* ------------------------------------------------------------------------- */
/* AUTH STATE
/* ------------------------------------------------------------------------- */

/**
 * Authentication state for UI.
 *
 * This is what the AuthContext provides.
 * Notice it uses User type from User feature, not its own AuthUser type.
 */
export type AuthState = {
	/** The authenticated user's profile, or null if not authenticated */
	user: User | null

	/** Whether we're still checking authentication status */
	isLoading: boolean

	/** Error that occurred during authentication */
	error: Error | null
}

/* ------------------------------------------------------------------------- */
/* AUTH EVENTS
/* ------------------------------------------------------------------------- */

export type AuthEvent =
	| { type: 'SIGN_IN'; provider: AuthProvider; userId: string }
	| { type: 'SIGN_OUT'; userId?: string }
	| { type: 'SESSION_REFRESHED'; userId: string; expiresAt: number }
	| { type: 'ERROR'; error: Error }

/* ------------------------------------------------------------------------- */
/* AUTH RESPONSES
/* ------------------------------------------------------------------------- */

/**
 * Result of a sign-in operation.
 * Contains both the session and the user profile.
 */
export type SignInResult = {
	/** The authenticated user's profile */
	user: User

	/** Session information */
	session: Session

	/** Whether this is a new user (first sign-in) */
	isNewUser: boolean
}

/**
 * Result of session validation.
 */
export type SessionValidationResult =
	| { isValid: true; session: Session; user: User }
	| { isValid: false; reason: 'expired' | 'invalid' | 'not_found' }

/* ------------------------------------------------------------------------- */
/* TYPE GUARDS
/* ------------------------------------------------------------------------- */

export function isEmailCredentials(
	credentials: any,
): credentials is EmailCredentials {
	return credentials?.email && credentials?.password
}

export function isOAuthCredentials(
	credentials: any,
): credentials is OAuthCredentials {
	return credentials?.provider && credentials.provider !== 'email'
}
