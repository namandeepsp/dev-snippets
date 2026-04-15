import { logger } from '@/shared/utils/logger'
import { ServerActionUserClient } from './server-action.client'
import type { UserApiClient } from './user-api.client'

type APIMode = 'serverless' | 'rest' | 'graphql'

function createUserApiClient(): UserApiClient {
	const mode = (process.env.NEXT_PUBLIC_API_MODE as APIMode) || 'serverless'

	switch (mode) {
		case 'serverless':
			return new ServerActionUserClient()

		case 'rest':
			logger.warn('REST API mode not implemented, falling back to serverless')
			return new ServerActionUserClient()

		case 'graphql':
			logger.warn('GraphQL mode not implemented, falling back to serverless')
			return new ServerActionUserClient()

		default:
			return new ServerActionUserClient()
	}
}

export const userApiClient = createUserApiClient()
