'use client'

import { Button } from '@/shared/ui/design-system'
import { BiError } from 'react-icons/bi'
import { LuCheck, LuShare2 } from 'react-icons/lu'
import { MdOutlineContentCopy } from 'react-icons/md'

/**
 * ============================================================================
 * CODE BLOCK HEADER
 * ============================================================================
 *
 * Header component displaying language badge, title, and action buttons.
 */

interface CodeBlockHeaderProps {
	language: string
	title?: string
	showShareButton?: string | boolean
	onShare: () => void
	onCopy: () => void
	copied: boolean
	copyError: string | null
	actionButtonBaseClasses: string
}

export function CodeBlockHeader({
	language,
	title,
	showShareButton,
	onShare,
	onCopy,
	copied,
	copyError,
	actionButtonBaseClasses,
}: CodeBlockHeaderProps) {
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
						onClick={onShare}
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
					onClick={onCopy}
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
