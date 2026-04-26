import { FormatterService } from '@/shared/utils/formatterService'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('FormatterService', () => {
	let service: FormatterService
	let fetchMock: ReturnType<typeof vi.fn>

	beforeEach(() => {
		service = new FormatterService()
		fetchMock = vi.fn()
		global.fetch = fetchMock as unknown as typeof fetch
		vi.clearAllMocks()
	})

	afterEach(() => {
		delete process.env.FORMATTER_SERVICE_URL
		delete process.env.NEXT_PUBLIC_FORMATTER_SERVICE_URL
		delete process.env.FORMATTER_SERVICE_API_KEY
		delete process.env.NEXT_PUBLIC_FORMATTER_SERVICE_API_KEY
		vi.unstubAllEnvs()
	})

	describe('Configuration', () => {
		it('should use FORMATTER_SERVICE_URL from environment', () => {
			process.env.FORMATTER_SERVICE_URL = 'https://formatter.example.com'
			const url = service.getUrl('/api/format')
			expect(url).toBe('https://formatter.example.com/api/format')
		})

		it('should use NEXT_PUBLIC_FORMATTER_SERVICE_URL as fallback', () => {
			delete process.env.FORMATTER_SERVICE_URL
			process.env.NEXT_PUBLIC_FORMATTER_SERVICE_URL =
				'https://public-formatter.example.com'
			const url = service.getUrl('/api/format')
			expect(url).toBe('https://public-formatter.example.com/api/format')
		})

		it('should throw error if no formatter URL is configured', () => {
			delete process.env.FORMATTER_SERVICE_URL
			delete process.env.NEXT_PUBLIC_FORMATTER_SERVICE_URL
			expect(() => service.getUrl('/api/format')).toThrow(
				'Formatter service is not configured',
			)
		})
	})

	describe('URL Validation', () => {
		beforeEach(() => {
			process.env.FORMATTER_SERVICE_URL = 'https://formatter.example.com'
		})

		it('should allow valid HTTPS URLs', () => {
			const url = service.getUrl('/api/format')
			expect(url).toBe('https://formatter.example.com/api/format')
		})

		it('should allow valid HTTP URLs', () => {
			process.env.FORMATTER_SERVICE_URL = 'http://formatter.example.com'
			const url = service.getUrl('/api/format')
			expect(url).toBe('http://formatter.example.com/api/format')
		})

		it('should allow localhost in development', () => {
			vi.stubEnv('NODE_ENV', 'development')
			vi.stubEnv('FORMATTER_SERVICE_URL', 'http://localhost:8000')
			const url = service.getUrl('/api/format')
			expect(url).toBe('http://localhost:8000/api/format')
		})

		it('should block private IP ranges in production', () => {
			vi.stubEnv('NODE_ENV', 'production')
			vi.stubEnv('FORMATTER_SERVICE_URL', 'http://192.168.1.1:8000')
			expect(() => service.getUrl('/api/format')).toThrow(
				'Access to private IP range is not allowed',
			)
		})

		it('should block 127.0.0.1 in production', () => {
			vi.stubEnv('NODE_ENV', 'production')
			vi.stubEnv('FORMATTER_SERVICE_URL', 'http://127.0.0.1:8000')
			expect(() => service.getUrl('/api/format')).toThrow(
				'Access to private IP range is not allowed',
			)
		})

		it('should reject invalid protocols', () => {
			process.env.FORMATTER_SERVICE_URL = 'ftp://formatter.example.com'
			expect(() => service.getUrl('/api/format')).toThrow('Invalid protocol')
		})
	})

	describe('HTTP Methods', () => {
		beforeEach(() => {
			process.env.FORMATTER_SERVICE_URL = 'https://formatter.example.com'
			fetchMock.mockResolvedValue(
				new Response(JSON.stringify({ success: true }), { status: 200 }),
			)
		})

		it('should make GET requests', async () => {
			await service.get({ path: '/api/format/languages' })
			expect(fetchMock).toHaveBeenCalledWith(
				'https://formatter.example.com/api/format/languages',
				expect.objectContaining({ method: 'GET' }),
			)
		})

		it('should make POST requests with body', async () => {
			const body = { code: 'def test(): pass', language: 'python' }
			await service.post({ path: '/api/format', body })
			expect(fetchMock).toHaveBeenCalledWith(
				'https://formatter.example.com/api/format',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(body),
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
					}),
				}),
			)
		})

		it('should make PUT requests', async () => {
			const body = { code: 'updated code' }
			await service.put({ path: '/api/format', body })
			expect(fetchMock).toHaveBeenCalledWith(
				'https://formatter.example.com/api/format',
				expect.objectContaining({ method: 'PUT' }),
			)
		})

		it('should make PATCH requests', async () => {
			const body = { code: 'patched code' }
			await service.patch({ path: '/api/format', body })
			expect(fetchMock).toHaveBeenCalledWith(
				'https://formatter.example.com/api/format',
				expect.objectContaining({ method: 'PATCH' }),
			)
		})

		it('should make DELETE requests', async () => {
			await service.delete({ path: '/api/format/123' })
			expect(fetchMock).toHaveBeenCalledWith(
				'https://formatter.example.com/api/format/123',
				expect.objectContaining({ method: 'DELETE' }),
			)
		})
	})

	describe('Headers', () => {
		beforeEach(() => {
			process.env.FORMATTER_SERVICE_URL = 'https://formatter.example.com'
			fetchMock.mockResolvedValue(
				new Response(JSON.stringify({ success: true }), { status: 200 }),
			)
		})

		it('should include Content-Type header for POST requests with body', async () => {
			await service.post({ path: '/api/format', body: { code: 'test' } })
			expect(fetchMock).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
					}),
				}),
			)
		})

		it('should include API key header if configured', async () => {
			vi.stubEnv('FORMATTER_SERVICE_API_KEY', 'test-api-key')
			await service.get({ path: '/api/format/languages' })
			expect(fetchMock).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						'X-API-Key': 'test-api-key',
					}),
				}),
			)
		})

		it('should merge custom headers with default headers', async () => {
			await service.post({
				path: '/api/format',
				body: { code: 'test' },
				headers: { 'X-Custom-Header': 'custom-value' },
			})
			expect(fetchMock).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
						'X-Custom-Header': 'custom-value',
					}),
				}),
			)
		})

		it('should not include Content-Type for GET requests', async () => {
			await service.get({ path: '/api/format/languages' })
			const callArgs = fetchMock.mock.calls[0][1]
			expect(callArgs.headers['Content-Type']).toBeUndefined()
		})
	})

	describe('Error Handling', () => {
		beforeEach(() => {
			process.env.FORMATTER_SERVICE_URL = 'https://formatter.example.com'
		})

		it('should handle network errors', async () => {
			fetchMock.mockRejectedValue(new Error('Network error'))
			await expect(
				service.get({ path: '/api/format/languages' }),
			).rejects.toThrow('Network error')
		})

		it('should return response even on HTTP error status', async () => {
			fetchMock.mockResolvedValue(
				new Response(JSON.stringify({ error: 'Not found' }), { status: 404 }),
			)
			const response = await service.get({ path: '/api/format/invalid' })
			expect(response.status).toBe(404)
		})

		it('should handle malformed URLs gracefully', () => {
			process.env.FORMATTER_SERVICE_URL = 'https://formatter.example.com'
			expect(() => service.getUrl('ftp://invalid')).toThrow()
		})
	})

	describe('URL Construction', () => {
		beforeEach(() => {
			process.env.FORMATTER_SERVICE_URL = 'https://formatter.example.com'
		})

		it('should properly construct URLs with paths', () => {
			const url = service.getUrl('/api/format')
			expect(url).toBe('https://formatter.example.com/api/format')
		})

		it('should handle trailing slashes', () => {
			process.env.FORMATTER_SERVICE_URL = 'https://formatter.example.com/'
			const url = service.getUrl('/api/format')
			expect(url).toBe('https://formatter.example.com/api/format')
		})

		it('should handle query parameters', () => {
			const url = service.getUrl('/api/format?language=python')
			expect(url).toBe(
				'https://formatter.example.com/api/format?language=python',
			)
		})
	})
})
