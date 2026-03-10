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

	getUrl(path: string): string {
		const config = this.getConfig()
		return new URL(path, config.baseUrl).toString()
	}

	private async request(
		method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
		request: FormatterServiceRequest,
	): Promise<Response> {
		const config = this.getConfig()
		const { path, body, headers } = request
		const url = new URL(path, config.baseUrl).toString()
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
