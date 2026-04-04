import type {
	DetectProxyRequest,
	DetectProxyResponse,
	UpstreamDetectResponse,
} from '@/features/editor/formatter/formatter.api.types'
import { formatterService } from '@/shared/utils/formatterService'
import { logger } from '@/shared/utils/logger'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as Partial<DetectProxyRequest>
		const code = typeof body.code === 'string' ? body.code : ''

		if (!code.trim()) {
			return NextResponse.json<DetectProxyResponse>(
				{
					success: false,
					error: 'Code is required',
					data: null,
				},
				{ status: 400 },
			)
		}

		if (!process.env.FORMATTER_SERVICE_URL) {
			return NextResponse.json<DetectProxyResponse>(
				{
					success: false,
					error: 'Formatter service is not configured',
					data: null,
				},
				{ status: 500 },
			)
		}

		const response = await formatterService.post({
			path: '/api/format/detect',
			body: { code },
		})

		const payload = (await response
			.json()
			.catch(() => ({}))) as Partial<UpstreamDetectResponse>

		if (!response.ok) {
			return NextResponse.json<DetectProxyResponse>(
				{
					success: false,
					error: 'Language detection failed',
					data: null,
				},
				{ status: response.status },
			)
		}

		return NextResponse.json<DetectProxyResponse>({
			success: payload.success ?? true,
			error: payload.error ?? null,
			data: payload.data ?? null,
		})
	} catch (error) {
		logger.error('Language detection API route failed', error)
		return NextResponse.json<DetectProxyResponse>(
			{
				success: false,
				error: 'Failed to detect language',
				data: null,
			},
			{ status: 500 },
		)
	}
}
