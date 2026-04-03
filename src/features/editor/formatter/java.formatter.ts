import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'
import {
	type FormatProxyRequest,
	type ProxyFormatResponse,
	normalizeJavaLanguage,
} from './formatter.api.types'
import { formatterRegistry } from './formatter.registry'
import type {
	CodeFormatter,
	FormatRequest,
	FormatResult,
} from './formatter.types'

/**
 * ============================================================================
 * JAVA FORMATTER
 * ============================================================================
 *
 * Java formatter implementation via server-side formatting endpoint.
 */

const javaFormatter: CodeFormatter = {
	name: 'google-java-format',

	supports(language: EditorLanguage): boolean {
		return language === 'java'
	},

	async format(request: FormatRequest): Promise<FormatResult> {
		try {
			const payload: FormatProxyRequest = {
				code: request.code,
				language: normalizeJavaLanguage(request.language),
			}

			const response = await fetch('/api/format/java', {
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
							: 'Failed to format Java code',
				}
			}

			return { formattedCode }
		} catch (error) {
			logger.error('Java formatting failed', error)
			return {
				formattedCode: request.code,
				error:
					error instanceof Error ? error.message : 'Failed to format Java code',
			}
		}
	},
}

// Auto-register on import
formatterRegistry.register(javaFormatter)

export default javaFormatter
