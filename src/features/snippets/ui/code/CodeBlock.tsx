'use client'

import type { EditorLanguage } from '@/features/editor/editor.config'
import { useTheme } from '@/shared/hooks/useTheme'
import { Button } from '@/shared/ui/design-system'
import { toast } from '@/shared/ui/design-system'
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
import { sublime } from '@uiw/codemirror-theme-sublime'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import CodeMirror from '@uiw/react-codemirror'
import { useState } from 'react'
import { BiError } from 'react-icons/bi'
import { LuCheck, LuFileText, LuShare2 } from 'react-icons/lu'
import { MdOutlineContentCopy } from 'react-icons/md'

type Props = {
	code: string
	language: EditorLanguage
	showLineNumbers?: boolean
	title?: string
	maxHeight?: string
	snippetId?: string
	snippetTitle?: string
	snippetDescription?: string
	visibility?: 'public' | 'private' | 'shared'
}

export function CodeBlock({
	code,
	language,
	showLineNumbers = false,
	title,
	maxHeight = '500px',
	snippetId,
	snippetTitle,
	snippetDescription,
	visibility,
}: Props) {
	const [copied, setCopied] = useState(false)
	const [copyError, setCopyError] = useState<string | null>(null)
	const { resolvedTheme } = useTheme()

	const showShareButton = snippetId && visibility !== 'private'

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

	async function handleShare() {
		if (!snippetId) return

		const url = `${globalThis.location.origin}/snippets/${snippetId}`

		if (visibility === 'private') {
			toast.warning('Cannot share private snippet', {
				description: 'Make it public to share with others',
			})
			return
		}

		if (navigator.share) {
			try {
				await navigator.share({
					title: snippetTitle || 'Code Snippet',
					text: snippetDescription || 'Check out this code snippet',
					url,
				})
			} catch (err) {
				if ((err as Error).name !== 'AbortError') {
					logger.error('Share failed', err)
				}
			}
		} else {
			await navigator.clipboard.writeText(url)
			toast.success('Link copied to clipboard!')
		}
	}

	const lines = code.split('\n')
	const lineCount = lines.length
	const actionButtonBaseClasses =
		'h-8! gap-1.5! rounded-[10px]! px-3! py-1! text-xs! font-semibold! transition-all focus:ring-0 focus:outline-none !bg-[#303841] !text-white dark:!bg-[#4F565E] dark:!text-gray-300'

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
		<div className="flex flex-col gap-2 overflow-hidden rounded-xl border-b border-[#D4D4D4] bg-[#4F565E] px-4 py-2 dark:border-gray-700 dark:bg-[#333333]">
			{/* <div className="flex-col items-center justify-between gap-4 ">

			</div> */}
			<Header
				language={language}
				title={title}
				showShareButton={showShareButton}
				handleShare={handleShare}
				handleCopy={handleCopy}
				copied={copied}
				copyError={copyError}
				actionButtonBaseClasses={actionButtonBaseClasses}
			/>

			<div className="flex flex-col">
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

				<Footer lineCount={lineCount} code={code} language={language} />
			</div>
		</div>
	)
}

interface HeaderProps {
	language: string
	title?: string
	showShareButton?: string | boolean
	handleShare: () => void
	handleCopy: () => void
	copied: boolean
	copyError: string | null
	actionButtonBaseClasses: string
}

function Header({
	language,
	title,
	showShareButton,
	handleShare,
	handleCopy,
	copied,
	copyError,
	actionButtonBaseClasses,
}: HeaderProps) {
	return (
		<div className="flex justify-between">
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

			<div className="flex items-center gap-2">
				{showShareButton && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleShare}
						data-tooltip-id="app-tooltip"
						data-tooltip-content="Share snippet"
						className={actionButtonBaseClasses}
						aria-label="Share snippet"
					>
						<LuShare2 className="h-3.5 w-3.5" />
						<span className="hidden sm:inline">Share</span>
					</Button>
				)}

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleCopy}
					className={`${
						copied
							? actionButtonBaseClasses
							: copyError
								? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
								: actionButtonBaseClasses
					}`}
					aria-label={
						copied ? 'Copied!' : copyError || 'Copy code to clipboard'
					}
				>
					{copied ? (
						<>
							<LuCheck className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">Copied!</span>
						</>
					) : copyError ? (
						<>
							<BiError className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">{copyError}</span>
						</>
					) : (
						<>
							<MdOutlineContentCopy className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">Copy</span>
						</>
					)}
				</Button>
			</div>
		</div>
	)
}

interface FooterProps {
	lineCount: number
	code: string
	language: string
}

function Footer({ lineCount, code, language }: FooterProps) {
	return (
		<div className="flex items-center justify-between border-t border-[#D4D4D4] bg-[#4F565E] py-1.5 text-xs text-white dark:border-gray-[550] dark:bg-[#333333] dark:text-gray-200">
			<div className="flex justify-between items-center gap-2">
				<div className="flex items-center gap-2">
					<LuFileText className="h-3.5 w-3.5" />
					<span>
						{lineCount} {lineCount === 1 ? 'line' : 'lines'}
					</span>
				</div>
				<span>•</span>
				<span className="font-mono">{code.length} characters</span>
			</div>
			<span className="hidden sm:block">
				{language.charAt(0).toUpperCase() + language.slice(1)} syntax
			</span>
		</div>
	)
}
