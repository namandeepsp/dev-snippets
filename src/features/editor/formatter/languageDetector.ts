import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'
import { ApiDetector } from './api.detector'
import { HeuristicsDetector } from './heuristics.detector'
import { HighlightDetector } from './highlight.detector'

export class LanguageDetector {
	private heuristicsDetector = new HeuristicsDetector()
	private highlightDetector = new HighlightDetector()
	private apiDetector = new ApiDetector()

	async initialize(): Promise<void> {
		await this.apiDetector.loadApiBackedLanguages()
		await this.highlightDetector.initialize()
	}

	isApiBackedLanguage(language: EditorLanguage): boolean {
		return this.apiDetector.isApiBackedLanguage(language)
	}

	async detectLanguage(code: string): Promise<EditorLanguage | null> {
		const heuristic = this.heuristicsDetector.detectFromHeuristics(code)
		if (heuristic) return heuristic

		const highlight = this.highlightDetector.detectFromHighlight(code)
		if (highlight) return highlight

		return await this.apiDetector.detectFromApi(code)
	}

	async resolvePasteLanguage(
		code: string,
		currentLanguage: EditorLanguage,
		onLanguageDetected?: (language: EditorLanguage) => void,
	): Promise<EditorLanguage> {
		const shouldUseApiOnly = this.isApiBackedLanguage(currentLanguage)
		logger.info('🔍 resolvePasteLanguage:', {
			currentLanguage,
			isApiBackedLanguage: shouldUseApiOnly,
		})

		if (shouldUseApiOnly) {
			const apiDetected = await this.apiDetector.detectFromApi(code)
			logger.info('🔍 API-backed language, API detected:', apiDetected)

			if (apiDetected && apiDetected !== currentLanguage) {
				onLanguageDetected?.(apiDetected)
				return apiDetected
			}

			if (!apiDetected) {
				logger.info(
					'🔍 API detection failed, trying client-side detection as fallback',
				)
				const clientDetected = await this.detectLanguage(code)
				logger.info('🔍 Client-side fallback detected:', clientDetected)

				if (clientDetected && clientDetected !== currentLanguage) {
					if (!this.isApiBackedLanguage(clientDetected)) {
						logger.info('🔍 Accepting client-side fallback:', clientDetected)
						onLanguageDetected?.(clientDetected)
						return clientDetected
					}
				}
			}

			return currentLanguage
		}

		const clientDetected = await this.detectLanguage(code)
		logger.info('🔍 Client-side language, client detected:', clientDetected)
		if (clientDetected && clientDetected !== currentLanguage) {
			if (this.isApiBackedLanguage(clientDetected)) {
				const apiDetected = await this.apiDetector.detectFromApi(code)
				logger.info(
					'🔍 Detected API-backed language, API detected:',
					apiDetected,
				)
				if (apiDetected && apiDetected === clientDetected) {
					onLanguageDetected?.(clientDetected)
					return clientDetected
				} else if (apiDetected) {
					onLanguageDetected?.(apiDetected)
					return apiDetected
				}
			}

			const shouldAccept = this.shouldAcceptClientDetection(clientDetected)
			if (shouldAccept) {
				logger.info('🔍 Accepting client detection:', clientDetected)
				onLanguageDetected?.(clientDetected)
				return clientDetected
			}
		}

		logger.info('🔍 Returning current language:', currentLanguage)
		return currentLanguage
	}

	private shouldAcceptClientDetection(_language: EditorLanguage): boolean {
		return true
	}
}

export const languageDetector = new LanguageDetector()
