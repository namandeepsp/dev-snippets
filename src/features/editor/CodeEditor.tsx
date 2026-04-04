import { useTheme } from '@/shared/hooks/useTheme'
import { toast } from '@/shared/ui/design-system'
import { keymap } from '@codemirror/view'
import dynamic from 'next/dynamic'
import React from 'react'
import { TECHNOLOGY_COLORS } from '../snippets/core/snippet.colors'
import type { SnippetTechnology } from '../snippets/core/snippet.types'
import { LANGUAGE_TO_PRIMARY_TECHNOLOGY } from '../technologies/technologies.config'
import { TechnologyIcon } from '../technologies/technology-icons'
import { CodeEditorSkeleton } from './code-editor/CodeEditorSkeleton'
import { CodeEditorToolbar } from './code-editor/CodeEditorToolbar'
import { EditorShortcutsModal } from './code-editor/EditorShortcutsModal'
import { ErrorAccordion } from './code-editor/ErrorAccordion'
import { buildEditorShortcuts } from './code-editor/editor.shortcuts'
import { useCodeEditorActions } from './code-editor/useCodeEditorActions'
import { useCodeEditorFormatting } from './code-editor/useCodeEditorFormatting'
import { useCodeEditorState } from './code-editor/useCodeEditorState'
import { useCodeMirrorExtensions } from './code-editor/useCodeMirrorExtensions'
import { usePasteHandler } from './code-editor/usePasteHandler'
import { getLanguageConfig } from './editor.config'
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
	primaryTechnology?: SnippetTechnology
	placeholder?: string
	readOnly?: boolean
	minHeight?: string
	maxHeight?: string
	onLanguageDetected?: (language: EditorLanguage) => void
	onDetectingChange?: (isDetecting: boolean) => void
	onSave?: () => void
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
			primaryTechnology,
			placeholder,
			readOnly = false,
			minHeight = '200px',
			maxHeight = '600px',
			onLanguageDetected,
			onDetectingChange,
			onSave,
		},
		ref,
	) {
		const [isShortcutsOpen, setIsShortcutsOpen] = React.useState(false)
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
			onFormattingError: state.handleFormattingError,
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

		const basicSetup = {
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
			historyKeymap: true,
		}

		const shortcuts = buildEditorShortcuts({
			includeSave: Boolean(onSave),
			includeFormat: true,
			includeCopyPaste: true,
			includeShortcutsHelp: true,
			shortcutsHelpKeys: ['Ctrl+Shift+/', 'Cmd+Shift+/'],
			keymaps: {
				search: basicSetup.searchKeymap !== false,
				history: basicSetup.historyKeymap !== false,
				fold: basicSetup.foldKeymap !== false,
				completion: basicSetup.completionKeymap !== false,
				lint: basicSetup.lintKeymap !== false,
				closeBrackets: basicSetup.closeBracketsKeymap !== false,
			},
		})

		const languageConfig = getLanguageConfig(language)
		const headerTechnology =
			primaryTechnology ??
			LANGUAGE_TO_PRIMARY_TECHNOLOGY[language] ??
			'javascript'
		const headerColorClass =
			TECHNOLOGY_COLORS[headerTechnology] ?? 'bg-gray-500'
		const headerIconTextClass =
			headerTechnology === 'nextjs'
				? 'text-black dark:text-white'
				: 'text-white'
		const formatterLabel =
			languageConfig.formatter === 'none'
				? 'No formatter'
				: `Formatter: ${languageConfig.formatter}`

		return (
			<div className="space-y-2">
				<div
					ref={state.editorRef}
					className="rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
				>
					<div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-linear-to-r from-gray-50 via-white to-gray-50 px-3 py-2 dark:border-gray-700 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-900/60">
						<div className="flex items-center gap-3">
							<div
								className={`flex h-8 w-8 items-center justify-center rounded-[25%] ${headerColorClass} text-base shadow-sm`}
								aria-hidden="true"
							>
								<TechnologyIcon
									technology={headerTechnology}
									className={`h-4 w-4 ${headerIconTextClass}`}
								/>
							</div>
							<div className="flex flex-col">
								<span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
									{languageConfig.label} Editor
								</span>
								<span className="text-xs text-slate-500 dark:text-slate-400">
									{formatterLabel}
								</span>
							</div>
						</div>
						<CodeEditorToolbar
							copied={state.copied}
							readOnly={readOnly}
							formattingErrors={state.formattingErrors}
							onToggleErrorAccordion={state.handleErrorButtonClick}
							onCopy={async () => {
								await handleCopy()
								state.setCopied(true)
								setTimeout(() => state.setCopied(false), 2000)
							}}
							onPaste={handlePaste}
							onOpenShortcuts={() => setIsShortcutsOpen(true)}
							shortcutsHint="Show shortcuts (Ctrl+Shift+/ or Cmd+Shift+/)"
						/>
					</div>
					<div className="bg-[#303841] dark:bg-[#1E1E1E]">
						{isApiFormatting ? (
							<CodeEditorSkeleton />
						) : (
							<>
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
												...(onSave
													? [
															{
																key: 'Mod-s',
																run: () => {
																	if (!readOnly) {
																		onSave()
																	}
																	return true
																},
															},
														]
													: []),
												{
													key: 'Mod-Shift-/',
													run: () => {
														setIsShortcutsOpen(true)
														return true
													},
												},
											]),
										]}
										placeholder={placeholder}
										readOnly={readOnly}
										basicSetup={basicSetup}
										style={{
											fontSize: '14px',
											minHeight,
										}}
									/>
								</div>
								<EditorShortcutsModal
									isOpen={isShortcutsOpen}
									onClose={() => setIsShortcutsOpen(false)}
									shortcuts={shortcuts}
								/>
							</>
						)}
					</div>
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
