'use client'

import type { EditorLanguage } from '@/features/editor/editor.config'
import { useTheme } from '@/shared/hooks/useTheme'
import type { Extension } from '@codemirror/state'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { CodeBlockFooter } from './CodeBlockFooter'
import { CodeBlockHeader } from './CodeBlockHeader'
import { copyToClipboard, shareSnippet } from './code-block-actions'
import {
	loadLanguageExtension,
	loadThemeExtension,
} from './codemirror-extensions'

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
	ssr: false,
	loading: () => (
		<div className="flex flex-col gap-2 overflow-hidden rounded-xl border-b border-[#D4D4D4] bg-[#4F565E] px-4 py-2 dark:border-gray-700 dark:bg-[#333333]">
			<div className="flex items-center justify-between gap-2 pb-2">
				<div className="h-5 w-24 animate-pulse rounded bg-[#303841] dark:bg-[#1E1E1E]" />
				<div className="flex gap-2">
					<div className="h-8 w-16 animate-pulse rounded-[10px] bg-[#303841] dark:bg-[#4F565E]" />
					<div className="h-8 w-16 animate-pulse rounded-[10px] bg-[#303841] dark:bg-[#4F565E]" />
				</div>
			</div>
			<div className="flex flex-col">
				<div
					className="relative overflow-auto bg-[#303841] dark:bg-[#1E1E1E]"
					style={{ maxHeight: '500px' }}
				>
					<div className="space-y-2 p-4">
						{[...Array(8)].map((_, i) => (
							<div key={i} className="flex gap-3">
								<div className="h-4 w-6 animate-pulse rounded bg-gray-600 dark:bg-gray-700" />
								<div className="flex-1 space-y-1">
									<div className="h-4 w-3/4 animate-pulse rounded bg-gray-600 dark:bg-gray-700" />
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="border-t border-[#D4D4D4] bg-[#303841] px-4 py-2 text-xs text-gray-400 dark:border-gray-700 dark:bg-[#1E1E1E]">
					<div className="h-4 w-20 animate-pulse rounded bg-gray-600 dark:bg-gray-700" />
				</div>
			</div>
		</div>
	),
})

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
					style={{ maxHeight }}
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
