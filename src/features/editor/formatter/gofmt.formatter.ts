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
 * GOFMT FORMATTER
 * ============================================================================
 *
 * Go formatter implementation.
 *
 * Note: This is a placeholder. Actual gofmt requires:
 * 1. WASM build of gofmt
 * 2. Server-side formatting endpoint
 * 3. Or a WebAssembly implementation
 *
 * For now, it returns the code as-is.
 */

const gofmtFormatter: CodeFormatter = {
	name: 'gofmt',

	supports(language: EditorLanguage): boolean {
		return language === 'go'
	},

	async format(request: FormatRequest): Promise<FormatResult> {
		// TODO: Implement actual gofmt formatting
		// Options:
		// 1. Use WebAssembly build of gofmt
		// 2. Call server-side API endpoint
		// 3. Use a pure JavaScript Go formatter

		logger.warn('gofmt formatting not implemented, returning original code')

		return {
			formattedCode: request.code,
		}
	},
}

// Auto-register on import
formatterRegistry.register(gofmtFormatter)

export default gofmtFormatter
