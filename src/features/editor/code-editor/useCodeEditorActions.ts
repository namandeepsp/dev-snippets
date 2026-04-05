import { toast } from '@/shared/ui/design-system'
import { logger } from '@/shared/utils/logger'
import type { EditorLanguage } from '../editor.config'
import { resolvePasteLanguage } from './languageDetection'

interface UseCodeEditorActionsProps {
	value: string
	language: EditorLanguage
	readOnly: boolean
	onLanguageDetected?: (language: EditorLanguage) => void
	onChange: (value: string) => void
	handleFormattingError: (error: string) => void
	clearFormattingErrors: () => void
	formatWithStatusForEditor: (
		code: string,
		lang: EditorLanguage,
	) => Promise<{ formattedCode: string; error?: string }>
}

/**
 * Action handlers for CodeEditor.
 * Handles: format, copy, paste operations.
 */
export function useCodeEditorActions({
	value,
	language,
	readOnly,
	onLanguageDetected,
	onChange,
	handleFormattingError,
	clearFormattingErrors,
	formatWithStatusForEditor,
}: UseCodeEditorActionsProps) {
	const handleFormat = async () => {
		if (!value.trim() || readOnly) return
		try {
			logger.info('📝 handleFormat called')
			const result = await formatWithStatusForEditor(value, language)
			if (result.error) {
				handleFormattingError(result.error)
				return
			}
			// Clear errors on successful format
			clearFormattingErrors()
			onChange(result.formattedCode)
		} catch (err) {
			logger.error('Editor format action failed', err)
			const errorMsg =
				err instanceof Error
					? err.message
					: 'Failed to format code. Please try again.'
			handleFormattingError(errorMsg)
		}
	}

	const handleCopy = async () => {
		try {
			logger.info('📋 handleCopy called')
			await navigator.clipboard.writeText(value)
			toast.success('Copied to clipboard')
		} catch (_err) {
			logger.error('Copy failed')
			toast.error('Failed to copy code')
		}
	}

	const handlePaste = async () => {
		if (readOnly) return
		try {
			logger.info('📋 handlePaste called')
			const text = await navigator.clipboard.readText()
			if (typeof text === 'string') {
				if (text.trim().length === 0) return
				const resolvedLanguage = await resolvePasteLanguage(
					text,
					language,
					onLanguageDetected,
				)
				const result = await formatWithStatusForEditor(text, resolvedLanguage)
				const formattedText = result.error ? text : result.formattedCode
				onChange(formattedText)

				if (result.error) {
					toast.warning('Pasted from clipboard (formatting failed)')
				} else {
					toast.success('Pasted from clipboard')
				}
			}
		} catch (_err) {
			logger.error('Paste failed')
			toast.error('Failed to paste from clipboard')
		}
	}

	return {
		handleFormat,
		handleCopy,
		handlePaste,
	}
}
