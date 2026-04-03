import type {
	FormatProxyRequest,
	UpstreamFormatResponse,
} from '@/features/editor/formatter/formatter.api.types'
import { formatterService } from '@/shared/utils/formatterService'
import { logger } from '@/shared/utils/logger'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as Partial<FormatProxyRequest>
		const code = typeof body.code === 'string' ? body.code : ''
		const language = typeof body.language === 'string' ? body.language : ''

		if (!code.trim() || !language.trim()) {
			return NextResponse.json(
				{
					success: false,
					error: 'Code and language are required',
					data: null,
				},
				{ status: 422 },
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
			body: { code, language },
		})

		const payload = (await response
			.json()
			.catch(() => ({}))) as Partial<UpstreamFormatResponse>
		const formatted_code =
			typeof payload.formatted_code === 'string' ? payload.formatted_code : code
		const upstreamError =
			typeof payload.error === 'string' ? payload.error : 'Formatting failed'
		const upstreamSuccess = payload.success === true

		if (!response.ok || !upstreamSuccess) {
			return NextResponse.json(
				{
					success: false,
					error: upstreamError,
					data: {
						formatted_code,
					},
				},
				{ status: response.ok ? 400 : response.status },
			)
		}

		return NextResponse.json({
			success: true,
			error: null,
			data: {
				formatted_code,
			},
		})
	} catch (error) {
		logger.error('Format API route failed', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to format code',
				data: null,
			},
			{ status: 500 },
		)
	}
}
