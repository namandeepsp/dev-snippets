'use client'

import { logger } from '@/shared/utils/logger'
import { ServerActionSnippetClient } from './server-action.client'
import type { SnippetAPIClient } from './snippet-api.client'

export type APIMode = 'serverless' | 'rest' | 'graphql'

const DEFAULT_MODE: APIMode = 'serverless'

function getAPIMode(): APIMode {
	const mode = process.env.NEXT_PUBLIC_API_MODE as APIMode | undefined

	if (mode && ['serverless', 'rest', 'graphql'].includes(mode)) {
		return mode
	}

	return DEFAULT_MODE
}

function createRestClient(): SnippetAPIClient {
	throw new Error(
		'REST API client not implemented. ' +
			'Set NEXT_PUBLIC_API_MODE=serverless to use server actions.',
	)
}

function createGraphQLClient(): SnippetAPIClient {
	throw new Error(
		'GraphQL client not implemented. ' +
			'Set NEXT_PUBLIC_API_MODE=serverless to use server actions.',
	)
}

function createSnippetAPIClient(): SnippetAPIClient {
	const mode = getAPIMode()

	if (process.env.NODE_ENV === 'development' && mode !== 'serverless') {
		logger.warn(
			`[Snippets] Using ${mode} mode. Make sure your ${mode} API is running.`,
		)
	}

	switch (mode) {
		case 'serverless':
			return new ServerActionSnippetClient()

		case 'rest':
			return createRestClient()

		case 'graphql':
			return createGraphQLClient()

		default:
			const _exhaustive: never = mode
			return new ServerActionSnippetClient()
	}
}

export const snippetApiClient = createSnippetAPIClient()

/**
 * @deprecated Use snippetApiClient directly
 * This export exists for backward compatibility
 */
export { snippetApiClient as default }
