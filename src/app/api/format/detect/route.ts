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
					language: null,
					confidence: 'unknown',
					error: 'Code is required',
				},
				{ status: 400 },
			)
		}

		if (!process.env.FORMATTER_SERVICE_URL) {
			return NextResponse.json<DetectProxyResponse>(
				{
					language: null,
					confidence: 'unknown',
					error: 'Formatter service is not configured',
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
		const language =
			payload.language === null || typeof payload.language === 'string'
				? payload.language
				: null
		const confidence =
			typeof payload.confidence === 'string' ? payload.confidence : 'unknown'

		if (!response.ok) {
			return NextResponse.json<DetectProxyResponse>(
				{
					language,
					confidence,
					error: 'Language detection failed',
				},
				{ status: response.status },
			)
		}

		return NextResponse.json<DetectProxyResponse>({
			language,
			confidence,
			error: null,
		})
	} catch (error) {
		logger.error('Language detection API route failed', error)
		return NextResponse.json<DetectProxyResponse>(
			{
				language: null,
				confidence: 'unknown',
				error: 'Failed to detect language',
			},
			{ status: 500 },
		)
	}
}
