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
		try {
			const formatter = this.getFormatter(language)

			if (!formatter) {
				return code
			}

			const request: FormatRequest = { code, language }
			const result = await formatter.format(request)

			return result.error ? code : result.formattedCode
		} catch (error) {
			console.error(`[Formatter] Failed to format ${language}:`, error)
			return code
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
}

// Singleton instance
export const formatterRegistry = new FormatterRegistry()

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
	return formatterRegistry.format(code, language)
}
