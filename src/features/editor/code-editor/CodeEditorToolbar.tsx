'use client'

import { Button } from '@/shared/ui/design-system'
import { IoCheckmark } from 'react-icons/io5'
import {
	MdErrorOutline,
	MdOutlineContentCopy,
	MdOutlineContentPaste,
	MdOutlineInfo,
} from 'react-icons/md'
type CodeEditorToolbarProps = {
	copied: boolean
	readOnly: boolean
	formattingErrors: string[]
	onToggleErrorAccordion: () => void
	onCopy: () => void
	onPaste: () => void
	onOpenShortcuts: () => void
	shortcutsHint: string
}

export function CodeEditorToolbar({
	copied,
	readOnly,
	formattingErrors,
	onToggleErrorAccordion,
	onCopy,
	onPaste,
	onOpenShortcuts,
	shortcutsHint,
}: CodeEditorToolbarProps) {
	const hasErrors = formattingErrors.length > 0

	return (
		<div className="flex items-center gap-2">
			{hasErrors ? (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onToggleErrorAccordion}
					data-tooltip-id="app-tooltip"
					data-tooltip-content={`${formattingErrors.length} formatting error${formattingErrors.length > 1 ? 's' : ''}`}
					className="pointer-events-auto rounded-lg! px-3! py-2! text-lg! transition-all focus:ring-0 focus:outline-none bg-red-100! text-red-700! hover:bg-red-200! dark:bg-red-900/30! dark:text-red-400! dark:hover:bg-red-900/50!"
					aria-label="Show formatting errors"
				>
					<MdErrorOutline />
					<span className="ml-1 text-sm font-medium">
						{formattingErrors.length}
					</span>
				</Button>
			) : null}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={onPaste}
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
				onClick={onCopy}
				data-tooltip-id="app-tooltip"
				data-tooltip-content={copied ? 'Copied!' : 'Copy code'}
				className="pointer-events-auto rounded-lg! px-3! py-2! text-lg! transition-all focus:ring-0 focus:outline-none bg-gray-200! text-slate-700! hover:bg-gray-300! dark:bg-slate-800/90! dark:text-slate-200! dark:hover:bg-slate-800!"
				aria-label={copied ? 'Copied!' : 'Copy code to clipboard'}
			>
				{copied ? <IoCheckmark /> : <MdOutlineContentCopy />}
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				data-tooltip-id="app-tooltip"
				data-tooltip-content={shortcutsHint}
				onClick={onOpenShortcuts}
				className="pointer-events-auto rounded-lg! px-3! py-2! text-lg! transition-all focus:ring-0 focus:outline-none bg-gray-200! text-slate-700! hover:bg-gray-300! dark:bg-slate-800/90! dark:text-slate-200! dark:hover:bg-slate-800!"
				aria-label="Show editor shortcuts"
			>
				<MdOutlineInfo />
			</Button>
		</div>
	)
}
