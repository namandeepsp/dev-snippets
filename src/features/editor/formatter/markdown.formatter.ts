import { logger } from '@/shared/utils/logger'
import { format } from 'prettier'
import parserMarkdown from 'prettier/plugins/markdown'
import type { EditorLanguage } from '../editor.config'
import { formatterRegistry } from './formatter.registry'
import type {
	CodeFormatter,
	FormatRequest,
	FormatResult,
} from './formatter.types'

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
			logger.error('Markdown formatting failed', error)

			return {
				formattedCode: request.code,
				error:
					error instanceof Error ? error.message : 'Failed to format Markdown',
			}
		}
	},
}

formatterRegistry.register(markdownFormatter)

export default markdownFormatter
