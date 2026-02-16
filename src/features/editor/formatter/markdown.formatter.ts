import { format } from 'prettier'
import parserMarkdown from 'prettier/plugins/markdown'
import type { EditorLanguage } from '../editor.config'
import { formatterRegistry } from './formatter.registry'
import type {
	CodeFormatter,
	FormatRequest,
	FormatResult,
} from './formatter.types'

/**
 * ============================================================================
 * MARKDOWN FORMATTER
 * ============================================================================
 *
 * Markdown code formatter using Prettier.
 * Runs entirely in the browser.
 */

const markdownFormatter: CodeFormatter = {
	name: 'markdown',

	supports(language: EditorLanguage): boolean {
		return language === 'markdown'
	},

	async format(request: FormatRequest): Promise<FormatResult> {
		try {
			const formattedCode = await format(request.code, {
				parser: 'markdown',
				plugins: [parserMarkdown],
				printWidth: 80,
				proseWrap: 'always',
				singleQuote: false,
				trailingComma: 'none',
			})

			return { formattedCode }
		} catch (error) {
			console.error('[Markdown] Formatting failed:', error)

			return {
				formattedCode: request.code,
				error:
					error instanceof Error ? error.message : 'Failed to format Markdown',
			}
		}
	},
}

// Auto-register on import
formatterRegistry.register(markdownFormatter)

export default markdownFormatter
