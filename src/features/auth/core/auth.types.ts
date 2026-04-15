import type { User } from '@/features/user/core/user.types'

export type AuthProvider = 'google' | 'email' | 'github' | 'microsoft'

export type AuthProviderConfig = {
	id: AuthProvider
	name: string
	icon?: string
}

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

export type Session = {
	uid: string
	createdAt: number
	expiresAt: number
	provider: AuthProvider
}

export type SessionCookie = {
	session: Session
	signature: string
}

export type AuthState = {
	user: User | null
	isLoading: boolean
	error: Error | null
}

export type AuthEvent =
	| { type: 'SIGN_IN'; provider: AuthProvider; userId: string }
	| { type: 'SIGN_OUT'; userId?: string }
	| { type: 'SESSION_REFRESHED'; userId: string; expiresAt: number }
	| { type: 'ERROR'; error: Error }

export type SignInResult = {
	user: User
	session: Session
	isNewUser: boolean
}

export type SessionValidationResult =
	| { isValid: true; session: Session; user: User }
	| { isValid: false; reason: 'expired' | 'invalid' | 'not_found' }

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
