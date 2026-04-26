import { FormatterService } from '@/shared/utils/formatterService'
import { beforeEach, describe, expect, it } from 'vitest'
import {
	type DetectResponse,
	type FormatResponse,
	type LanguagesResponse,
	isDetectResponse,
	isFormatResponse,
	isHealthResponse,
	isLanguagesResponse,
} from '../api.types'

/**
 * API CONTRACT & RESPONSE VALIDATION TESTS
 *
 * These tests verify that the formatter service API responses
 * match the expected contract defined in api.types.ts
 *
 * Tests cover:
 * - Response shape validation
 * - Required fields validation
 * - Data type validation
 * - Error response validation
 * - Edge cases and malformed responses
 */

describe('Formatter API Contract Validation', () => {
	let service: FormatterService

	beforeEach(() => {
		service = new FormatterService()
	})

	describe('Format Endpoint Response Contract', () => {
		it('should return valid FormatResponse for successful formatting', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: 'def test(): pass',
					language: 'python',
				},
			})

			const data = await response.json()
			expect(isFormatResponse(data)).toBe(true)
			expect(data.success).toBe(true)
			expect(data.error).toBeUndefined()
			expect(data.data).toBeDefined()
			expect(data.data?.formatted_code).toBeDefined()
			expect(typeof data.data?.formatted_code).toBe('string')
		})

		it('should return valid FormatResponse for syntax errors', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: 'def broken(',
					language: 'python',
				},
			})

			const data = await response.json()
			expect(isFormatResponse(data)).toBe(true)
			expect(data.success).toBe(false)
			expect(data.error).toBeDefined()
			expect(typeof data.error).toBe('string')
			expect(data.data).toBeUndefined()
		})

		it('should have success field as boolean', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: 'def test(): pass',
					language: 'python',
				},
			})

			const data = await response.json()
			expect(typeof data.success).toBe('boolean')
		})

		it('should have error field as string or undefined', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: 'def test(): pass',
					language: 'python',
				},
			})

			const data = await response.json()
			if (data.error !== undefined) {
				expect(typeof data.error).toBe('string')
			}
		})

		it('should have formatted_code as string when success is true', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: 'def test(): pass',
					language: 'python',
				},
			})

			const data = await response.json()
			if (data.success) {
				expect(data.data).toBeDefined()
				expect(typeof data.data?.formatted_code).toBe('string')
				expect(data.data?.formatted_code.length).toBeGreaterThan(0)
			}
		})

		it('should not have data field when success is false', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: 'def broken(',
					language: 'python',
				},
			})

			const data = await response.json()
			if (!data.success) {
				expect(data.data).toBeUndefined()
			}
		})

		it('should handle empty code gracefully', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: '',
					language: 'python',
				},
			})

			const data = await response.json()
			expect(isFormatResponse(data)).toBe(true)
			expect(typeof data.success).toBe('boolean')
		})

		it('should handle unsupported language gracefully', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: 'some code',
					language: 'unsupported-lang',
				},
			})

			const data = await response.json()
			expect(isFormatResponse(data)).toBe(true)
			expect(data.success).toBe(false)
			expect(data.error).toBeDefined()
		})

		it('should handle null code gracefully', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: null,
					language: 'python',
				},
			})

			expect(response.status).toBeLessThan(500)
			const data = await response.json()
			expect(typeof data.success).toBe('boolean')
		})

		it('should handle missing language parameter', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: 'def test(): pass',
				},
			})

			expect(response.status).toBeLessThan(500)
			const data = await response.json()
			expect(typeof data.success).toBe('boolean')
		})
	})

	describe('Detect Endpoint Response Contract', () => {
		it('should return valid DetectResponse for successful detection', async () => {
			const response = await service.post({
				path: '/api/format/detect',
				body: { code: 'def test():\n    pass' },
			})

			const data = await response.json()
			expect(isDetectResponse(data)).toBe(true)
			expect(data.success).toBe(true)
			expect(data.data).toBeDefined()
			expect(data.data?.language).toBeDefined()
			expect(data.data?.confidence).toBeDefined()
			expect(typeof data.data?.confidence).toBe('string')
		})

		it('should return valid DetectResponse for detection failure', async () => {
			const response = await service.post({
				path: '/api/format/detect',
				body: { code: ';;;; !!!!' },
			})

			const data = await response.json()
			expect(isDetectResponse(data)).toBe(true)
			expect(typeof data.success).toBe('boolean')
		})

		it('should have language field as string or null', async () => {
			const response = await service.post({
				path: '/api/format/detect',
				body: { code: 'def test():\n    pass' },
			})

			const data = await response.json()
			if (data.success && data.data) {
				expect(
					typeof data.data.language === 'string' || data.data.language === null,
				).toBe(true)
			}
		})

		it('should have confidence field as string', async () => {
			const response = await service.post({
				path: '/api/format/detect',
				body: { code: 'def test():\n    pass' },
			})

			const data = await response.json()
			if (data.success && data.data) {
				expect(typeof data.data.confidence).toBe('string')
				expect(['high', 'medium', 'low'].includes(data.data.confidence)).toBe(
					true,
				)
			}
		})

		it('should handle empty code gracefully', async () => {
			const response = await service.post({
				path: '/api/format/detect',
				body: { code: '' },
			})

			const data = await response.json()
			expect(isDetectResponse(data)).toBe(true)
		})

		it('should handle null code gracefully', async () => {
			const response = await service.post({
				path: '/api/format/detect',
				body: { code: null },
			})

			expect(response.status).toBeLessThan(500)
			const data = await response.json()
			expect(typeof data.success).toBe('boolean')
		})

		it('should handle whitespace-only code', async () => {
			const response = await service.post({
				path: '/api/format/detect',
				body: { code: '   \n\t\n   ' },
			})

			const data = await response.json()
			expect(isDetectResponse(data)).toBe(true)
		})
	})

	describe('Languages Endpoint Response Contract', () => {
		it('should return valid LanguagesResponse', async () => {
			const response = await service.get({
				path: '/api/format/languages',
			})

			const data = await response.json()
			expect(isLanguagesResponse(data)).toBe(true)
			expect(data.success).toBe(true)
			expect(data.data).toBeDefined()
			expect(Array.isArray(data.data?.languages)).toBe(true)
		})

		it('should have languages as array of strings', async () => {
			const response = await service.get({
				path: '/api/format/languages',
			})

			const data = await response.json()
			expect(Array.isArray(data.data?.languages)).toBe(true)
			expect(
				data.data?.languages.every((lang: unknown) => typeof lang === 'string'),
			).toBe(true)
		})

		it('should have at least one language', async () => {
			const response = await service.get({
				path: '/api/format/languages',
			})

			const data = await response.json()
			expect(data.data?.languages.length).toBeGreaterThan(0)
		})

		it('should include python, go, and java', async () => {
			const response = await service.get({
				path: '/api/format/languages',
			})

			const data = await response.json()
			const languages = data.data?.languages || []
			expect(languages).toContain('python')
			expect(languages).toContain('go')
			expect(languages).toContain('java')
		})

		it('should not have error field when successful', async () => {
			const response = await service.get({
				path: '/api/format/languages',
			})

			const data = await response.json()
			expect(data.error).toBeUndefined()
		})
	})

	describe('Health Endpoint Response Contract', () => {
		it('should return valid HealthResponse', async () => {
			const response = await service.get({
				path: '/api/format/health',
			})

			const data = await response.json()
			expect(isHealthResponse(data)).toBe(true)
			expect(data.data).toBeDefined()
			expect(data.data?.status).toBeDefined()
			expect(typeof data.data?.status).toBe('string')
		})

		it('should have status field as string', async () => {
			const response = await service.get({
				path: '/api/format/health',
			})

			const data = await response.json()
			expect(typeof data.data?.status).toBe('string')
			expect(
				['healthy', 'degraded', 'unhealthy'].includes(data.data?.status),
			).toBe(true)
		})

		it('should have formatters object if present', async () => {
			const response = await service.get({
				path: '/api/format/health',
			})

			const data = await response.json()
			if (data.data?.formatters) {
				expect(typeof data.data.formatters).toBe('object')
				expect(data.data.formatters).not.toBeNull()
			}
		})
	})

	describe('Error Response Contract', () => {
		it('should return error field as string for validation errors', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: 'def broken(',
					language: 'python',
				},
			})

			const data = await response.json()
			if (!data.success) {
				expect(data.error).toBeDefined()
				expect(typeof data.error).toBe('string')
				expect(data.error.length).toBeGreaterThan(0)
			}
		})

		it('should not have data field when error occurs', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: 'def broken(',
					language: 'python',
				},
			})

			const data = await response.json()
			if (!data.success) {
				expect(data.data).toBeUndefined()
			}
		})

		it('should handle 4xx errors gracefully', async () => {
			const response = await service.post({
				path: '/api/format/invalid-endpoint',
				body: {},
			})

			expect(response.status).toBeGreaterThanOrEqual(400)
			expect(response.status).toBeLessThan(500)
		})

		it('should handle 5xx errors gracefully', async () => {
			const response = await service.get({
				path: '/api/format/invalid-endpoint',
			})

			expect(response.status).toBeGreaterThanOrEqual(400)
		})
	})

	describe('Response Type Guards', () => {
		it('isFormatResponse should validate correct format response', () => {
			const validResponse: FormatResponse = {
				success: true,
				data: {
					formatted_code: 'def test():\n    pass',
				},
			}
			expect(isFormatResponse(validResponse)).toBe(true)
		})

		it('isFormatResponse should reject invalid format response', () => {
			const invalidResponse = {
				success: true,
				data: {
					wrong_field: 'value',
				},
			}
			expect(isFormatResponse(invalidResponse)).toBe(false)
		})

		it('isDetectResponse should validate correct detect response', () => {
			const validResponse: DetectResponse = {
				success: true,
				data: {
					language: 'python',
					confidence: 'high',
				},
			}
			expect(isDetectResponse(validResponse)).toBe(true)
		})

		it('isDetectResponse should accept null language', () => {
			const validResponse: DetectResponse = {
				success: true,
				data: {
					language: null,
					confidence: 'low',
				},
			}
			expect(isDetectResponse(validResponse)).toBe(true)
		})

		it('isLanguagesResponse should validate correct languages response', () => {
			const validResponse: LanguagesResponse = {
				success: true,
				data: {
					languages: ['python', 'go', 'java'],
				},
			}
			expect(isLanguagesResponse(validResponse)).toBe(true)
		})

		it('isLanguagesResponse should reject non-array languages', () => {
			const invalidResponse = {
				success: true,
				data: {
					languages: 'python,go,java',
				},
			}
			expect(isLanguagesResponse(invalidResponse)).toBe(false)
		})
	})

	describe('Response Consistency', () => {
		it('should return consistent response structure across multiple calls', async () => {
			const responses = await Promise.all([
				service.post({
					path: '/api/format',
					body: { code: 'def test(): pass', language: 'python' },
				}),
				service.post({
					path: '/api/format',
					body: { code: 'def test(): pass', language: 'python' },
				}),
				service.post({
					path: '/api/format',
					body: { code: 'def test(): pass', language: 'python' },
				}),
			])

			const dataArray = await Promise.all(responses.map((r) => r.json()))

			dataArray.forEach((data) => {
				expect(isFormatResponse(data)).toBe(true)
				expect(typeof data.success).toBe('boolean')
				if (data.success) {
					expect(typeof data.data?.formatted_code).toBe('string')
				}
			})
		})

		it('should maintain response contract across different languages', async () => {
			const languages = ['python', 'go', 'java']
			const codes = [
				'def test(): pass',
				'package main\nfunc main() {}',
				'public class Test {}',
			]

			const responses = await Promise.all(
				languages.map((lang, i) =>
					service.post({
						path: '/api/format',
						body: { code: codes[i], language: lang },
					}),
				),
			)

			const dataArray = await Promise.all(responses.map((r) => r.json()))

			dataArray.forEach((data) => {
				expect(isFormatResponse(data)).toBe(true)
			})
		})
	})
})
