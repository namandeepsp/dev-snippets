import {
	type FormatProxyRequest,
	type ProxyFormatResponse,
	type UpstreamFormatResponse,
	isJavaLanguage,
	normalizeJavaLanguage,
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
					formattedCode: code,
					success: false,
					error: 'Code is required',
				},
				{ status: 400 },
			)
		}

		if (
			typeof incomingLanguage !== 'undefined' &&
			!isJavaLanguage(incomingLanguage)
		) {
			return NextResponse.json<ProxyFormatResponse>(
				{
					formattedCode: code,
					success: false,
					error: `Unsupported language for java route: ${String(incomingLanguage)}`,
				},
				{ status: 400 },
			)
		}

		if (!process.env.FORMATTER_SERVICE_URL) {
			return NextResponse.json<ProxyFormatResponse>(
				{
					formattedCode: code,
					success: false,
					error: 'Formatter service is not configured',
				},
				{ status: 500 },
			)
		}

		const response = await formatterService.post({
			path: '/api/format',
			body: {
				code,
				language: normalizeJavaLanguage(incomingLanguage),
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
				: 'Java formatting failed'
		const upstreamSuccess = payload.success === true

		if (!response.ok) {
			return NextResponse.json<ProxyFormatResponse>(
				{
					formattedCode: upstreamFormattedCode,
					success: false,
					error: upstreamError,
				},
				{ status: response.status },
			)
		}

		return NextResponse.json<ProxyFormatResponse>({
			formattedCode: upstreamFormattedCode,
			success: upstreamSuccess,
			error: upstreamSuccess ? null : upstreamError,
		})
	} catch (error) {
		logger.error('Java formatting API route failed', error)
		return NextResponse.json<ProxyFormatResponse>(
			{
				formattedCode: '',
				success: false,
				error: 'Failed to format Java code',
			},
			{ status: 500 },
		)
	}
}
