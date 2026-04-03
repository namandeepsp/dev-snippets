import {
	type FormatProxyRequest,
	type ProxyFormatResponse,
	type UpstreamFormatResponse,
	isPythonFamilyLanguage,
	normalizePythonLanguage,
} from '@/features/editor/formatter/formatter.api.types'
import { formatterService } from '@/shared/utils/formatterService'
import { logger } from '@/shared/utils/logger'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as Partial<FormatProxyRequest>
		const code = typeof body.code === 'string' ? body.code : ''
		const incomingLanguage = body.language

		if (!code.trim()) {
			return NextResponse.json<ProxyFormatResponse>(
				{
					success: false,
					error: 'Code is required',
					data: {
						formatted_code: code,
					},
				},
				{ status: 400 },
			)
		}

		if (
			typeof incomingLanguage !== 'undefined' &&
			!isPythonFamilyLanguage(incomingLanguage)
		) {
			return NextResponse.json<ProxyFormatResponse>(
				{
					success: false,
					error: `Unsupported language for python route: ${String(incomingLanguage)}`,
					data: {
						formatted_code: code,
					},
				},
				{ status: 400 },
			)
		}

		if (!process.env.FORMATTER_SERVICE_URL) {
			return NextResponse.json<ProxyFormatResponse>(
				{
					success: false,
					error: 'Formatter service is not configured',
					data: {
						formatted_code: code,
					},
				},
				{ status: 500 },
			)
		}

		const response = await formatterService.post({
			path: '/api/format',
			body: {
				code,
				language: normalizePythonLanguage(incomingLanguage),
			},
		})

		const payload = (await response
			.json()
			.catch(() => ({}))) as Partial<UpstreamFormatResponse>
		const upstreamFormattedCode =
			typeof payload.formatted_code === 'string' ? payload.formatted_code : code
		const upstreamError =
			typeof payload.error === 'string'
				? payload.error
				: 'Python formatting failed'
		const upstreamSuccess = payload.success === true

		if (!response.ok) {
			return NextResponse.json<ProxyFormatResponse>(
				{
					success: false,
					error: upstreamError,
					data: {
						formatted_code: upstreamFormattedCode,
					},
				},
				{ status: response.status },
			)
		}

		return NextResponse.json<ProxyFormatResponse>({
			success: upstreamSuccess,
			error: upstreamSuccess ? null : upstreamError,
			data: {
				formatted_code: upstreamFormattedCode,
			},
		})
	} catch (error) {
		logger.error('Python formatting API route failed', error)
		return NextResponse.json<ProxyFormatResponse>(
			{
				success: false,
				error: 'Failed to format Python code',
				data: {
					formatted_code: '',
				},
			},
			{ status: 500 },
		)
	}
}
