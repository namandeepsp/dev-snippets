import { useTheme } from '@/shared/hooks/useTheme'
import { Button, toast } from '@/shared/ui/design-system'
import { redo, redoDepth, undo, undoDepth } from '@codemirror/commands'
import type { EditorState } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import { keymap } from '@codemirror/view'
import dynamic from 'next/dynamic'
import React from 'react'
import { MdErrorOutline, MdOutlineInfo } from 'react-icons/md'
import { TECHNOLOGY_COLORS } from '../snippets/core/snippet.colors'
import type { SnippetTechnology } from '../snippets/core/snippet.types'
import { LANGUAGE_TO_PRIMARY_TECHNOLOGY } from '../technologies/technologies.config'
import { TechnologyIcon } from '../technologies/technology-icons'
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
		const [editorView, setEditorView] = React.useState<EditorView | null>(null)
		const [canUndo, setCanUndo] = React.useState(false)
		const [canRedo, setCanRedo] = React.useState(false)
		const { resolvedTheme } = useTheme()
		const { languageExtension, themeExtension } = useCodeMirrorExtensions(
			language,
			resolvedTheme,
		)

		const state = useCodeEditorState()

		const {
			formatWithStatusForEditor,
			isApiFormatting,
			isDetecting,
			setIsDetecting,
		} = useCodeEditorFormatting()

		const { handleFormat, handleCopy, handlePaste } = useCodeEditorActions({
			value,
			language,
			readOnly,
			editorView,
			onLanguageDetected,
			onChange,
			handleFormattingError: (error: string) => {
				state.handleFormattingError(error)
				toast.error('Formatting failed. Check errors below.')
			},
			clearFormattingErrors: state.clearFormattingErrors,
			formatWithStatusForEditor,
		})

		const { createPasteHandler } = usePasteHandler({
			language,
			onLanguageDetected,
			formatWithStatusForEditor,
			onChange,
			onClearErrors: state.clearFormattingErrors,
			onFormattingError: state.handleFormattingError,
			setIsDetecting,
		})

		React.useEffect(() => {
			onDetectingChange?.(isDetecting)
		}, [isDetecting, onDetectingChange])

		React.useImperativeHandle(ref, () => ({
			format: handleFormat,
		}))

		const updateHistoryState = React.useCallback((state: EditorState) => {
			setCanUndo(undoDepth(state) > 0)
			setCanRedo(redoDepth(state) > 0)
		}, [])

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
		const isEditorEmpty = value.trim().length === 0

		return (
			<div className="space-y-2">
				<div
					ref={state.editorRef}
					className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700"
				>
					<div className="flex flex-col gap-3 border-b border-white/10 bg-[#303841] px-3 py-2 text-slate-100 sm:flex-row sm:items-center sm:justify-between sm:gap-2 dark:bg-[#1E1E1E]">
						<div className="flex items-center justify-between gap-3 flex-1 sm:flex-none sm:justify-start">
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
									<span className="text-sm font-semibold text-slate-100">
										{languageConfig.label} Editor
									</span>
									<span className="text-xs text-slate-300">
										{formatterLabel}
									</span>
								</div>
							</div>
							<div className="flex items-center gap-1.5">
								{state.formattingErrors.length > 0 ? (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={state.handleErrorButtonClick}
										data-tooltip-id="app-tooltip"
										data-tooltip-content={`${state.formattingErrors.length} formatting error${state.formattingErrors.length > 1 ? 's' : ''}`}
										className="pointer-events-auto sm:hidden rounded-lg! px-2! py-1.5! text-base! transition-all focus:outline-none focus:ring-0 bg-red-500/20! text-red-200! hover:bg-red-500/30!"
										aria-label="Show formatting errors"
									>
										<MdErrorOutline />
										<span className="ml-1 text-sm font-medium">
											{state.formattingErrors.length}
										</span>
									</Button>
								) : null}
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setIsShortcutsOpen(true)}
									data-tooltip-id="app-tooltip"
									data-tooltip-content="Show shortcuts (Ctrl+Shift+/ or Cmd+Shift+/)"
									className="pointer-events-auto sm:hidden rounded-lg! px-2! py-1.5! text-base! text-slate-100! transition-all focus:outline-none focus:ring-0 bg-white/10! hover:bg-white/20!"
									aria-label="Show editor shortcuts"
								>
									<MdOutlineInfo />
								</Button>
							</div>
						</div>
						<div className="relative mt-1 w-full border-t border-white/10 pt-2 sm:mt-0 sm:w-auto sm:border-0 sm:pt-0 flex items-center gap-2">
							<CodeEditorToolbar
								copied={state.copied}
								readOnly={readOnly}
								canUndo={canUndo}
								canRedo={canRedo}
								isEditorEmpty={isEditorEmpty}
								formattingErrors={state.formattingErrors}
								onToggleErrorAccordion={state.handleErrorButtonClick}
								onUndo={() => {
									if (editorView && !readOnly) {
										undo(editorView)
									}
								}}
								onRedo={() => {
									if (editorView && !readOnly) {
										redo(editorView)
									}
								}}
								onCopy={async () => {
									await handleCopy()
									state.setCopied(true)
									setTimeout(() => state.setCopied(false), 2000)
								}}
								onPaste={handlePaste}
							/>
							<Button
								type="button"
								variant="ghost"
								size="lg"
								onClick={() => setIsShortcutsOpen(true)}
								data-tooltip-id="app-tooltip"
								data-tooltip-content="Show shortcuts (Ctrl+Shift+/ or Cmd+Shift+/)"
								className="hidden sm:flex rounded-lg p-1.5! text-slate-100 transition-all hover:bg-white/10! focus:outline-none focus:ring-0"
								aria-label="Show editor shortcuts"
							>
								<MdOutlineInfo className="h-5 w-5" />
							</Button>
							{/* <button
								type="button"
							>
								<MdOutlineInfo className="h-5 w-5" />
							</button> */}
						</div>
					</div>
					<div className="relative bg-[#303841] dark:bg-[#1E1E1E]">
						<div className="overflow-auto" style={{ maxHeight }}>
							<CodeMirror
								value={value}
								onChange={onChange}
								onCreateEditor={(view) => {
									setEditorView(view)
									updateHistoryState(view.state)
								}}
								onUpdate={(viewUpdate) => {
									updateHistoryState(viewUpdate.state)
								}}
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
						{isApiFormatting ? (
							<div className="absolute inset-0 z-10 flex items-center justify-center bg-[#303841]/80 backdrop-blur-[1px] dark:bg-[#1E1E1E]/80">
								<div className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 text-xs font-semibold text-slate-100 ring-1 ring-white/10">
									<svg
										className="h-4 w-4 animate-spin"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
										/>
									</svg>
									Formatting...
								</div>
							</div>
						) : null}
					</div>
					<EditorShortcutsModal
						isOpen={isShortcutsOpen}
						onClose={() => setIsShortcutsOpen(false)}
						shortcuts={shortcuts}
					/>
				</div>

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
