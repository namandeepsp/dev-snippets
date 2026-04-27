/**
 * API Response Types
 *
 * These types match the formatter service API contract
 * defined in code-formatter/api/models/responses.py
 */

export type ApiResponseBase = {
	success: boolean
	error?: string | null
	data?: unknown
}

export type FormatData = {
	formatted_code: string
}

export type FormatResponse = ApiResponseBase & {
	data?: FormatData | null
}

export type DetectData = {
	language: string | null
	confidence: string
}

export type DetectResponse = ApiResponseBase & {
	data?: DetectData | null
}

export type LanguagesData = {
	languages: string[]
}

export type LanguagesResponse = ApiResponseBase & {
	data?: LanguagesData | null
}

export type HealthData = {
	status: string
	formatters?: Record<string, string>
}

export type HealthResponse = ApiResponseBase & {
	data?: HealthData | null
}

/**
 * Validation Functions
 */

export function isFormatResponse(data: unknown): data is FormatResponse {
	if (!isApiResponseBase(data)) return false
	const response = data as FormatResponse
	if (response.success && response.data) {
		return (
			typeof response.data === 'object' &&
			response.data !== null &&
			'formatted_code' in response.data &&
			typeof (response.data as FormatData).formatted_code === 'string'
		)
	}
	return true
}

export function isDetectResponse(data: unknown): data is DetectResponse {
	if (!isApiResponseBase(data)) return false
	const response = data as DetectResponse
	if (response.success && response.data) {
		return (
			typeof response.data === 'object' &&
			response.data !== null &&
			'language' in response.data &&
			'confidence' in response.data &&
			(typeof (response.data as DetectData).language === 'string' ||
				(response.data as DetectData).language === null) &&
			typeof (response.data as DetectData).confidence === 'string'
		)
	}
	return true
}

export function isLanguagesResponse(data: unknown): data is LanguagesResponse {
	if (!isApiResponseBase(data)) return false
	const response = data as LanguagesResponse
	if (response.success && response.data) {
		return (
			typeof response.data === 'object' &&
			response.data !== null &&
			'languages' in response.data &&
			Array.isArray((response.data as LanguagesData).languages) &&
			(response.data as LanguagesData).languages.every(
				(lang) => typeof lang === 'string',
			)
		)
	}
	return true
}

export function isHealthResponse(data: unknown): data is HealthResponse {
	if (!isApiResponseBase(data)) return false
	const response = data as HealthResponse
	if (response.data) {
		return (
			typeof response.data === 'object' &&
			response.data !== null &&
			'status' in response.data &&
			typeof (response.data as HealthData).status === 'string'
		)
	}
	return true
}

function isApiResponseBase(data: unknown): data is ApiResponseBase {
	return (
		typeof data === 'object' &&
		data !== null &&
		'success' in data &&
		typeof (data as ApiResponseBase).success === 'boolean'
	)
}

/**
 * Error Messages
 */

export const ValidationErrors = {
	INVALID_RESPONSE_SHAPE: 'Response does not match expected shape',
	MISSING_SUCCESS_FIELD: 'Response missing required "success" field',
	INVALID_SUCCESS_TYPE: '"success" field must be boolean',
	MISSING_FORMATTED_CODE: 'Response missing required "formatted_code" field',
	INVALID_FORMATTED_CODE_TYPE: '"formatted_code" must be string',
	MISSING_LANGUAGE: 'Response missing required "language" field',
	MISSING_CONFIDENCE: 'Response missing required "confidence" field',
	INVALID_CONFIDENCE_TYPE: '"confidence" must be string',
	MISSING_LANGUAGES: 'Response missing required "languages" field',
	INVALID_LANGUAGES_TYPE: '"languages" must be array of strings',
	MISSING_STATUS: 'Response missing required "status" field',
	INVALID_STATUS_TYPE: '"status" must be string',
	INVALID_ERROR_TYPE: '"error" must be string or null',
	UNEXPECTED_FIELDS: 'Response contains unexpected fields',
	MALFORMED_JSON: 'Response is not valid JSON',
	EMPTY_RESPONSE: 'Response body is empty',
	INVALID_HTTP_STATUS: 'Invalid HTTP status code',
}
