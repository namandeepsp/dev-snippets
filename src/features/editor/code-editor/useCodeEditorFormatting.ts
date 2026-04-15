import { logger } from '@/shared/utils/logger'
import { useState } from 'react'
import type { EditorLanguage } from '../editor.config'
import { getLanguageConfig } from '../editor.config'
import { formatCodeWithStatus } from '../formatter/formatter.registry'

export function useCodeEditorFormatting() {
	const [pendingApiFormatOps, setPendingApiFormatOps] = useState(0)
	const [isDetecting, setIsDetecting] = useState(false)
	const isApiFormatting = pendingApiFormatOps > 0
	const isApiBackedFormatter = (lang: EditorLanguage): boolean => {
		const formatter = getLanguageConfig(lang).formatter
		return (
			formatter === 'black' ||
			formatter === 'gofmt' ||
			formatter === 'google-java-format'
		)
	}

	const formatWithStatusForEditor = async (
		code: string,
		lang: EditorLanguage,
	): Promise<{ formattedCode: string; error?: string }> => {
		const shouldShowLoader = isApiBackedFormatter(lang)
		if (shouldShowLoader) {
			setPendingApiFormatOps((count) => count + 1)
		}

		try {
			logger.info('📜 formatWithStatusForEditor called for:', lang)
			return await formatCodeWithStatus(code, lang)
		} finally {
			if (shouldShowLoader) {
				setPendingApiFormatOps((count) => Math.max(0, count - 1))
			}
		}
	}

	return {
		isApiBackedFormatter,
		formatWithStatusForEditor,
		isApiFormatting,
		isDetecting,
		setIsDetecting,
	}
}
