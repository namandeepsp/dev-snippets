'use client'

import CodeMirror from '@/features/editor/code-editor/LazyLoadedCodeMirror'
import type { EditorLanguage } from '@/features/editor/editor.config'
import { useTheme } from '@/shared/hooks/useTheme'
import type { Extension } from '@codemirror/state'
import { useEffect, useState } from 'react'
import { CodeBlockFooter } from './CodeBlockFooter'
import { CodeBlockHeader } from './CodeBlockHeader'
import { copyToClipboard, shareSnippet } from './code-block-actions'
import {
	loadLanguageExtension,
	loadThemeExtension,
} from './codemirror-extensions'

type Props = {
	code: string
	language: EditorLanguage
	showLineNumbers?: boolean
	title?: string
	minHeight?: string
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
	minHeight = '200px',
	maxHeight = '600px',
	snippetId,
	snippetTitle,
	snippetDescription,
	visibility,
}: Props) {
	const [copied, setCopied] = useState(false)
	const [copyError, setCopyError] = useState<string | null>(null)
	const { resolvedTheme } = useTheme()
	const [languageExtension, setLanguageExtension] = useState<Extension | null>(
		null,
	)
	const [themeExtension, setThemeExtension] = useState<Extension | null>(null)

	const showShareButton = snippetId && visibility !== 'private'

	const actionButtonBaseClasses =
		'h-8! gap-1.5! rounded-[10px]! px-3! py-1! text-xs! font-semibold! transition-all focus:ring-0 focus:outline-none !bg-[#303841] !text-white dark:!bg-[#4F565E] dark:!text-gray-300'

	const handleCopy = async () => {
		await copyToClipboard(
			code,
			() => {
				setCopied(true)
				setCopyError(null)
				setTimeout(() => setCopied(false), 2000)
			},
			(error) => {
				setCopyError(error)
				setTimeout(() => setCopyError(null), 2000)
			},
		)
	}

	const handleShare = async () => {
		await shareSnippet(snippetId, snippetTitle, snippetDescription, visibility)
	}

	const lines = code.split('\n')
	const lineCount = lines.length

	useEffect(() => {
		let active = true
		loadLanguageExtension(language)
			.then((extension) => {
				if (active) setLanguageExtension(extension)
			})
			.catch(() => {
				if (active) setLanguageExtension(null)
			})
		return () => {
			active = false
		}
	}, [language])

	useEffect(() => {
		let active = true
		const targetTheme = resolvedTheme === 'dark' ? 'dark' : 'light'
		loadThemeExtension(targetTheme)
			.then((theme) => {
				if (active) setThemeExtension(theme)
			})
			.catch(() => {
				if (active) setThemeExtension(null)
			})
		return () => {
			active = false
		}
	}, [resolvedTheme])

	return (
		<div className="flex flex-col gap-2 overflow-hidden rounded-xl border-b border-[#D4D4D4] bg-[#4F565E] px-4 py-2 dark:border-gray-700 dark:bg-[#333333]">
			<CodeBlockHeader
				language={language}
				title={title}
				showShareButton={showShareButton}
				onShare={handleShare}
				onCopy={handleCopy}
				copied={copied}
				copyError={copyError}
				actionButtonBaseClasses={actionButtonBaseClasses}
			/>

			<div className="flex flex-col">
				<div
					className="relative overflow-auto bg-[#303841] dark:bg-[#1E1E1E]"
					style={{ minHeight, maxHeight }}
				>
					<CodeMirror
						value={code}
						theme={themeExtension ?? undefined}
						extensions={languageExtension ? [languageExtension] : []}
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

				<CodeBlockFooter
					lineCount={lineCount}
					code={code}
					language={language}
				/>
			</div>
		</div>
	)
}
