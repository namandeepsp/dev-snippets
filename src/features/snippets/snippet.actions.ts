'use server'

import { userService } from '@/features/user/user.container'
import { getServerFirebaseAuth } from '@/services/firebase/firebase.server'
import { logger } from '@/shared/utils/logger'
import { cookies } from 'next/headers'
import { snippetService } from './snippet.server.container'

import type { ApiResponse } from '@/features/user/infra/client/user-api.client'
import type {
	CreateSnippetServiceInput,
	UpdateSnippetServiceInput,
} from './core/repositories/snippet.repository'
import type { Snippet } from './core/snippet.types'

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

/* ----------------------------------------------------------------------- */
/* CREATE
/* ----------------------------------------------------------------------- */

export async function createSnippetAction(
	input: CreateSnippetServiceInput,
): Promise<ApiResponse<Snippet>> {
	try {
		const user = await requireAuth()

		const snippet = await snippetService.createSnippet(
			input,
			user.id,
			user.name,
		)

		return {
			success: true,
			data: snippet,
		}
	} catch (error) {
		logger.error('Failed to create snippet', error)

		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to create snippet',
		}
	}
}

/* ----------------------------------------------------------------------- */
/* UPDATE
/* ----------------------------------------------------------------------- */

export async function updateSnippetAction(
	snippetId: string,
	input: UpdateSnippetServiceInput,
): Promise<ApiResponse> {
	try {
		const user = await requireAuth()
		await snippetService.updateSnippet(snippetId, input, user.id)

		return { success: true }
	} catch (error) {
		logger.error('Failed to update snippet', error)

		if (error instanceof Error) {
			if (error.message === 'Unauthorized') {
				return {
					success: false,
					error: 'You can only edit your own snippets',
				}
			}
			return {
				success: false,
				error: error.message,
			}
		}

		return {
			success: false,
			error: 'Failed to update snippet',
		}
	}
}

/* ----------------------------------------------------------------------- */
/* DELETE
/* ----------------------------------------------------------------------- */

export async function deleteSnippetAction(
	snippetId: string,
): Promise<ApiResponse> {
	try {
		const user = await requireAuth()
		await snippetService.deleteSnippet(snippetId, user.id)

		return { success: true }
	} catch (error) {
		logger.error('Failed to delete snippet', error)

		if (error instanceof Error) {
			if (error.message === 'Unauthorized') {
				return {
					success: false,
					error: 'You can only delete your own snippets',
				}
			}
			return {
				success: false,
				error: error.message,
			}
		}

		return {
			success: false,
			error: 'Failed to delete snippet',
		}
	}
}

/* ----------------------------------------------------------------------- */
/* VIEW COUNT - NEW ACTION
/* ----------------------------------------------------------------------- */

/**
 * Increment view count for a snippet.
 * This action does NOT require authentication - public views count too.
 */
export async function incrementViewsAction(
	snippetId: string,
): Promise<ApiResponse> {
	try {
		await snippetService.incrementViews(snippetId)
		return { success: true }
	} catch (error) {
		logger.error('Failed to increment views', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to record view',
		}
	}
}

/* ----------------------------------------------------------------------- */
/* LIKE
/* ----------------------------------------------------------------------- */

export async function toggleLikeAction(
	snippetId: string,
): Promise<ApiResponse<{ liked: boolean }>> {
	try {
		const user = await requireAuth()
		const liked = await snippetService.toggleLike(snippetId, user.id)
		return { success: true, data: { liked } }
	} catch (error) {
		logger.error('Failed to toggle like', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to toggle like',
		}
	}
}

/* ----------------------------------------------------------------------- */
/* VERSION CONTROL
/* ----------------------------------------------------------------------- */

export async function restoreSnippetVersionAction(
	snippetId: string,
	versionNumber: number,
): Promise<ApiResponse> {
	try {
		const user = await requireAuth()
		await snippetService.restoreVersion(snippetId, versionNumber, user.id)

		return { success: true }
	} catch (error) {
		logger.error('Failed to restore snippet version', error)

		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to restore version',
		}
	}
}

/* ----------------------------------------------------------------------- */
/* SHARING
/* ----------------------------------------------------------------------- */

export async function shareSnippetAction(
	snippetId: string,
	userIds: string[],
): Promise<ApiResponse> {
	try {
		const user = await requireAuth()
		await snippetService.shareWithUsers(snippetId, userIds, user.id)

		return { success: true }
	} catch (error) {
		logger.error('Failed to share snippet', error)

		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to share snippet',
		}
	}
}
