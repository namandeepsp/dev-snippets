import { userService } from '@/features/user/user.container'
import { getServerFirebaseAuth } from '@/services/firebase/firebase.server'
import { logger } from '@/shared/utils/logger'
import { cookies } from 'next/headers'
import type { User } from '@/features/user/core/user.types'

/**
 * ============================================================================
 * SNIPPET AUTH HELPERS
 * ============================================================================
 *
 * Authentication and authorization utilities for snippet actions.
 */

export async function requireAuth(): Promise<User> {
	const auth = getServerFirebaseAuth()
	const cookieStore = await cookies()
	const sessionCookie = cookieStore.get('__session')?.value

	if (!sessionCookie) {
		throw new Error('No session cookie found')
	}

	try {
		const decodedUser = await auth.verifySessionCookie(sessionCookie, true)
		const user = await userService.getUserById(decodedUser.uid)

		if (!user) {
			throw new Error('User profile not found')
		}

		return user
	} catch (error) {
		logger.error('Auth failed', error)
		throw new Error('Invalid or expired session')
	}
}

export function checkOwnership(
	ownerId: string,
	userId: string,
	resourceType: string = 'resource',
): void {
	if (ownerId !== userId) {
		throw new Error(`You can only modify your own ${resourceType}`)
	}
}
