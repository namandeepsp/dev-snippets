import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'
import {
	type FormatProxyRequest,
	type ProxyFormatResponse,
	normalizePythonLanguage,
} from './formatter.api.types'
import { formatterRegistry } from './formatter.registry'
import type {
	CodeFormatter,
	FormatRequest,
	FormatResult,
} from './formatter.types'

/**
 * ============================================================================
 * BLACK FORMATTER
 * ============================================================================
 *
 * Python code formatter using Black.
 *
 * Note: This is a server-side formatter because Black requires Python.
 * The client sends code to the /api/format/python endpoint.
 */

const blackFormatter: CodeFormatter = {
	name: 'black',

	supports(language: EditorLanguage): boolean {
		return language === 'python'
	},

	async format(request: FormatRequest): Promise<FormatResult> {
		try {
			const payload: FormatProxyRequest = {
				code: request.code,
				language: normalizePythonLanguage(request.language),
			}

			// Client-side: Call server endpoint
			const response = await fetch('/api/format/python', {
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
							: 'Failed to format Python code',
				}
			}

			return { formattedCode }
		} catch (error) {
			logger.error('Black formatting failed', error)

			// Fallback: Return original code
			return {
				formattedCode: request.code,
				error:
					error instanceof Error
						? error.message
						: 'Failed to format Python code',
			}
		}
	},
}

// Auto-register on import
formatterRegistry.register(blackFormatter)

export default blackFormatter
