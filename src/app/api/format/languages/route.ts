import { formatterService } from '@/shared/utils/formatterService'
import { logger } from '@/shared/utils/logger'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
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

		const response = await formatterService.get({
			path: '/api/format/languages',
		})
		const body = await response.json().catch(() => ({}))

		if (!response.ok) {
			const error =
				typeof body.error === 'string' ? body.error : 'Failed to load languages'
			return NextResponse.json(
				{ success: false, error, data: null },
				{ status: response.status },
			)
		}

		const languages = Array.isArray(body?.data?.languages)
			? body.data.languages
			: Array.isArray(body?.languages)
				? body.languages
				: []

		return NextResponse.json({
			success: true,
			error: null,
			data: {
				languages,
			},
		})
	} catch (error) {
		logger.error('Format languages API route failed', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to load supported languages',
				data: null,
			},
			{ status: 500 },
		)
	}
}
