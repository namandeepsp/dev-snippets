import { logger } from '@/shared/utils/logger'
import { Annotation } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import type { EditorLanguage } from '../editor.config'
import { resolvePasteLanguage } from './languageDetection'

const pasteAnnotation = Annotation.define<boolean>()

interface UsePasteHandlerProps {
	language: EditorLanguage
	onLanguageDetected?: (language: EditorLanguage) => void
	formatWithStatusForEditor?: (
		code: string,
		lang: EditorLanguage,
	) => Promise<{ formattedCode: string; error?: string }>
	onChange?: (value: string) => void
	onClearErrors?: () => void
	onFormattingError?: (error: string) => void
	setIsDetecting?: (isDetecting: boolean) => void
}

/**
 * Paste handler for CodeEditor.
 * Creates CodeMirror extension that handles paste events with language detection and formatting.
 */
export function usePasteHandler({
	language,
	onLanguageDetected,
	formatWithStatusForEditor,
	onChange,
	onClearErrors,
	onFormattingError,
	setIsDetecting,
}: UsePasteHandlerProps) {
	const createPasteHandler = () => {
		return EditorView.domEventHandlers({
			paste: (event, view) => {
				const text = event.clipboardData?.getData('text')
				if (!text) return false

				event.preventDefault()
				logger.info('📋 Paste handler triggered, current language:', language)

				// Check conditions for triggering language detection
				const state = view.state
				const selection = state.selection
				const isAllSelected =
					selection.ranges.length === 1 &&
					selection.ranges[0].from === 0 &&
					selection.ranges[0].to === state.doc.length
				const isEditorEmptyOrWhitespace =
					state.doc.length === 0 || state.doc.toString().trim() === ''

				const shouldDetectLanguage = isAllSelected || isEditorEmptyOrWhitespace
				logger.info('📋 Should detect language:', shouldDetectLanguage)

				// Handle async operations without blocking the event handler
				const handlePasteAsync = async () => {
					let resolvedLanguage = language
					if (shouldDetectLanguage) {
						setIsDetecting?.(true)
						try {
							// Trigger language detection only when completely replacing code or editor is empty/whitespace
							resolvedLanguage = await resolvePasteLanguage(
								text,
								language,
								onLanguageDetected,
							)
							logger.info('📋 Resolved language:', resolvedLanguage)
						} finally {
							setIsDetecting?.(false)
						}
					}

					// Format the pasted text
					let formattedText = text
					let pasteError: string | null = null
					if (formatWithStatusForEditor) {
						logger.info('📋 Formatting with language:', resolvedLanguage)
						const result = await formatWithStatusForEditor(
							text,
							resolvedLanguage,
						)
						if (result.error) {
							pasteError = result.error
							formattedText = text // Keep original text if formatting failed
							logger.info('📋 Formatting error:', result.error)
						} else {
							formattedText = result.formattedCode
							logger.info(
								'📋 Formatting succeeded, formatted length:',
								formattedText.length,
							)
						}
					}

					// Insert at cursor position or replace selection
					logger.info('📋 Inserting formatted text into editor')
					view.dispatch(view.state.replaceSelection(formattedText), {
						annotations: pasteAnnotation.of(true),
					})

					// Notify parent component of the change
					onChange?.(view.state.doc.toString())

					// Handle paste errors or clear them on success
					if (pasteError) {
						onFormattingError?.(pasteError)
					} else {
						onClearErrors?.()
					}
				}

				// Start the async operation
				handlePasteAsync().catch((err) => {
					logger.error('Paste handling failed:', err)
				})

				return true
			},
		})
	}

	return {
		createPasteHandler,
	}
}
