import type { EditorLanguage } from '../editor.config'

/**
 * ============================================================================
 * FORMATTER TYPES
 * ============================================================================
 *
 * Types for the code formatting system.
 * Following the Strategy pattern - each formatter is a separate strategy.
 */

/**
 * Request to format code.
 */
export type FormatRequest = {
	/** The raw code to format */
	code: string
	/** The programming language of the code */
	language: EditorLanguage
	/** Optional formatting options */
	options?: Record<string, unknown>
}

/**
 * Result of a formatting operation.
 */
export type FormatResult = {
	/** The formatted code */
	formattedCode: string
	/** Error message if formatting failed */
	error?: string
	/** Warning message if formatting was partial */
	warning?: string
	/** Performance metrics (for debugging) */
	metrics?: {
		duration: number
		inputSize: number
		outputSize: number
	}
}

/**
 * Code Formatter interface.
 * Implement this interface to add a new formatter.
 */
export interface CodeFormatter {
	/** Display name of the formatter */
	name: string

	/** Check if this formatter supports a language */
	supports(language: EditorLanguage): boolean

	/** Format the code */
	format(request: FormatRequest): Promise<FormatResult>

	/** Optional cleanup/dispose method */
	dispose?: () => void
}

export interface PrettierFormatter extends CodeFormatter {
	/** Get the Prettier parser name for a given language */
	getParser(language: EditorLanguage): string
}
