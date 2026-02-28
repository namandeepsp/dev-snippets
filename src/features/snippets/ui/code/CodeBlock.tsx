'use client'

import type { EditorLanguage } from '@/features/editor/editor.config'
import { useTheme } from '@/shared/hooks/useTheme'
import { Button } from '@/shared/ui/design-system'
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
import { useState } from 'react'

type Props = {
	code: string
	language: EditorLanguage
	showLineNumbers?: boolean
	title?: string
	maxHeight?: string
}

export function CodeBlock({
	code,
	language,
	showLineNumbers = false,
	title,
	maxHeight = '500px',
}: Props) {
	const [copied, setCopied] = useState(false)
	const [copyError, setCopyError] = useState<string | null>(null)
	const { resolvedTheme } = useTheme()

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(code)
			setCopied(true)
			setCopyError(null)
			setTimeout(() => setCopied(false), 2000)
		} catch (_err) {
			setCopyError('Failed to copy')
			setTimeout(() => setCopyError(null), 2000)
		}
	}

	const lines = code.split('\n')
	const lineCount = lines.length
	const copyButtonBaseClasses =
		'!bg-[#303841] !text-white dark:!bg-[#4F565E] dark:!text-gray-300'

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
			go: javascript(),
			yaml: javascript(),
			ruby: javascript(),
			csharp: javascript(),
			bash: javascript(),
			dockerfile: javascript(),
		}

		return extensions[lang] || javascript()
	}

	return (
		<div className="overflow-hidden rounded-xl border border-[#D4D4D4] bg-[#FFFEF7] dark:border-gray-700 dark:bg-gray-900">
			<div className="flex items-center justify-between gap-4 border-b border-[#D4D4D4] bg-[#4F565E] px-4 py-2 dark:border-gray-700 dark:bg-[#333333]">
				<div className="flex items-center gap-2 min-w-0">
					<span className="rounded-md bg-[#303841] px-2 py-1 text-xs font-semibold text-white dark:bg-[#4F565E] dark:text-gray-300">
						{language}
					</span>
					{title && (
						<span className="truncate text-sm text-[#6F6F6F] dark:text-gray-400">
							{title}
						</span>
					)}
				</div>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleCopy}
					className={`gap-1.5! rounded-lg! px-3! py-1.5! text-xs! font-semibold! transition-all focus:ring-0 focus:outline-none ${
						copied
							? copyButtonBaseClasses
							: copyError
								? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
								: copyButtonBaseClasses
					}`}
					aria-label={
						copied ? 'Copied!' : copyError || 'Copy code to clipboard'
					}
				>
					{copied ? (
						<>
							<span className="text-base">✓</span>
							<span className="hidden sm:inline">Copied!</span>
						</>
					) : copyError ? (
						<>
							<span className="text-base">⚠</span>
							<span className="hidden sm:inline">{copyError}</span>
						</>
					) : (
						<>
							<span className="text-base">📋</span>
							<span className="hidden sm:inline">Copy</span>
						</>
					)}
				</Button>
			</div>

			<div
				className="relative overflow-auto bg-[#303841] dark:bg-[#1E1E1E]"
				style={{ maxHeight }}
			>
				<CodeMirror
					value={code}
					theme={resolvedTheme === 'dark' ? vscodeDark : sublime}
					extensions={[getLanguageExtension(language)]}
					editable={false}
					readOnly
					basicSetup={{
						lineNumbers: showLineNumbers,
						highlightActiveLineGutter: false,
						highlightActiveLine: false,
						foldGutter: false,
						dropCursor: false,
						drawSelection: false,
						allowMultipleSelections: false,
						autocompletion: false,
						closeBrackets: false,
						closeBracketsKeymap: false,
						completionKeymap: false,
						lintKeymap: false,
					}}
					style={{ fontSize: '14px' }}
				/>
			</div>

			<div className="flex items-center justify-between border-t border-[#D4D4D4] bg-[#4F565E] px-4 py-1.5 text-xs text-white dark:border-gray-700 dark:bg-[#333333] dark:text-gray-400">
				<div className="flex items-center gap-2">
					<span>
						📄 {lineCount} {lineCount === 1 ? 'line' : 'lines'}
					</span>
					<span>•</span>
					<span className="font-mono">{code.length} characters</span>
				</div>
				<span className="hidden sm:block">
					{language.charAt(0).toUpperCase() + language.slice(1)} syntax
				</span>
			</div>
		</div>
	)
}
