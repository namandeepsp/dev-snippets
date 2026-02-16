'use client'

import type { EditorLanguage } from '@/features/editor/editor.config'
import { useState } from 'react'

type Props = {
	/** The code to display */
	code: string
	/** Programming language for syntax highlighting */
	language: EditorLanguage
	/** Whether to show line numbers */
	showLineNumbers?: boolean
	/** Title/description of the code block */
	title?: string
	/** Maximum height before scrolling */
	maxHeight?: string
}

/**
 * ============================================================================
 * CODE BLOCK
 * ============================================================================
 *
 * Displays code with syntax highlighting, line numbers, and copy functionality.
 *
 * Features:
 * - Copy to clipboard with feedback
 * - Optional line numbers
 * - Language badge
 * - Responsive scrolling
 * - Accessible keyboard support
 */

export function CodeBlock({
	code,
	language,
	showLineNumbers = false,
	title,
	maxHeight = '500px',
}: Props) {
	const [copied, setCopied] = useState(false)
	const [copyError, setCopyError] = useState<string | null>(null)

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

	// Split code into lines for line numbers
	const lines = code.split('\n')
	const lineCount = lines.length

	return (
		<div className="rounded-lg border border-default overflow-hidden bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<div className="flex items-center justify-between gap-4 border-b border-default bg-gray-100/50 px-4 py-2 dark:bg-gray-800/50">
				<div className="flex items-center gap-2 min-w-0">
					{/* Language badge */}
					<span className="rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
						{language}
					</span>

					{/* Title */}
					{title && (
						<span className="text-sm text-gray-600 dark:text-gray-400 truncate">
							{title}
						</span>
					)}
				</div>

				{/* Copy button */}
				<button
					onClick={handleCopy}
					className={`
            flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium
            transition-all focus:outline-none focus:ring-2 focus:ring-foreground/20
            ${
							copied
								? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
								: copyError
									? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
									: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
						}
          `}
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
				</button>
			</div>

			{/* Code */}
			<div
				className="relative overflow-auto p-4 font-mono text-sm"
				style={{ maxHeight }}
			>
				<div className="flex">
					{/* Line numbers */}
					{showLineNumbers && (
						<div
							className="select-none pr-4 text-right text-gray-400 dark:text-gray-600"
							aria-hidden="true"
						>
							{Array.from({ length: lineCount }, (_, i) => i + 1).map((num) => (
								<div key={num} className="leading-relaxed">
									{num}
								</div>
							))}
						</div>
					)}

					{/* Code content */}
					<pre className="flex-1 overflow-visible">
						<code
							className={`
              block leading-relaxed
              ${language === 'javascript' ? 'language-javascript' : ''}
              ${language === 'typescript' ? 'language-typescript' : ''}
              ${language === 'html' ? 'language-html' : ''}
              ${language === 'css' ? 'language-css' : ''}
              ${language === 'json' ? 'language-json' : ''}
              ${language === 'go' ? 'language-go' : ''}
              ${language === 'python' ? 'language-python' : ''}
              ${language === 'sql' ? 'language-sql' : ''}
              ${language === 'yaml' ? 'language-yaml' : ''}
              ${language === 'markdown' ? 'language-markdown' : ''}
            `}
						>
							{code}
						</code>
					</pre>
				</div>
			</div>

			{/* Footer with metadata */}
			<div className="flex items-center justify-between border-t border-default bg-gray-100/50 px-4 py-1.5 text-xs text-gray-500 dark:bg-gray-800/50">
				<div className="flex items-center gap-2">
					<span>
						📄 {lineCount} {lineCount === 1 ? 'line' : 'lines'}
					</span>
					<span>•</span>
					<span className="font-mono">{code.length} characters</span>
				</div>

				{/* Syntax highlighting notice */}
				<span className="hidden sm:block">
					{language.charAt(0).toUpperCase() + language.slice(1)} syntax
				</span>
			</div>
		</div>
	)
}
