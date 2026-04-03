import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'
import type { CodeFormatter, FormatRequest } from './formatter.types'
import { languageDetector } from './languageDetector'

/**
 * ============================================================================
 * FORMATTER REGISTRY
 * ============================================================================
 *
 * Central registry for all code formatters.
 * Language detection is handled by the separate LanguageDetector utility.
 */

class FormatterRegistry {
	private formatters: Map<EditorLanguage, CodeFormatter> = new Map()
	private fallbackFormatters: CodeFormatter[] = []

	/* ----------------------------------------------------------------------- */
	/* REGISTRATION
	/* ----------------------------------------------------------------------- */

	register(formatter: CodeFormatter): void {
		const languages = this.getSupportedLanguages(formatter)

		for (const language of languages) {
			this.formatters.set(language, formatter)
		}

		if (languages.length > 1) {
			this.fallbackFormatters.push(formatter)
		}
	}

	registerAll(formatters: CodeFormatter[]): void {
		formatters.forEach((formatter) => this.register(formatter))
	}

	/* ----------------------------------------------------------------------- */
	/* FORMATTING
	/* ----------------------------------------------------------------------- */

	getFormatter(language: EditorLanguage): CodeFormatter | null {
		return this.formatters.get(language) || null
	}

	async format(code: string, language: EditorLanguage): Promise<string> {
		const outcome = await this.formatWithStatus(code, language)
		return outcome.formattedCode
	}

	async formatWithStatus(
		code: string,
		language: EditorLanguage,
	): Promise<{ formattedCode: string; error?: string }> {
		try {
			logger.info('📜 formatWithStatus called for:', language)
			const formatter = this.getFormatter(language)
			logger.info('📜 formatter found:', formatter?.name || 'NONE')
			if (!formatter) {
				logger.info('📜 No formatter found, returning code as-is')
				return { formattedCode: code }
			}

			const request: FormatRequest = { code, language }
			const result = await formatter.format(request)

			if (result.error) {
				logger.info('📜 Formatter returned error:', result.error)
				return { formattedCode: code, error: result.error }
			}

			logger.info('📜 Formatting succeeded')
			return { formattedCode: result.formattedCode }
		} catch (error) {
			logger.error(`Failed to format ${language}`, error)
			logger.info('📜 Formatting exception:', error)
			return {
				formattedCode: code,
				error: this.getFriendlyError(
					language,
					error instanceof Error ? error.message : 'Unknown formatter error',
				),
			}
		}
	}

	async formatWithFallback(
		code: string,
		language: EditorLanguage,
	): Promise<string> {
		const specific = await this.format(code, language)
		if (specific !== code) return specific

		for (const formatter of this.fallbackFormatters) {
			try {
				if (formatter.supports(language)) {
					const request: FormatRequest = { code, language }
					const result = await formatter.format(request)
					if (!result.error) return result.formattedCode
				}
			} catch {
				continue
			}
		}

		return code
	}

	/* ----------------------------------------------------------------------- */
	/* LANGUAGE DETECTION
	/* ----------------------------------------------------------------------- */

	async initializeLanguageDetection(): Promise<void> {
		await languageDetector.initialize()
	}

	isApiBackedLanguage(language: EditorLanguage): boolean {
		return languageDetector.isApiBackedLanguage(language)
	}

	async detectLanguage(code: string): Promise<EditorLanguage | null> {
		return languageDetector.detectLanguage(code)
	}

	async resolvePasteLanguage(
		code: string,
		currentLanguage: EditorLanguage,
		onLanguageDetected?: (language: EditorLanguage) => void,
	): Promise<EditorLanguage> {
		return languageDetector.resolvePasteLanguage(
			code,
			currentLanguage,
			onLanguageDetected,
		)
	}

	/* ----------------------------------------------------------------------- */
	/* UTILITIES
	/* ----------------------------------------------------------------------- */

	hasFormatter(language: EditorLanguage): boolean {
		return this.formatters.has(language)
	}

	clear(): void {
		this.formatters.clear()
		this.fallbackFormatters = []
	}

	/* ----------------------------------------------------------------------- */
	/* PRIVATE
	/* ----------------------------------------------------------------------- */

	private getSupportedLanguages(formatter: CodeFormatter): EditorLanguage[] {
		const languages: EditorLanguage[] = []
		const testLanguages: EditorLanguage[] = [
			'javascript',
			'typescript',
			'json',
			'html',
			'css',
			'go',
			'python',
			'java',
			'markdown',
			'sql',
			'yaml',
		]

		for (const lang of testLanguages) {
			if (formatter.supports(lang)) {
				languages.push(lang)
			}
		}

		return languages
	}

	private getFriendlyError(
		language: EditorLanguage,
		_rawError: string,
	): string {
		switch (language) {
			case 'javascript':
				return 'Invalid JavaScript code. Please fix syntax and try again.'
			case 'typescript':
				return 'Invalid TypeScript code. Please fix syntax and try again.'
			case 'json':
				return 'Invalid JSON format. Please fix syntax and try again.'
			case 'html':
				return 'Invalid HTML structure. Please fix syntax and try again.'
			case 'css':
				return 'Invalid CSS code. Please fix syntax and try again.'
			case 'python':
				return 'Invalid Python code. Please fix syntax and try again.'
			case 'sql':
				return 'Invalid SQL query. Please fix syntax and try again.'
			case 'markdown':
				return 'Invalid Markdown content. Please fix syntax and try again.'
			case 'go':
				return 'Go formatting is unavailable for this input.'
			case 'yaml':
				return 'Invalid YAML content. Please fix syntax and try again.'
			default:
				return 'Invalid code. Please fix syntax and try again.'
		}
	}
}

// Singleton instance
export const formatterRegistry = new FormatterRegistry()

let formattersLoaded: Promise<void> | null = null

async function ensureFormattersLoaded(): Promise<void> {
	if (!formattersLoaded) {
		formattersLoaded = import('./formatter.bootstrap').then(() => {})
	}
	return formattersLoaded
}

/**
 * Convenience function for formatting code.
 * Use this in components instead of accessing the registry directly.
 */
export async function formatCode(
	code: string,
	language: EditorLanguage,
): Promise<string> {
	await ensureFormattersLoaded()
	return formatterRegistry.format(code, language)
}

export async function formatCodeWithStatus(
	code: string,
	language: EditorLanguage,
): Promise<{ formattedCode: string; error?: string }> {
	await ensureFormattersLoaded()
	return formatterRegistry.formatWithStatus(code, language)
}
