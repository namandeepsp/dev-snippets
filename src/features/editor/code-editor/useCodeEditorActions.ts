import { toast } from '@/shared/ui/design-system'
import { logger } from '@/shared/utils/logger'
import type { EditorView } from '@codemirror/view'
import type { EditorLanguage } from '../editor.config'
import { resolvePasteLanguage } from './languageDetection'

interface UseCodeEditorActionsProps {
	value: string
	language: EditorLanguage
	readOnly: boolean
	editorView?: EditorView | null
	onLanguageDetected?: (language: EditorLanguage) => void
	onChange: (value: string) => void
	handleFormattingError: (error: string) => void
	clearFormattingErrors: () => void
	formatWithStatusForEditor: (
		code: string,
		lang: EditorLanguage,
	) => Promise<{ formattedCode: string; error?: string }>
}

export function useCodeEditorActions({
	value,
	language,
	readOnly,
	editorView,
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
			clearFormattingErrors()
			if (editorView) {
				const current = editorView.state.doc.toString()
				if (current !== result.formattedCode) {
					editorView.dispatch({
						changes: {
							from: 0,
							to: editorView.state.doc.length,
							insert: result.formattedCode,
						},
					})
				}
				onChange(editorView.state.doc.toString())
			} else {
				onChange(result.formattedCode)
			}
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
				if (editorView) {
					editorView.dispatch({
						changes: {
							from: 0,
							to: editorView.state.doc.length,
							insert: formattedText,
						},
					})
					onChange(editorView.state.doc.toString())
				} else {
					onChange(formattedText)
				}

				if (result.error) {
					toast.warning('Pasted from clipboard (formatting failed)')
					handleFormattingError(result.error)
				} else {
					clearFormattingErrors()
					toast.success('Pasted from clipboard')
				}
			}
		} catch (err) {
			logger.error('Paste failed', err)
			toast.error('Failed to paste from clipboard. Try using Ctrl+V instead.')
		}
	}

	return {
		handleFormat,
		handleCopy,
		handlePaste,
	}
}
