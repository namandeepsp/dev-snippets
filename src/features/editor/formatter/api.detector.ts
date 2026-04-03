import { formatterService } from '@/shared/utils/formatterService'
import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'
import { SUPPORTED_LANGUAGES } from '../editor.config'

/**
 * Backend API integration for language detection.
 * Handles API calls to detect language and fetch supported languages.
 */
export class ApiDetector {
	private apiBackedLanguages: EditorLanguage[] = []

	async loadApiBackedLanguages(): Promise<void> {
		try {
			const response = await formatterService.get({
				path: '/api/format/languages',
			})

			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`)
			}

			const data = await response.json()

			// Check if API returned success
			if (!data?.success) {
				throw new Error(data?.error || 'API returned success: false')
			}

			const apiLanguages: string[] = data?.data?.languages || []

			if (!Array.isArray(apiLanguages) || apiLanguages.length === 0) {
				throw new Error('No languages returned from API')
			}

			const validatedLanguages = apiLanguages.filter(
				(lang): lang is EditorLanguage =>
					SUPPORTED_LANGUAGES.includes(lang as EditorLanguage),
			)

			if (validatedLanguages.length === 0) {
				throw new Error('No valid languages returned from API')
			}

			this.apiBackedLanguages = validatedLanguages
		} catch (error) {
			logger.warn('Failed to load API-backed languages, using fallback', error)
			this.apiBackedLanguages = ['go', 'java', 'python']
		}
	}

	isApiBackedLanguage(language: EditorLanguage): boolean {
		return this.apiBackedLanguages.includes(language)
	}

	async detectFromApi(code: string): Promise<EditorLanguage | null> {
		try {
			const response = await formatterService.post({
				path: '/api/format/detect',
				body: { code },
			})

			if (!response.ok) {
				logger.info('🔍 API detect failed: response not ok')
				return null
			}

			const data = await response.json()
			logger.info('🔍 API detect response:', data)

			// Check success flag
			if (!data?.success) {
				logger.info('🔍 API detect failed: success flag false')
				return null
			}

			// Extract language from correct path: data.data.language
			const detected =
				typeof data?.data?.language === 'string'
					? data.data.language.toLowerCase()
					: null

			logger.info('🔍 API detect extracted language:', detected)

			return detected &&
				SUPPORTED_LANGUAGES.includes(detected as EditorLanguage)
				? (detected as EditorLanguage)
				: null
		} catch (error) {
			logger.info('🔍 API detect error:', error)
			return null
		}
	}
}
