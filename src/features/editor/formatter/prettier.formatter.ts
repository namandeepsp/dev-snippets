import babelPlugin from 'prettier/plugins/babel'
import estreePlugin from 'prettier/plugins/estree'
import htmlPlugin from 'prettier/plugins/html'
import postcssPlugin from 'prettier/plugins/postcss'
import tsPlugin from 'prettier/plugins/typescript'
import prettier from 'prettier/standalone'

import type { EditorLanguage } from '../editor.config'
import { formatterRegistry } from './formatter.registry'
import type {
	FormatRequest,
	FormatResult,
	PrettierFormatter,
} from './formatter.types'

/**
 * ============================================================================
 * PRETTIER FORMATTER
 * ============================================================================
 *
 * Prettier implementation for JavaScript/TypeScript/JSON/HTML/CSS.
 *
 * Features:
 * - Runs entirely in the browser (no server roundtrip)
 * - Supports all major web languages
 * - Configurable options
 * - Graceful fallback on error
 */

const SUPPORTED_LANGUAGES: EditorLanguage[] = [
	'javascript',
	'typescript',
	'json',
	'html',
	'css',
]

const prettierFormatter: PrettierFormatter = {
	name: 'prettier',

	supports(language: EditorLanguage): boolean {
		return SUPPORTED_LANGUAGES.includes(language)
	},

	async format(request: FormatRequest): Promise<FormatResult> {
		try {
			// Map our language to Prettier parser
			const parser = this.getParser(request.language)

			const formattedCode = await prettier.format(request.code, {
				parser,
				plugins: [
					babelPlugin,
					estreePlugin,
					tsPlugin,
					htmlPlugin,
					postcssPlugin,
				],
				// Default options
				semi: true,
				singleQuote: true,
				trailingComma: 'es5',
				printWidth: 80,
				tabWidth: 2,
				useTabs: false,
				bracketSpacing: true,
				arrowParens: 'always',
				endOfLine: 'lf',
			})

			return {
				formattedCode: formattedCode.trimEnd() + '\n',
			}
		} catch (error) {
			console.error('[Prettier] Formatting failed:', error)
			return {
				formattedCode: request.code,
				error: error instanceof Error ? error.message : 'Formatting failed',
			}
		}
	},

	getParser(language: EditorLanguage): string {
		const parserMap: Partial<Record<EditorLanguage, string>> = {
			javascript: 'babel',
			typescript: 'typescript',
			json: 'json',
			html: 'html',
			css: 'css',
		}
		return parserMap[language] || 'babel'
	},
}

// Auto-register on import
formatterRegistry.register(prettierFormatter)

export default prettierFormatter
