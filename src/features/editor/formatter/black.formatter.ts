import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'
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
 * The client sends code to a serverless function or API endpoint.
 *
 * TODO: Implement server-side formatting endpoint
 */

const blackFormatter: CodeFormatter = {
	name: 'black',

	supports(language: EditorLanguage): boolean {
		return language === 'python'
	},

	async format(request: FormatRequest): Promise<FormatResult> {
		try {
			// Client-side: Call server endpoint
			const response = await fetch('/api/format/python', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					code: request.code,
					formatter: 'black',
				}),
			})

			if (!response.ok) {
				throw new Error('Formatting failed')
			}

			const { formattedCode } = await response.json()

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
