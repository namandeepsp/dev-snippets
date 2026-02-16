import type { PublicUser, UpdateUserDTO } from '../../core/user.types'

/**
 * ============================================================================
 * USER API CLIENT INTERFACE
 * ============================================================================
 *
 * This interface defines how the UI layer communicates with the backend.
 *
 * Why this exists:
 * - Serverless mode: Implemented with Next.js Server Actions
 * - REST mode: Implemented with fetch() calls to REST endpoints
 * - GraphQL mode: Implemented with GraphQL queries
 *
 * The UI layer NEVER imports server actions directly.
 * The UI layer ALWAYS goes through this interface.
 */

export interface UserApiClient {
	/* ----------------------------------------------------------------------- */
	/* READ OPERATIONS - Public data
    /* ----------------------------------------------------------------------- */

	/**
	 * Get a public user profile by username
	 */
	getProfile(username: string): Promise<PublicUser | null>

	/**
	 * Get multiple users by their IDs
	 * Returns a record keyed by user ID for easy lookup
	 */
	getUsersByIds(ids: string[]): Promise<Record<string, PublicUser>>

	/* ----------------------------------------------------------------------- */
	/* WRITE OPERATIONS - Require authentication
    /* ----------------------------------------------------------------------- */

	/**
	 * Update the current user's profile
	 */
	updateProfile(input: UpdateUserDTO): Promise<void>

	/**
	 * Delete the current user's account
	 */
	deleteAccount(): Promise<void>
}

/**
 * ============================================================================
 * API RESPONSE TYPES
 * ============================================================================
 *
 * Standardized response format for consistent error handling
 */

export type ApiResponse<T = void> = {
	success: boolean
	data?: T
	error?: string
}
