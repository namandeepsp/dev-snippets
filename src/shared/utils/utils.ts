import type { AuthProvider } from '@/features/auth/core/auth.types'
import { logger } from '@/shared/utils/logger'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

function getAuthProvider(decodedToken: any): AuthProvider {
	const providerId = decodedToken.firebase?.sign_in_provider
	if (!providerId) {
		logger.warn('No sign-in provider found in token', {
			provider: decodedToken?.firebase?.sign_in_provider,
		})
		return 'email' as AuthProvider
	}
	return (
		providerId === 'password'
			? 'email'
			: providerId?.replace('.com', '') || 'google'
	) as AuthProvider
}

export { getAuthProvider }
