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

formatterRegistry.register(blackFormatter)

export default blackFormatter
