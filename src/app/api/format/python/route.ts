import {
	type FormatProxyRequest,
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
			return NextResponse.json(
				{
					success: false,
					error: 'Code is required',
					data: null,
				},
				{ status: 400 },
			)
		}

		if (
			typeof incomingLanguage !== 'undefined' &&
			!isPythonFamilyLanguage(incomingLanguage)
		) {
			return NextResponse.json(
				{
					success: false,
					error: `Unsupported language for python route: ${String(incomingLanguage)}`,
					data: null,
				},
				{ status: 400 },
			)
		}

		if (!process.env.FORMATTER_SERVICE_URL) {
			return NextResponse.json(
				{
					success: false,
					error: 'Formatter service is not configured',
					data: null,
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

		if (!response.ok) {
			return NextResponse.json(payload, { status: response.status })
		}

		return NextResponse.json(payload)
	} catch (error) {
		logger.error('Python formatting API route failed', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to format Python code',
				data: null,
			},
			{ status: 500 },
		)
	}
}
