/**
 * ============================================================================
 * USER API CLIENT FACTORY
 * ============================================================================
 *
 * Creates the appropriate API client implementation based on environment.
 *
 * Configuration:
 * NEXT_PUBLIC_API_MODE = 'serverless' | 'rest' | 'graphql'
 *
 * Default: serverless
 *
 * This is the ONLY place that decides which implementation to use.
 * The rest of the app just imports the singleton instance.
 */

import { ServerActionUserClient } from './server-action.client'
import type { UserApiClient } from './user-api.client'

type APIMode = 'serverless' | 'rest' | 'graphql'

function createUserApiClient(): UserApiClient {
	const mode = (process.env.NEXT_PUBLIC_API_MODE as APIMode) || 'serverless'

	switch (mode) {
		case 'serverless':
			return new ServerActionUserClient()

		case 'rest':
			// Not implemented yet - will use fetch() to REST endpoints
			console.warn('REST API mode not implemented, falling back to serverless')
			return new ServerActionUserClient()

		case 'graphql':
			// Not implemented yet - will use GraphQL client
			console.warn('GraphQL mode not implemented, falling back to serverless')
			return new ServerActionUserClient()

		default:
			return new ServerActionUserClient()
	}
}

/**
 * Singleton instance of the user API client.
 *
 * This is what UI components should import:
 *
 * ```tsx
 * 'use client'
 * import { userApiClient } from '@/features/user/infra/client/user-api.factory'
 *
 * const user = await userApiClient.getProfile(username)
 * ```
 */
export const userApiClient = createUserApiClient()
