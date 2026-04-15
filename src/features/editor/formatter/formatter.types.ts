import type { EditorLanguage } from '../editor.config'

export type FormatRequest = {
	code: string
	language: EditorLanguage
	options?: Record<string, unknown>
}

export type FormatResult = {
	formattedCode: string
	error?: string
	warning?: string
	metrics?: {
		duration: number
		inputSize: number
		outputSize: number
	}
}

export interface CodeFormatter {
	name: string

	supports(language: EditorLanguage): boolean

	format(request: FormatRequest): Promise<FormatResult>

	dispose?: () => void
}

export interface PrettierFormatter extends CodeFormatter {
	getParser(language: EditorLanguage): string
}
