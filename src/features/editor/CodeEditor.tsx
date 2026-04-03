import { useTheme } from '@/shared/hooks/useTheme'
import { toast } from '@/shared/ui/design-system'
import { keymap } from '@codemirror/view'
import dynamic from 'next/dynamic'
import React from 'react'
import { CodeEditorSkeleton } from './code-editor/CodeEditorSkeleton'
import { CodeEditorToolbar } from './code-editor/CodeEditorToolbar'
import { ErrorAccordion } from './code-editor/ErrorAccordion'
import { useCodeEditorActions } from './code-editor/useCodeEditorActions'
import { useCodeEditorFormatting } from './code-editor/useCodeEditorFormatting'
import { useCodeEditorState } from './code-editor/useCodeEditorState'
import { useCodeMirrorExtensions } from './code-editor/useCodeMirrorExtensions'
import { usePasteHandler } from './code-editor/usePasteHandler'
import type { EditorLanguage } from './editor.config'

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
	ssr: false,
	loading: () => (
		<div className="min-h-50 rounded-xl border-2 border-gray-200 bg-[#303841] dark:border-gray-700 dark:bg-[#1E1E1E]" />
	),
})

interface CodeEditorProps {
	value: string
	onChange: (value: string) => void
	language?: EditorLanguage
	placeholder?: string
	readOnly?: boolean
	minHeight?: string
	maxHeight?: string
	onLanguageDetected?: (language: EditorLanguage) => void
	onDetectingChange?: (isDetecting: boolean) => void
}

interface CodeEditorRef {
	format: () => void
}

export const CodeEditor = React.forwardRef<CodeEditorRef, CodeEditorProps>(
	function CodeEditor(
		{
			value,
			onChange,
			language = 'javascript',
			placeholder,
			readOnly = false,
			minHeight = '200px',
			maxHeight = '600px',
			onLanguageDetected,
			onDetectingChange,
		},
		ref,
	) {
		const { resolvedTheme } = useTheme()
		const { languageExtension, themeExtension } = useCodeMirrorExtensions(
			language,
			resolvedTheme,
		)

		// State management
		const state = useCodeEditorState()

		// Formatting logic
		const {
			formatWithStatusForEditor,
			isApiFormatting,
			isDetecting,
			setIsDetecting,
		} = useCodeEditorFormatting()

		// Action handlers
		const { handleFormat, handleCopy, handlePaste } = useCodeEditorActions({
			value,
			language,
			readOnly,
			onLanguageDetected,
			onChange,
			handleFormattingError: (error: string) => {
				state.handleFormattingError(error)
				toast.error('Formatting failed. Check errors below.')
			},
			clearFormattingErrors: state.clearFormattingErrors,
			formatWithStatusForEditor,
		})

		// Paste handler
		const { createPasteHandler } = usePasteHandler({
			language,
			onLanguageDetected,
			formatWithStatusForEditor,
			onChange,
			onClearErrors: state.clearFormattingErrors,
			setIsDetecting,
		})

		// Notify parent of detection state changes
		React.useEffect(() => {
			onDetectingChange?.(isDetecting)
		}, [isDetecting, onDetectingChange])

		// Expose format function to parent components
		React.useImperativeHandle(ref, () => ({
			format: handleFormat,
		}))

		return (
			<div className="space-y-2">
				<div
					ref={state.editorRef}
					className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-[#303841] dark:border-gray-700 dark:bg-[#1E1E1E]"
				>
					{isApiFormatting ? (
						<CodeEditorSkeleton />
					) : (
						<>
							<CodeEditorToolbar
								copied={state.copied}
								isApiFormatting={isApiFormatting}
								readOnly={readOnly}
								formattingErrors={state.formattingErrors}
								onToggleErrorAccordion={state.handleErrorButtonClick}
								onCopy={async () => {
									await handleCopy()
									state.setCopied(true)
									setTimeout(() => state.setCopied(false), 2000)
								}}
								onPaste={handlePaste}
							/>
							<div className="overflow-auto" style={{ maxHeight }}>
								<CodeMirror
									value={value}
									onChange={onChange}
									theme={themeExtension ?? undefined}
									extensions={[
										...(languageExtension ? [languageExtension] : []),
										createPasteHandler(),
										keymap.of([
											{
												key: 'Shift-Alt-f',
												run: () => {
													handleFormat()
													return true
												},
											},
										]),
									]}
									placeholder={placeholder}
									readOnly={readOnly}
									basicSetup={{
										lineNumbers: true,
										highlightActiveLineGutter: true,
										highlightSpecialChars: true,
										foldGutter: true,
										drawSelection: true,
										dropCursor: true,
										allowMultipleSelections: true,
										indentOnInput: true,
										bracketMatching: true,
										closeBrackets: true,
										autocompletion: true,
										rectangularSelection: true,
										crosshairCursor: true,
										highlightActiveLine: true,
										highlightSelectionMatches: true,
										closeBracketsKeymap: true,
										searchKeymap: true,
										foldKeymap: true,
										completionKeymap: true,
										lintKeymap: true,
									}}
									style={{
										fontSize: '14px',
										minHeight,
									}}
								/>
							</div>
						</>
					)}
				</div>

				{/* Error Accordion */}
				<ErrorAccordion
					ref={state.errorAccordionRef}
					errors={state.formattingErrors}
					isOpen={state.isErrorAccordionOpen}
					onToggle={state.handleErrorButtonClick}
				/>
			</div>
		)
	},
)
