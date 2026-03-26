import { logger } from '@/shared/utils/logger'
import { toast } from '@/shared/ui/design-system'

/**
 * ============================================================================
 * CODE BLOCK ACTIONS
 * ============================================================================
 *
 * Utility functions for copy and share operations.
 */

export async function copyToClipboard(
	code: string,
	onSuccess: () => void,
	onError: (error: string) => void,
): Promise<void> {
	try {
		await navigator.clipboard.writeText(code)
		onSuccess()
	} catch (_err) {
		onError('Failed to copy')
	}
}

export async function shareSnippet(
	snippetId: string | undefined,
	snippetTitle: string | undefined,
	snippetDescription: string | undefined,
	visibility: 'public' | 'private' | 'shared' | undefined,
): Promise<void> {
	if (!snippetId) return

	const url = `${globalThis.location.origin}/snippets/${snippetId}`

	if (visibility === 'private') {
		toast.warning('Cannot share private snippet', {
			description: 'Make it public to share with others',
		})
		return
	}

	if (navigator.share) {
		try {
			await navigator.share({
				title: snippetTitle || 'Code Snippet',
				text: snippetDescription || 'Check out this code snippet',
				url,
			})
		} catch (err) {
			if ((err as Error).name !== 'AbortError') {
				logger.error('Share failed', err)
			}
		}
	} else {
		await navigator.clipboard.writeText(url)
		toast.success('Link copied to clipboard!')
	}
}
