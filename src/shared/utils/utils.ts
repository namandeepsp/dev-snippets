import type { AuthProvider } from '@/features/auth/core/auth.types'

/* Extract sign-in provider */
function getAuthProvider(decodedToken: any): AuthProvider {
	const providerId = decodedToken.firebase?.sign_in_provider
	if (!providerId) {
		console.warn('No sign-in provider found in token:', decodedToken)
		return 'email' as AuthProvider // Default to email if not available
	}
	return (
		providerId === 'password'
			? 'email'
			: providerId?.replace('.com', '') || 'google'
	) as AuthProvider
}

export { getAuthProvider }
