import { format as sqlFormatter } from 'sql-formatter'
import type { EditorLanguage } from '../editor.config'
import { formatterRegistry } from './formatter.registry'
import type {
	CodeFormatter,
	FormatRequest,
	FormatResult,
} from './formatter.types'

/**
 * ============================================================================
 * SQL FORMATTER
 * ============================================================================
 *
 * SQL code formatter using sql-formatter library.
 * Runs entirely in the browser.
 *
 * Supports:
 * - Standard SQL
 * - PostgreSQL
 * - MySQL
 * - BigQuery
 * - And more...
 */

const sqlFormatterClient: CodeFormatter = {
	name: 'sql-formatter',

	supports(language: EditorLanguage): boolean {
		return language === 'sql'
	},

	async format(request: FormatRequest): Promise<FormatResult> {
		try {
			// Detect dialect from options or default to standard SQL
			const dialect = (request.options?.dialect as any) || 'sql'
			const formatConfig = {
				language: dialect,
				indent: '  ',
				uppercase: true,
				linesBetweenQueries: 2,
			}
			const formattedCode = sqlFormatter(request.code, formatConfig)

			return { formattedCode }
		} catch (error) {
			console.error('[SQL Formatter] Formatting failed:', error)

			return {
				formattedCode: request.code,
				error: error instanceof Error ? error.message : 'Failed to format SQL',
			}
		}
	},
}

// Auto-register on import
formatterRegistry.register(sqlFormatterClient)

export default sqlFormatterClient
