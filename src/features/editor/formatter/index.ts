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
