import { logger } from '@/shared/utils/logger'
import { format as sqlFormatter } from 'sql-formatter'
import type { EditorLanguage } from '../editor.config'
import { formatterRegistry } from './formatter.registry'
import type {
	CodeFormatter,
	FormatRequest,
	FormatResult,
} from './formatter.types'

const sqlFormatterClient: CodeFormatter = {
	name: 'sql-formatter',

	supports(language: EditorLanguage): boolean {
		return language === 'sql'
	},

	async format(request: FormatRequest): Promise<FormatResult> {
		try {
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
			logger.error('SQL formatter failed', error)

			return {
				formattedCode: request.code,
				error: error instanceof Error ? error.message : 'Failed to format SQL',
			}
		}
	},
}

formatterRegistry.register(sqlFormatterClient)

export default sqlFormatterClient
