'use server'

import { getServerFirebaseAuth } from '@/services/firebase/firebase.server'
import { logger } from '@/shared/utils/logger'
import { cookies } from 'next/headers'
import { snippetService } from '../snippets/snippet.server.container'
import { UserDomainError } from './core/user.service'
import type { PublicUser, UpdateUserDTO } from './core/user.types'
import type { ApiResponse } from './infra/client/user-api.client'
import { userService } from './user.container'

/**
 * ============================================================================
 * SERVER ACTIONS
 * ============================================================================
 *
 * These are the actual implementations called by ServerActionUserClient.
 * They are NOT imported directly by UI components.
 * UI components go through UserApiClient interface.
 */

/* ----------------------------------------------------------------------- */
/* AUTHENTICATION HELPER
/* ----------------------------------------------------------------------- */

async function requireAuth() {
	const auth = getServerFirebaseAuth()
	const cookieStore = await cookies()
	const sessionCookie = cookieStore.get('__session')?.value

	if (!sessionCookie) {
		throw new Error('No session cookie found')
	}

	try {
		const decodedUser = await auth.verifySessionCookie(sessionCookie, true)
		return decodedUser
	} catch (_error) {
		throw new Error('Invalid or expired session')
	}
}

/* ----------------------------------------------------------------------- */
/* READ ACTIONS
/* ----------------------------------------------------------------------- */

export async function getUserProfile(
	username: string,
): Promise<ApiResponse<PublicUser | null>> {
	try {
		const user = await userService.getPublicProfile(username)
		return { success: true, data: user }
	} catch (error) {
		logger.error('Failed to get user profile', error)
		return {
			success: false,
			error: 'Failed to load user profile',
		}
	}
}

export async function getUsersByIds(
	ids: string[],
): Promise<ApiResponse<Record<string, PublicUser>>> {
	try {
		const users = await userService.getUsersByIds(ids)
		return { success: true, data: users }
	} catch (error) {
		logger.error('Failed to get users', error)
		return {
			success: false,
			error: 'Failed to load users',
		}
	}
}

/* ----------------------------------------------------------------------- */
/* WRITE ACTIONS
/* ----------------------------------------------------------------------- */

export async function updateUserProfile(
	input: UpdateUserDTO,
): Promise<ApiResponse> {
	try {
		const decodedUser = await requireAuth()
		await userService.updateUser(decodedUser.uid, input, decodedUser.uid)
		return { success: true }
	} catch (error) {
		logger.error('Failed to update user', error)

		if (error instanceof UserDomainError) {
			switch (error.code) {
				case 'UNAUTHORIZED':
					return {
						success: false,
						error: 'You can only update your own profile',
					}
				case 'USER_NOT_FOUND':
					return { success: false, error: 'User profile not found' }
				default:
					return { success: false, error: error.message }
			}
		}

		return {
			success: false,
			error: 'Failed to update profile. Please try again.',
		}
	}
}

export async function deleteUserAccount(): Promise<ApiResponse> {
	try {
		const decodedUser = await requireAuth()
		const userId = decodedUser.uid
		const auth = getServerFirebaseAuth()

		// Delete all snippets owned by the user first.
		const snippets = await snippetService.listByUser(userId)
		await Promise.all(
			snippets.map((snippet) =>
				snippetService.deleteSnippet(snippet.id, userId),
			),
		)

		// Delete profile and auth account.
		await userService.deleteUser(userId, userId)
		await auth.deleteUser(userId)

		const cookieStore = await cookies()
		cookieStore.delete('__session')

		return { success: true }
	} catch (error) {
		logger.error('Failed to delete user', error)

		if (error instanceof UserDomainError) {
			switch (error.code) {
				case 'UNAUTHORIZED':
					return {
						success: false,
						error: 'You can only delete your own account',
					}
				case 'USER_NOT_FOUND':
					return { success: false, error: 'User profile not found' }
				default:
					return { success: false, error: error.message }
			}
		}

		return {
			success: false,
			error: 'Failed to delete account. Please try again.',
		}
	}
}
