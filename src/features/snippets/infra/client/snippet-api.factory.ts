'use client'

import { ServerActionSnippetClient } from './server-action.client'
import type { SnippetAPIClient } from './snippet-api.client'

/**
 * ============================================================================
 * SNIPPET API CLIENT FACTORY
 * ============================================================================
 *
 * Creates the appropriate API client implementation based on configuration.
 *
 * Why this exists:
 * - Serverless mode (default): Uses Next.js Server Actions
 * - REST mode: Will use fetch() calls to REST endpoints
 * - GraphQL mode: Will use GraphQL client
 *
 * This is the ONLY place that decides which implementation to use.
 * The rest of the app just imports the singleton instance.
 */

/* ----------------------------------------------------------------------- */
/* ENVIRONMENT DETECTION
/* ----------------------------------------------------------------------- */

/**
 * API mode configuration.
 * Set NEXT_PUBLIC_API_MODE to switch between implementations.
 *
 * @example
 * // .env.local
 * NEXT_PUBLIC_API_MODE=serverless  // Default
 * NEXT_PUBLIC_API_MODE=rest        // Future REST API
 * NEXT_PUBLIC_API_MODE=graphql     // Future GraphQL API
 */
export type APIMode = 'serverless' | 'rest' | 'graphql'

const DEFAULT_MODE: APIMode = 'serverless'

function getAPIMode(): APIMode {
	// Allow override via environment variable
	const mode = process.env.NEXT_PUBLIC_API_MODE as APIMode | undefined

	if (mode && ['serverless', 'rest', 'graphql'].includes(mode)) {
		return mode
	}

	return DEFAULT_MODE
}

/* ----------------------------------------------------------------------- */
/* CLIENT IMPLEMENTATIONS
/* ----------------------------------------------------------------------- */

/**
 * Creates the REST API client implementation.
 *
 * TODO: Implement when REST API is ready
 */
function createRestClient(): SnippetAPIClient {
	throw new Error(
		'REST API client not implemented. ' +
			'Set NEXT_PUBLIC_API_MODE=serverless to use server actions.',
	)
}

/**
 * Creates the GraphQL client implementation.
 *
 * TODO: Implement when GraphQL API is ready
 */
function createGraphQLClient(): SnippetAPIClient {
	throw new Error(
		'GraphQL client not implemented. ' +
			'Set NEXT_PUBLIC_API_MODE=serverless to use server actions.',
	)
}

/**
 * Creates the appropriate client based on configuration.
 */
function createSnippetAPIClient(): SnippetAPIClient {
	const mode = getAPIMode()

	// Log warning in development when not using serverless
	if (process.env.NODE_ENV === 'development' && mode !== 'serverless') {
		console.warn(
			`[Snippets] Using ${mode} mode. ` +
				`Make sure your ${mode} API is running.`,
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
			// Type safety - should never reach here
			const _exhaustive: never = mode
			return new ServerActionSnippetClient()
	}
}

/* ----------------------------------------------------------------------- */
/* SINGLETON EXPORT
/* ----------------------------------------------------------------------- */

/**
 * Singleton instance of the snippet API client.
 *
 * This is what UI components should import:
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { snippetApiClient } from '@/features/snippets/infra/client/snippet-api.factory'
 *
 * async function handleCreate() {
 *   const snippet = await snippetApiClient.create(input)
 *   // ...
 * }
 * ```
 *
 * Server components should NEVER import this.
 * Server components should use snippetService directly.
 */
export const snippetApiClient = createSnippetAPIClient()

/**
 * @deprecated Use snippetApiClient directly
 * This export exists for backward compatibility
 */
export { snippetApiClient as default }
