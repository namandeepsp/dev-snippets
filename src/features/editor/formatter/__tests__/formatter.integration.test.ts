import { FormatterService } from '@/shared/utils/formatterService'
import { beforeEach, describe, expect, it } from 'vitest'
import { ApiDetector } from '../api.detector'

/**
 * REAL INTEGRATION TESTS
 *
 * These tests call the ACTUAL formatter service in PRODUCTION
 * They are NOT mocked - they make real HTTP requests.
 *
 * Production Service: https://code-formatter-4uzi.onrender.com/
 *
 * Prerequisites:
 * - Production formatter service must be running and accessible
 * - Run with: pnpm test:formatter:real (uses .env.local)
 * - Or: set -a; . ./.env.prod; set +a; pnpm test:formatter:real (uses .env.prod)
 *
 * These tests verify:
 * - Real API connectivity to production service
 * - Actual formatting behavior
 * - Real error handling
 * - API contract compliance
 */

describe('Formatter Service - Real Integration Tests', () => {
	let service: FormatterService
	let detector: ApiDetector

	beforeEach(() => {
		service = new FormatterService()
		detector = new ApiDetector()
	})

	describe('Health Check', () => {
		it('should connect to production formatter service', async () => {
			try {
				const response = await service.get({
					path: '/api/format/health',
				})

				expect(response.status).toBeLessThan(500)
				const data = await response.json()
				expect(data).toBeDefined()
			} catch (error) {
				console.warn(
					'⚠️ Production formatter service not available at',
					process.env.FORMATTER_SERVICE_URL,
				)
				console.warn('Service URL:', process.env.FORMATTER_SERVICE_URL)
				console.warn('Expected: https://code-formatter-4uzi.onrender.com/')
				throw error
			}
		})
	})

	describe('Languages Endpoint', () => {
		it('should fetch supported languages from real API', async () => {
			const response = await service.get({
				path: '/api/format/languages',
			})

			expect(response.ok).toBe(true)
			const data = await response.json()
			expect(data.success).toBe(true)
			expect(Array.isArray(data.data.languages)).toBe(true)
			expect(data.data.languages.length).toBeGreaterThan(0)
		})

		it('should load API-backed languages into detector', async () => {
			await detector.loadApiBackedLanguages()

			expect(detector.isApiBackedLanguage('python')).toBe(true)
			expect(detector.isApiBackedLanguage('go')).toBe(true)
			expect(detector.isApiBackedLanguage('java')).toBe(true)
		})
	})

	describe('Format Endpoint - Python', () => {
		it('should format valid Python code', async () => {
			const code = 'def hello():print("world")'

			const response = await service.post({
				path: '/api/format',
				body: {
					code,
					language: 'python',
				},
			})

			expect(response.ok).toBe(true)
			const data = await response.json()
			expect(data.success).toBe(true)
			expect(data.data.formatted_code).toBeDefined()
			expect(data.data.formatted_code).toContain('def hello()')
		})

		it('should handle Python syntax errors', async () => {
			const code = 'def broken('

			const response = await service.post({
				path: '/api/format',
				body: {
					code,
					language: 'python',
				},
			})

			// API should return 200 with success: false for syntax errors
			expect(response.status).toBe(200)
			const data = await response.json()
			expect(data.success).toBe(false)
			expect(data.error).toBeDefined()
		})

		it('should format complex Python code', async () => {
			const code = `
def fibonacci(n):
    if n<=1:return n
    return fibonacci(n-1)+fibonacci(n-2)

result=[fibonacci(i) for i in range(10)]
print(result)
`.trim()

			const response = await service.post({
				path: '/api/format',
				body: {
					code,
					language: 'python',
				},
			})

			expect(response.ok).toBe(true)
			const data = await response.json()
			expect(data.success).toBe(true)
			expect(data.data.formatted_code).toBeDefined()
		})
	})

	describe('Format Endpoint - Go', () => {
		it('should format valid Go code', async () => {
			const code = 'package main\nfunc main(){println("hello")}'

			const response = await service.post({
				path: '/api/format',
				body: {
					code,
					language: 'go',
				},
			})

			expect(response.ok).toBe(true)
			const data = await response.json()
			expect(data.success).toBe(true)
			expect(data.data.formatted_code).toBeDefined()
			expect(data.data.formatted_code).toContain('package main')
		})

		it('should handle Go syntax errors', async () => {
			const code = 'package main\nfunc main() {'

			const response = await service.post({
				path: '/api/format',
				body: {
					code,
					language: 'go',
				},
			})

			expect(response.status).toBe(200)
			const data = await response.json()
			expect(data.success).toBe(false)
		})
	})

	describe('Format Endpoint - Java', () => {
		it('should format valid Java code', async () => {
			const code = 'public class Test{public static void main(String[] args){}}'

			const response = await service.post({
				path: '/api/format',
				body: {
					code,
					language: 'java',
				},
			})

			expect(response.ok).toBe(true)
			const data = await response.json()
			expect(data.success).toBe(true)
			expect(data.data.formatted_code).toBeDefined()
		})
	})

	describe('Detect Endpoint', () => {
		it('should detect Python code', async () => {
			const code = 'def hello():\n    print("world")'

			const response = await service.post({
				path: '/api/format/detect',
				body: { code },
			})

			expect(response.ok).toBe(true)
			const data = await response.json()
			expect(data.success).toBe(true)
			expect(data.data.language).toBe('python')
		})

		it('should detect Go code', async () => {
			const code = 'package main\nfunc main() {\n    println("hello")\n}'

			const response = await service.post({
				path: '/api/format/detect',
				body: { code },
			})

			expect(response.ok).toBe(true)
			const data = await response.json()
			expect(data.success).toBe(true)
			expect(data.data.language).toBe('go')
		})

		it('should detect Java code', async () => {
			const code =
				'public class Test {\n    public static void main(String[] args) {}\n}'

			const response = await service.post({
				path: '/api/format/detect',
				body: { code },
			})

			expect(response.ok).toBe(true)
			const data = await response.json()
			expect(data.success).toBe(true)
			expect(data.data.language).toBe('java')
		})

		it('should use ApiDetector to detect from API', async () => {
			const code = 'def test():\n    pass'

			const result = await detector.detectFromApi(code)

			expect(result).toBe('python')
		})

		it('should handle detection failure gracefully', async () => {
			const code = ';;;; !!!! ????'

			const result = await detector.detectFromApi(code)

			// Should return null if detection fails
			expect(result).toBeNull()
		})
	})

	describe('Error Handling', () => {
		it('should handle unsupported language', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: 'some code',
					language: 'unsupported-lang',
				},
			})

			expect(response.status).toBe(200)
			const data = await response.json()
			expect(data.success).toBe(false)
		})

		it('should handle empty code', async () => {
			const response = await service.post({
				path: '/api/format',
				body: {
					code: '',
					language: 'python',
				},
			})

			expect(response.status).toBe(200)
			const data = await response.json()
			expect(data.success).toBe(false)
		})

		it('should handle very large code', async () => {
			const largeCode = 'def test():\n    pass\n'.repeat(5000)

			const response = await service.post({
				path: '/api/format',
				body: {
					code: largeCode,
					language: 'python',
				},
			})

			// Should either succeed or fail gracefully
			expect(response.status).toBeLessThan(500)
			const data = await response.json()
			expect(data).toBeDefined()
		})

		it('should handle unicode characters', async () => {
			const code = 'def test():\n    print("héllo wörld 🌍")'

			const response = await service.post({
				path: '/api/format',
				body: {
					code,
					language: 'python',
				},
			})

			expect(response.ok).toBe(true)
			const data = await response.json()
			expect(data.success).toBe(true)
		})
	})

	describe('Performance', () => {
		it('should format code within reasonable time', async () => {
			const code = 'def test():\n    pass'
			const start = Date.now()

			await service.post({
				path: '/api/format',
				body: {
					code,
					language: 'python',
				},
			})

			const duration = Date.now() - start
			expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
		})
	})
})
