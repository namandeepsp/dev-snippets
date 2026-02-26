'use client'

import { useTheme } from '@/shared/hooks/useTheme'
import { keymap } from '@codemirror/view'
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
import { sublime } from '@uiw/codemirror-theme-sublime'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import CodeMirror from '@uiw/react-codemirror'
import type { EditorLanguage } from './editor.config'
import { Button, toast } from '@/shared/ui/design-system'
import { formatCode } from './formatter/formatter.registry'
import { useState } from 'react'
import { MdOutlineContentCopy } from "react-icons/md"
import { IoCheckmark } from "react-icons/io5"

interface CodeEditorProps {
	value: string
	onChange: (value: string) => void
	language?: EditorLanguage
	placeholder?: string
	readOnly?: boolean
	minHeight?: string
	maxHeight?: string
}

export function CodeEditor({
	value,
	onChange,
	language = 'javascript',
	placeholder,
	readOnly = false,
	minHeight = '200px',
	maxHeight = '600px',
}: CodeEditorProps) {
	const { resolvedTheme } = useTheme()
	const [copied, setCopied] = useState(false)

	async function handleFormat() {
		if (!value.trim() || readOnly) return
		try {
			const formatted = await formatCode(value, language)
			onChange(formatted)
		} catch (err) {
			console.error('Format failed:', err)
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

	return (
		<div
			className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-[#303841] dark:border-gray-700 dark:bg-[#1E1E1E]">
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={handleCopy}
				data-tooltip-id="app-tooltip"
				data-tooltip-content={copied ? 'Copied!' : 'Copy code'}
				className="absolute top-2 right-2 z-10 pointer-events-auto !rounded-lg !px-3 !py-2 !text-lg transition-all focus:ring-0 focus:outline-none !bg-gray-200 !text-slate-700 hover:!bg-gray-300 dark:!bg-slate-800/90 dark:!text-slate-200 dark:hover:!bg-slate-800"
				aria-label={copied ? 'Copied!' : 'Copy code to clipboard'}
			>
				{copied ? <IoCheckmark /> : <MdOutlineContentCopy />}
			</Button>
			<div
				className="overflow-auto"
				style={{ maxHeight }}
			>
				<CodeMirror
					value={value}
					onChange={onChange}
					theme={resolvedTheme === 'dark' ? vscodeDark : sublime}
					extensions={[
						getLanguageExtension(language),
						keymap.of([{
							key: 'Shift-Alt-f',
							run: () => {
								handleFormat()
								return true
							},
						}]),
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
