/**
 * ============================================================================
 * FORMATTER INDEX
 * ============================================================================
 *
 * Auto-imports all formatters to ensure they register themselves.
 * Import this file once in your app to enable all formatters.
 */

import './prettier.formatter'
import './black.formatter'
import './gofmt.formatter'
import './markdown.formatter'
import './sql.formatter'
import './java.formatter'

export { formatterRegistry, formatCode } from './formatter.registry'
export type {
	CodeFormatter,
	FormatRequest,
	FormatResult,
} from './formatter.types'
