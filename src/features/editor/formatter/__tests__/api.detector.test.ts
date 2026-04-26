import type { EditorLanguage } from '@/features/editor/editor.config'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiDetector } from '../api.detector'

vi.mock('@/shared/utils/formatterService', () => ({
	formatterService: {
		get: vi.fn(),
		post: vi.fn(),
	},
}))

vi.mock('@/shared/utils/logger', () => ({
	logger: {
		warn: vi.fn(),
		info: vi.fn(),
	},
}))

import { formatterService } from '@/shared/utils/formatterService'
import { logger } from '@/shared/utils/logger'

describe('ApiDetector', () => {
	let detector: ApiDetector

	beforeEach(() => {
		detector = new ApiDetector()
		vi.clearAllMocks()
	})

	describe('loadApiBackedLanguages', () => {
		it('should load supported languages from API', async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: true,
					data: {
						languages: ['python', 'go', 'java'],
					},
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.get).mockResolvedValue(mockResponse)

			await detector.loadApiBackedLanguages()

			expect(formatterService.get).toHaveBeenCalledWith({
				path: '/api/format/languages',
			})
			expect(detector.isApiBackedLanguage('python')).toBe(true)
			expect(detector.isApiBackedLanguage('go')).toBe(true)
			expect(detector.isApiBackedLanguage('java')).toBe(true)
		})

		it('should filter out unsupported languages', async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: true,
					data: {
						languages: [
							'python',
							'go',
							'java',
							'unsupported-lang',
							'another-unsupported',
						],
					},
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.get).mockResolvedValue(mockResponse)

			await detector.loadApiBackedLanguages()

			expect(detector.isApiBackedLanguage('python')).toBe(true)
			expect(detector.isApiBackedLanguage('go')).toBe(true)
			expect(detector.isApiBackedLanguage('java')).toBe(true)
			expect(
				detector.isApiBackedLanguage('unsupported-lang' as EditorLanguage),
			).toBe(false)
			expect(
				detector.isApiBackedLanguage('another-unsupported' as EditorLanguage),
			).toBe(false)
		})

		it('should use fallback languages on API failure', async () => {
			vi.mocked(formatterService.get).mockRejectedValue(
				new Error('API request failed'),
			)

			await detector.loadApiBackedLanguages()

			expect(logger.warn).toHaveBeenCalled()
			expect(detector.isApiBackedLanguage('python')).toBe(true)
			expect(detector.isApiBackedLanguage('go')).toBe(true)
			expect(detector.isApiBackedLanguage('java')).toBe(true)
		})

		it('should use fallback languages when API returns success: false', async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: false,
					error: 'Service unavailable',
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.get).mockResolvedValue(mockResponse)

			await detector.loadApiBackedLanguages()

			expect(logger.warn).toHaveBeenCalled()
			expect(detector.isApiBackedLanguage('python')).toBe(true)
		})

		it('should use fallback languages when API returns empty languages', async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: true,
					data: {
						languages: [],
					},
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.get).mockResolvedValue(mockResponse)

			await detector.loadApiBackedLanguages()

			expect(logger.warn).toHaveBeenCalled()
			expect(detector.isApiBackedLanguage('python')).toBe(true)
		})

		it('should use fallback languages when API returns non-array languages', async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: true,
					data: {
						languages: 'not-an-array',
					},
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.get).mockResolvedValue(mockResponse)

			await detector.loadApiBackedLanguages()

			expect(logger.warn).toHaveBeenCalled()
			expect(detector.isApiBackedLanguage('python')).toBe(true)
		})

		it('should handle HTTP error responses', async () => {
			const mockResponse = new Response(
				JSON.stringify({ error: 'Not found' }),
				{ status: 404 },
			)

			vi.mocked(formatterService.get).mockResolvedValue(mockResponse)

			await detector.loadApiBackedLanguages()

			expect(logger.warn).toHaveBeenCalled()
			expect(detector.isApiBackedLanguage('python')).toBe(true)
		})
	})

	describe('isApiBackedLanguage', () => {
		beforeEach(async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: true,
					data: {
						languages: ['python', 'go', 'java'],
					},
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.get).mockResolvedValue(mockResponse)
			await detector.loadApiBackedLanguages()
		})

		it('should return true for supported languages', () => {
			expect(detector.isApiBackedLanguage('python')).toBe(true)
			expect(detector.isApiBackedLanguage('go')).toBe(true)
			expect(detector.isApiBackedLanguage('java')).toBe(true)
		})

		it('should return false for unsupported languages', () => {
			expect(detector.isApiBackedLanguage('javascript')).toBe(false)
			expect(detector.isApiBackedLanguage('typescript')).toBe(false)
			expect(detector.isApiBackedLanguage('rust')).toBe(false)
		})
	})

	describe('detectFromApi', () => {
		it('should detect language from code', async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: true,
					data: {
						language: 'python',
						confidence: 'high',
					},
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.post).mockResolvedValue(mockResponse)

			const result = await detector.detectFromApi('def hello(): pass')

			expect(formatterService.post).toHaveBeenCalledWith({
				path: '/api/format/detect',
				body: { code: 'def hello(): pass' },
			})
			expect(result).toBe('python')
		})

		it('should return null when API returns success: false', async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: false,
					error: 'Could not detect language',
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.post).mockResolvedValue(mockResponse)

			const result = await detector.detectFromApi('unknown code')

			expect(result).toBeNull()
		})

		it('should return null when response is not ok', async () => {
			const mockResponse = new Response(
				JSON.stringify({ error: 'Server error' }),
				{ status: 500 },
			)

			vi.mocked(formatterService.post).mockResolvedValue(mockResponse)

			const result = await detector.detectFromApi('some code')

			expect(result).toBeNull()
		})

		it('should return null when API throws error', async () => {
			vi.mocked(formatterService.post).mockRejectedValue(
				new Error('Network error'),
			)

			const result = await detector.detectFromApi('some code')

			expect(result).toBeNull()
		})

		it('should return null for unsupported detected language', async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: true,
					data: {
						language: 'unsupported-lang',
						confidence: 'low',
					},
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.post).mockResolvedValue(mockResponse)

			const result = await detector.detectFromApi('some code')

			expect(result).toBeNull()
		})

		it('should handle case-insensitive language detection', async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: true,
					data: {
						language: 'PYTHON',
						confidence: 'high',
					},
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.post).mockResolvedValue(mockResponse)

			const result = await detector.detectFromApi('def hello(): pass')

			expect(result).toBe('python')
		})

		it('should return null when language data is missing', async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: true,
					data: {
						confidence: 'high',
					},
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.post).mockResolvedValue(mockResponse)

			const result = await detector.detectFromApi('some code')

			expect(result).toBeNull()
		})

		it('should return null when data is null', async () => {
			const mockResponse = new Response(
				JSON.stringify({
					success: true,
					data: null,
				}),
				{ status: 200 },
			)

			vi.mocked(formatterService.post).mockResolvedValue(mockResponse)

			const result = await detector.detectFromApi('some code')

			expect(result).toBeNull()
		})
	})
})
