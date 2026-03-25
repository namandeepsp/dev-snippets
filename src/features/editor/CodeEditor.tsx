'use client'

import { useTheme } from '@/shared/hooks/useTheme'
import { toast } from '@/shared/ui/design-system'
import { logger } from '@/shared/utils/logger'
import { keymap } from '@codemirror/view'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { CodeEditorToolbar } from './code-editor/CodeEditorToolbar'
import { resolvePasteLanguage } from './code-editor/languageDetection'
import { useCodeMirrorExtensions } from './code-editor/useCodeMirrorExtensions'
import { type EditorLanguage, getLanguageConfig } from './editor.config'
import { formatCodeWithStatus } from './formatter/formatter.registry'

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
}

export function CodeEditor({
	value,
	onChange,
	language = 'javascript',
	placeholder,
	readOnly = false,
	minHeight = '200px',
	maxHeight = '600px',
	onLanguageDetected,
}: CodeEditorProps) {
	const { resolvedTheme } = useTheme()
	const [copied, setCopied] = useState(false)
	const [pendingApiFormatOps, setPendingApiFormatOps] = useState(0)
	const editorRef = useRef<HTMLDivElement>(null)
	const isApiFormatting = pendingApiFormatOps > 0
	const { languageExtension, themeExtension } = useCodeMirrorExtensions(
		language,
		resolvedTheme,
	)

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
	) => {
		const shouldShowLoader = isApiBackedFormatter(lang)
		if (shouldShowLoader) {
			setPendingApiFormatOps((count) => count + 1)
		}

		try {
			return await formatCodeWithStatus(code, lang)
		} finally {
			if (shouldShowLoader) {
				setPendingApiFormatOps((count) => Math.max(0, count - 1))
			}
		}
	}

	useEffect(() => {
		const editorElement = editorRef.current
		if (!editorElement || readOnly) return

		const handlePasteEvent = async (e: ClipboardEvent) => {
			const text = e.clipboardData?.getData('text')
			if (!text) return

			e.preventDefault()
			e.stopPropagation()

			const resolvedLanguage = await resolvePasteLanguage(
				text,
				language,
				onLanguageDetected,
			)
			const result = await formatWithStatusForEditor(text, resolvedLanguage)
			const formattedText = result.error ? text : result.formattedCode
			onChange(formattedText)
		}

		editorElement.addEventListener('paste', handlePasteEvent, { capture: true })
		return () =>
			editorElement.removeEventListener('paste', handlePasteEvent, {
				capture: true,
			})
	}, [language, onChange, onLanguageDetected, readOnly])

	async function handleFormat() {
		if (!value.trim() || readOnly) return
		try {
			const result = await formatWithStatusForEditor(value, language)
			if (result.error) {
				toast.error(result.error)
				return
			}
			onChange(result.formattedCode)
		} catch (err) {
			logger.error('Editor format action failed', err)
			toast.error('Failed to format code. Please try again.')
		}
	}

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(value)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (_err) {
			toast.error('Failed to copy code')
		}
	}

	async function handlePaste() {
		if (readOnly) return
		try {
			const text = await navigator.clipboard.readText()
			if (typeof text === 'string') {
				const resolvedLanguage = await resolvePasteLanguage(
					text,
					language,
					onLanguageDetected,
				)
				const result = await formatWithStatusForEditor(text, resolvedLanguage)
				const formattedText = result.error ? text : result.formattedCode
				onChange(formattedText)
				toast.success('Pasted from clipboard')
			}
		} catch (_err) {
			toast.error('Failed to paste from clipboard')
		}
	}

	return (
		<div
			ref={editorRef}
			className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-[#303841] dark:border-gray-700 dark:bg-[#1E1E1E]"
		>
			{isApiFormatting ? (
				<div
					className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/10"
					aria-live="polite"
					aria-label="Formatting in progress"
				>
					<div className="inline-flex items-center justify-center rounded-full bg-gray-200 p-3 text-slate-700 shadow-md dark:bg-slate-800/90 dark:text-slate-200">
						<AiOutlineLoading3Quarters className="animate-spin text-lg" />
					</div>
				</div>
			) : null}
			<CodeEditorToolbar
				copied={copied}
				isApiFormatting={isApiFormatting}
				readOnly={readOnly}
				onCopy={handleCopy}
				onPaste={handlePaste}
			/>
			<div className="overflow-auto" style={{ maxHeight }}>
				<CodeMirror
					value={value}
					onChange={onChange}
					theme={themeExtension ?? undefined}
					extensions={[
						...(languageExtension ? [languageExtension] : []),
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
		</div>
	)
}
