import {
	AuthError,
	type AuthErrorCode,
	AuthErrorMessages,
} from '../../core/auth.port'

const ERROR_MAP: Record<string, AuthErrorCode> = {
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

export function mapFirebaseError(error: any): AuthError {
	const code = error.code as string
	const authErrorCode = ERROR_MAP[code] || 'UNKNOWN_ERROR'
	return new AuthError(AuthErrorMessages[authErrorCode], authErrorCode)
}
