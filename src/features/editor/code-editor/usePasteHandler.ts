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

				const handlePasteAsync = async () => {
					let resolvedLanguage = language
					if (shouldDetectLanguage) {
						setIsDetecting?.(true)
						try {
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
							formattedText = text
							logger.info('📋 Formatting error:', result.error)
						} else {
							formattedText = result.formattedCode
							logger.info(
								'📋 Formatting succeeded, formatted length:',
								formattedText.length,
							)
						}
					}

					logger.info('📋 Inserting formatted text into editor')
					view.dispatch(view.state.replaceSelection(formattedText), {
						annotations: pasteAnnotation.of(true),
					})

					onChange?.(view.state.doc.toString())

					if (pasteError) {
						onFormattingError?.(pasteError)
					} else {
						onClearErrors?.()
					}
				}

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
