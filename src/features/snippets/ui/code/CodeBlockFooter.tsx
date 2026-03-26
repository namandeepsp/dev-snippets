'use client'

import { LuFileText } from 'react-icons/lu'

/**
 * ============================================================================
 * CODE BLOCK FOOTER
 * ============================================================================
 *
 * Footer component displaying code statistics (lines, characters, language).
 */

interface CodeBlockFooterProps {
	lineCount: number
	code: string
	language: string
}

export function CodeBlockFooter({
	lineCount,
	code,
	language,
}: CodeBlockFooterProps) {
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
