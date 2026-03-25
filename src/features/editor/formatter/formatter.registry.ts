import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'
import type { CodeFormatter, FormatRequest } from './formatter.types'

/**
 * ============================================================================
 * FORMATTER REGISTRY
 * ============================================================================
 *
 * Central registry for all code formatters.
 *
 * Why a registry?
 * - Formatters can register themselves (auto-discovery)
 * - Single source of truth for available formatters
 * - Easy to add new formatters without modifying existing code
 * - Lazy loading - formatters only imported when needed
 *
 * Usage:
 * ```ts
 * // In a formatter file:
 * import { formatterRegistry } from './formatter.registry'
 *
 * const myFormatter: CodeFormatter = { ... }
 * formatterRegistry.register(myFormatter)
 * ```
 */

class FormatterRegistry {
	private formatters: Map<EditorLanguage, CodeFormatter> = new Map()
	private fallbackFormatters: CodeFormatter[] = []

	/* ----------------------------------------------------------------------- */
	/* REGISTRATION
	/* ----------------------------------------------------------------------- */

	/**
	 * Register a formatter for specific languages.
	 * If a formatter for a language already exists, it will be overwritten.
	 */
	register(formatter: CodeFormatter): void {
		// Find all languages this formatter supports
		const languages = this.getSupportedLanguages(formatter)

		for (const language of languages) {
			this.formatters.set(language, formatter)
		}

		// Also store as fallback if it supports multiple languages
		if (languages.length > 1) {
			this.fallbackFormatters.push(formatter)
		}
	}

	/**
	 * Register multiple formatters at once.
	 */
	registerAll(formatters: CodeFormatter[]): void {
		formatters.forEach((formatter) => this.register(formatter))
	}

	/* ----------------------------------------------------------------------- */
	/* FORMATTING
	/* ----------------------------------------------------------------------- */

	/**
	 * Get a formatter for a specific language.
	 * Returns null if no formatter exists.
	 */
	getFormatter(language: EditorLanguage): CodeFormatter | null {
		return this.formatters.get(language) || null
	}

	/**
	 * Format code using the appropriate formatter.
	 * If no formatter exists, returns the original code.
	 * Never throws - always returns a string.
	 */
	async format(code: string, language: EditorLanguage): Promise<string> {
		const outcome = await this.formatWithStatus(code, language)
		return outcome.formattedCode
	}

	/**
	 * Format code and return status information for UI messaging.
	 */
	async formatWithStatus(
		code: string,
		language: EditorLanguage,
	): Promise<{ formattedCode: string; error?: string }> {
		try {
			const formatter = this.getFormatter(language)

			if (!formatter) {
				return { formattedCode: code }
			}

			const request: FormatRequest = { code, language }
			const result = await formatter.format(request)

			if (result.error) {
				return {
					formattedCode: code,
					error: this.getFriendlyError(language, result.error),
				}
			}

			return { formattedCode: result.formattedCode }
		} catch (error) {
			logger.error(`Failed to format ${language}`, error)
			return {
				formattedCode: code,
				error: this.getFriendlyError(
					language,
					error instanceof Error ? error.message : 'Unknown formatter error',
				),
			}
		}
	}

	/**
	 * Format code with all registered formatters (for testing).
	 * Returns the first successful result.
	 */
	async formatWithFallback(
		code: string,
		language: EditorLanguage,
	): Promise<string> {
		// Try specific formatter first
		const specific = await this.format(code, language)
		if (specific !== code) {
			return specific
		}

		// Try fallback formatters
		for (const formatter of this.fallbackFormatters) {
			try {
				if (formatter.supports(language)) {
					const request: FormatRequest = { code, language }
					const result = await formatter.format(request)
					if (!result.error) {
						return result.formattedCode
					}
				}
			} catch {
				continue
			}
		}

		return code
	}

	/* ----------------------------------------------------------------------- */
	/* UTILITIES
	/* ----------------------------------------------------------------------- */

	/**
	 * Check if a language has a registered formatter.
	 */
	hasFormatter(language: EditorLanguage): boolean {
		return this.formatters.has(language)
	}

	// /**
	//  * Get all supported languages.
	//  */
	// getSupportedLanguages(): EditorLanguage[] {
	// 	return Array.from(this.formatters.keys())
	// }

	/**
	 * Clear all registered formatters (for testing).
	 */
	clear(): void {
		this.formatters.clear()
		this.fallbackFormatters = []
	}

	/* ----------------------------------------------------------------------- */
	/* PRIVATE
	/* ----------------------------------------------------------------------- */

	private getSupportedLanguages(formatter: CodeFormatter): EditorLanguage[] {
		// This is a simplification - in reality we'd need to test all languages
		// For now, we rely on the formatter to tell us what it supports
		const languages: EditorLanguage[] = []

		// Test a few common languages
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
 *
 * @example
 * ```tsx
 * import { formatCode } from '@/features/editor/formatter/formatter.registry'
 *
 * const formatted = await formatCode(code, language)
 * ```
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
