type FormatterServiceRequest = {
	path: string
	body?: unknown
	headers?: Record<string, string>
}

type FormatterServiceConfig = {
	baseUrl: string
	apiKey?: string
}

export class FormatterService {
	private getConfig(): FormatterServiceConfig {
		const baseUrl = process.env.FORMATTER_SERVICE_URL
		if (!baseUrl) {
			throw new Error('Formatter service is not configured')
		}

		return {
			baseUrl,
			apiKey: process.env.FORMATTER_SERVICE_API_KEY,
		}
	}

	private validateUrl(url: string): void {
		try {
			const parsed = new URL(url)
			const hostname = parsed.hostname

			// Allow localhost only in development
			const isDevelopment = process.env.NODE_ENV === 'development'
			if (isDevelopment && hostname === 'localhost') {
				return
			}

			// Block private IP ranges and localhost in production
			const blockedPatterns = [
				/^localhost$/i,
				/^127\./,
				/^192\.168\./,
				/^10\./,
				/^172\.(1[6-9]|2[0-9]|3[01])\./,
				/^169\.254\./,
				/^::1$/,
				/^fc00:/i,
				/^fe80:/i,
			]
			for (const pattern of blockedPatterns) {
				if (pattern.test(hostname)) {
					throw new Error(
						`Access to private IP range is not allowed: ${hostname}`,
					)
				}
			}
			// Only allow http and https protocols
			if (!['http:', 'https:'].includes(parsed.protocol)) {
				throw new Error(`Invalid protocol: ${parsed.protocol}`)
			}
		} catch (error) {
			if (error instanceof Error) {
				throw error
			}
			throw new Error('Invalid URL format')
		}
	}

	getUrl(path: string): string {
		const config = this.getConfig()
		const url = new URL(path, config.baseUrl).toString()
		this.validateUrl(url)
		return url
	}

	private async request(
		method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
		request: FormatterServiceRequest,
	): Promise<Response> {
		const config = this.getConfig()
		const { path, body, headers } = request
		const url = new URL(path, config.baseUrl).toString()
		this.validateUrl(url)
		const baseHeaders: Record<string, string> = {
			...(body ? { 'Content-Type': 'application/json' } : {}),
			...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
		}

		return fetch(url, {
			method,
			headers: {
				...baseHeaders,
				...(headers ?? {}),
			},
			body: body ? JSON.stringify(body) : undefined,
		})
	}

	get(request: FormatterServiceRequest): Promise<Response> {
		return this.request('GET', request)
	}

	post(request: FormatterServiceRequest): Promise<Response> {
		return this.request('POST', request)
	}

	put(request: FormatterServiceRequest): Promise<Response> {
		return this.request('PUT', request)
	}

	patch(request: FormatterServiceRequest): Promise<Response> {
		return this.request('PATCH', request)
	}

	delete(request: FormatterServiceRequest): Promise<Response> {
		return this.request('DELETE', request)
	}
}

export const formatterService = new FormatterService()
