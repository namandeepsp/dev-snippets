import type { PublicUser, UpdateUserDTO } from '../../core/user.types'
import type { UserApiClient } from './user-api.client'

/**
 * ============================================================================
 * SERVER ACTION IMPLEMENTATION
 * ============================================================================
 *
 * Implements UserApiClient using Next.js Server Actions.
 *
 * This is the DEFAULT implementation for serverless deployments.
 * Each method calls a corresponding server action and handles the response.
 */

// Import server actions
import {
	deleteUserAccount,
	getUserProfile,
	getUsersByIds,
	updateUserProfile,
} from '../../user.actions'

export class ServerActionUserClient implements UserApiClient {
	async getProfile(username: string): Promise<PublicUser | null> {
		const response = await getUserProfile(username)
		if (!response.success) {
			throw new Error(response.error || 'Failed to get user profile')
		}
		return response.data ?? null
	}

	async getUsersByIds(ids: string[]): Promise<Record<string, PublicUser>> {
		const response = await getUsersByIds(ids)
		if (!response.success) {
			throw new Error(response.error || 'Failed to get users')
		}
		return response.data ?? {}
	}

	async updateProfile(input: UpdateUserDTO): Promise<void> {
		const response = await updateUserProfile(input)
		if (!response.success) {
			throw new Error(response.error || 'Failed to update profile')
		}
	}

	async deleteAccount(): Promise<void> {
		const response = await deleteUserAccount()
		if (!response.success) {
			throw new Error(response.error || 'Failed to delete account')
		}
	}
}
