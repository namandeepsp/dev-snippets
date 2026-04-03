import type { EditorLanguage } from '../editor.config'

export type UpstreamFormatterLanguage =
	| 'python'
	| 'django'
	| 'fastapi'
	| 'flask'
	| 'go'
	| 'golang'

export type FormatProxyRequest = {
	code: string
	language: EditorLanguage | UpstreamFormatterLanguage | string
}

export type UpstreamFormatRequest = {
	code: string
	language: UpstreamFormatterLanguage
}

export type UpstreamFormatSuccessResponse = {
	formatted_code: string
	success: true
	error: null
}

export type UpstreamFormatFailureResponse = {
	formatted_code: string
	success: false
	error: string
}

export type UpstreamFormatValidationErrorResponse = {
	formatted_code?: string
	success: false
	error: string
	details?: unknown[]
}

export type UpstreamFormatErrorResponse = {
	formatted_code?: string
	success: false
	error: string
}

export type UpstreamFormatResponse =
	| UpstreamFormatSuccessResponse
	| UpstreamFormatFailureResponse
	| UpstreamFormatValidationErrorResponse
	| UpstreamFormatErrorResponse

export type ProxyFormatResponse = {
	success: boolean
	error: string | null
	data: {
		formatted_code: string
	}
}

export type DetectProxyRequest = {
	code: string
}

export type UpstreamDetectResponse = {
	success: boolean
	error: string | null
	data: {
		language: string | null
		confidence: string
	} | null
}

export type DetectProxyResponse = {
	language: string | null
	confidence: string
	error: string | null
}

const PYTHON_ALIASES = new Set<string>(['python', 'django', 'fastapi', 'flask'])
const GO_ALIASES = new Set<string>([
	'go',
	'golang',
	'gin',
	'fiber',
	'echo',
	'beego',
	'revel',
])

export function normalizePythonLanguage(
	_language: unknown,
): UpstreamFormatterLanguage {
	return 'python'
}

export function isPythonFamilyLanguage(language: unknown): boolean {
	return (
		typeof language === 'string' && PYTHON_ALIASES.has(language.toLowerCase())
	)
}

export function normalizeGoLanguage(
	_language: unknown,
): UpstreamFormatterLanguage {
	return 'go'
}

export function isGoFamilyLanguage(language: unknown): boolean {
	return typeof language === 'string' && GO_ALIASES.has(language.toLowerCase())
}

export function normalizeJavaLanguage(_language: unknown): EditorLanguage {
	return 'java'
}

export function isJavaLanguage(language: unknown): boolean {
	return language === 'java'
}
