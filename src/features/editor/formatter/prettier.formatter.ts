import babelPlugin from 'prettier/plugins/babel'
import estreePlugin from 'prettier/plugins/estree'
import htmlPlugin from 'prettier/plugins/html'
import postcssPlugin from 'prettier/plugins/postcss'
import tsPlugin from 'prettier/plugins/typescript'
import yamlPlugin from 'prettier/plugins/yaml'
import prettier from 'prettier/standalone'

import { logger } from '@/shared/utils/logger'
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
 * Prettier implementation for JavaScript/TypeScript/JSON/HTML/CSS/YAML.
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
	'yaml',
]

function looksLikeYaml(code: string): boolean {
	const lines = code
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)

	if (lines.length < 2) return false

	// Simple heuristic: enough key/value or list items, with no strong JS/TS signals.
	const yamlLikeCount = lines.filter(
		(line) =>
			/^[A-Za-z0-9_-]+:\s*(.*)$/.test(line) ||
			/^-\s+/.test(line) ||
			/^(---|\.\.\.)$/.test(line),
	).length
	const jsLikeCount = lines.filter(
		(line) =>
			line.endsWith(';') ||
			/(^|\s)(const|let|var|function|class|import|export)\b/.test(line),
	).length

	return yamlLikeCount >= 2 && jsLikeCount === 0
}

function isPrettierParseError(error: unknown): boolean {
	if (!(error instanceof Error)) return false
	return (
		error.name === 'SyntaxError' ||
		error.message.includes('Unexpected token') ||
		error.message.includes('SyntaxError')
	)
}

const prettierFormatter: PrettierFormatter = {
	name: 'prettier',

	supports(language: EditorLanguage): boolean {
		return SUPPORTED_LANGUAGES.includes(language)
	},

	async format(request: FormatRequest): Promise<FormatResult> {
		try {
			logger.info('✨ Prettier formatter called for:', request.language)
			// Map our language to Prettier parser
			const parser = this.getParser(request.language)
			logger.info('✨ Using parser:', parser)
			const options = {
				plugins: [
					babelPlugin,
					estreePlugin,
					tsPlugin,
					htmlPlugin,
					postcssPlugin,
					yamlPlugin,
				],
				// Default options
				semi: true,
				singleQuote: true,
				trailingComma: 'es5' as const,
				printWidth: 80,
				tabWidth: 2,
				useTabs: false,
				bracketSpacing: true,
				arrowParens: 'always' as const,
				endOfLine: 'lf' as const,
			}
			let formattedCode: string
			try {
				formattedCode = await prettier.format(request.code, {
					...options,
					parser,
				})
				logger.info('✨ Prettier formatting succeeded')
			} catch (primaryError) {
				logger.info('✨ Prettier formatting failed, trying YAML fallback')
				if (parser !== 'yaml' && looksLikeYaml(request.code)) {
					formattedCode = await prettier.format(request.code, {
						...options,
						parser: 'yaml',
					})
				} else {
					throw primaryError
				}
			}

			return {
				formattedCode: formattedCode.trimEnd() + '\n',
			}
		} catch (error) {
			// Parse failures are common during paste/typing; avoid noisy console logs.
			if (!isPrettierParseError(error)) {
				logger.error('Prettier formatting failed', error)
			}
			logger.info('✨ Prettier formatting error:', error)
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
			yaml: 'yaml',
		}
		return parserMap[language] || 'babel'
	},
}

// Auto-register on import
formatterRegistry.register(prettierFormatter)

export default prettierFormatter
