'use client'

import { useTheme } from '@/shared/hooks/useTheme'
import { Button, toast } from '@/shared/ui/design-system'
import { logger } from '@/shared/utils/logger'
import { cpp } from '@codemirror/lang-cpp'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { java } from '@codemirror/lang-java'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { php } from '@codemirror/lang-php'
import { python } from '@codemirror/lang-python'
import { rust } from '@codemirror/lang-rust'
import { sql } from '@codemirror/lang-sql'
import { keymap } from '@codemirror/view'
import { sublime } from '@uiw/codemirror-theme-sublime'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import CodeMirror from '@uiw/react-codemirror'
import { useEffect, useRef, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { IoCheckmark } from 'react-icons/io5'
import { MdOutlineContentCopy, MdOutlineContentPaste } from 'react-icons/md'
import {
	type EditorLanguage,
	SUPPORTED_LANGUAGES,
	getLanguageConfig,
} from './editor.config'
import { formatCodeWithStatus } from './formatter/formatter.registry'

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

	const isApiBackedFormatter = (lang: EditorLanguage): boolean => {
		const formatter = getLanguageConfig(lang).formatter
		return formatter === 'black' || formatter === 'gofmt'
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

	const detectLanguageFromApi = async (
		code: string,
	): Promise<EditorLanguage | null> => {
		try {
			const response = await fetch('/api/format/detect', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code }),
			})

			if (!response.ok) return null

			const data = (await response.json()) as {
				language?: string | null
			}

			const detected =
				typeof data?.language === 'string' ? data.language.toLowerCase() : null

			if (!detected) return null

			return SUPPORTED_LANGUAGES.includes(detected as EditorLanguage)
				? (detected as EditorLanguage)
				: null
		} catch (_err) {
			return null
		}
	}

	const resolvePasteLanguage = async (
		code: string,
		currentLanguage: EditorLanguage,
	): Promise<EditorLanguage> => {
		const detected = await detectLanguageFromApi(code)
		if (detected && detected !== currentLanguage) {
			onLanguageDetected?.(detected)
			return detected
		}
		return currentLanguage
	}

	useEffect(() => {
		const editorElement = editorRef.current
		if (!editorElement || readOnly) return

		const handlePasteEvent = async (e: ClipboardEvent) => {
			const text = e.clipboardData?.getData('text')
			if (!text) return

			e.preventDefault()
			e.stopPropagation()

			const resolvedLanguage = await resolvePasteLanguage(text, language)
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

	const getLanguageExtension = (lang: EditorLanguage) => {
		const extensions: Record<EditorLanguage, any> = {
			javascript: javascript({ jsx: true }),
			typescript: javascript({ typescript: true, jsx: true }),
			json: json(),
			html: html(),
			css: css(),
			python: python(),
			java: java(),
			cpp: cpp(),
			rust: rust(),
			php: php(),
			sql: sql(),
			markdown: markdown(),
			go: javascript(), // Fallback
			yaml: javascript(), // Fallback
			ruby: javascript(), // Fallback
			csharp: javascript(), // Fallback
			bash: javascript(), // Fallback
			dockerfile: javascript(), // Fallback
		}
		return extensions[lang] || javascript()
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
				const resolvedLanguage = await resolvePasteLanguage(text, language)
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
			<div className="absolute top-2 right-2 z-10 flex gap-2">
				{isApiFormatting ? (
					<div
						className="pointer-events-none inline-flex items-center justify-center rounded-lg bg-gray-200 px-3 py-2 text-slate-700 dark:bg-slate-800/90 dark:text-slate-200"
						aria-label="Formatting in progress"
					>
						<AiOutlineLoading3Quarters className="animate-spin text-base" />
					</div>
				) : null}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handlePaste}
					disabled={readOnly}
					data-tooltip-id="app-tooltip"
					data-tooltip-content="Paste from clipboard"
					className="hidden max-[850px]:flex pointer-events-auto rounded-lg! px-3! py-2! text-lg! transition-all focus:ring-0 focus:outline-none bg-gray-200! text-slate-700! hover:bg-gray-300! dark:bg-slate-800/90! dark:text-slate-200! dark:hover:bg-slate-800! disabled:opacity-50"
					aria-label="Paste from clipboard"
				>
					<MdOutlineContentPaste />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleCopy}
					data-tooltip-id="app-tooltip"
					data-tooltip-content={copied ? 'Copied!' : 'Copy code'}
					className="pointer-events-auto rounded-lg! px-3! py-2! text-lg! transition-all focus:ring-0 focus:outline-none bg-gray-200! text-slate-700! hover:bg-gray-300! dark:bg-slate-800/90! dark:text-slate-200! dark:hover:bg-slate-800!"
					aria-label={copied ? 'Copied!' : 'Copy code to clipboard'}
				>
					{copied ? <IoCheckmark /> : <MdOutlineContentCopy />}
				</Button>
			</div>
			<div className="overflow-auto" style={{ maxHeight }}>
				<CodeMirror
					value={value}
					onChange={onChange}
					theme={resolvedTheme === 'dark' ? vscodeDark : sublime}
					extensions={[
						getLanguageExtension(language),
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
