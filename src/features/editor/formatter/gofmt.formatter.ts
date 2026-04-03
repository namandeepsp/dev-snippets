import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'
import {
	type FormatProxyRequest,
	type ProxyFormatResponse,
	normalizeGoLanguage,
} from './formatter.api.types'
import { formatterRegistry } from './formatter.registry'
import type {
	CodeFormatter,
	FormatRequest,
	FormatResult,
} from './formatter.types'

/**
 * ============================================================================
 * GOFMT FORMATTER
 * ============================================================================
 *
 * Go formatter implementation via server-side formatting endpoint.
 */

const gofmtFormatter: CodeFormatter = {
	name: 'gofmt',

	supports(language: EditorLanguage): boolean {
		return language === 'go'
	},

	async format(request: FormatRequest): Promise<FormatResult> {
		try {
			const payload: FormatProxyRequest = {
				code: request.code,
				language: normalizeGoLanguage(request.language),
			}

			const response = await fetch('/api/format/go', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})
			const data = (await response
				.json()
				.catch(() => ({}))) as Partial<ProxyFormatResponse>
			const formattedCode =
				typeof data?.data?.formatted_code === 'string'
					? data.data.formatted_code
					: request.code

			if (!response.ok || data?.success === false || data?.error) {
				return {
					formattedCode: request.code,
					error:
						typeof data?.error === 'string'
							? data.error
							: 'Failed to format Go code',
				}
			}

			return { formattedCode }
		} catch (error) {
			logger.error('gofmt formatting failed', error)
			return {
				formattedCode: request.code,
				error:
					error instanceof Error ? error.message : 'Failed to format Go code',
			}
		}
	},
}

// Auto-register on import
formatterRegistry.register(gofmtFormatter)

export default gofmtFormatter
