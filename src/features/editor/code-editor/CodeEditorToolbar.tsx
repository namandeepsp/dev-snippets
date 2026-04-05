'use client'

import { Button } from '@/shared/ui/design-system'
import { IoCheckmark } from 'react-icons/io5'
import {
	MdErrorOutline,
	MdOutlineContentCopy,
	MdOutlineContentPaste,
	MdOutlineInfo,
	MdOutlineRedo,
	MdOutlineUndo,
} from 'react-icons/md'
type CodeEditorToolbarProps = {
	copied: boolean
	readOnly: boolean
	canUndo: boolean
	canRedo: boolean
	isEditorEmpty: boolean
	formattingErrors: string[]
	onToggleErrorAccordion: () => void
	onUndo: () => void
	onRedo: () => void
	onCopy: () => void
	onPaste: () => void
	onOpenShortcuts: () => void
	shortcutsHint: string
}

export function CodeEditorToolbar({
	copied,
	readOnly,
	canUndo,
	canRedo,
	isEditorEmpty,
	formattingErrors,
	onToggleErrorAccordion,
	onUndo,
	onRedo,
	onCopy,
	onPaste,
	onOpenShortcuts,
	shortcutsHint,
}: CodeEditorToolbarProps) {
	const hasErrors = formattingErrors.length > 0

	return (
		<div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-2">
			<div className="relative flex flex-nowrap items-center gap-1.5 overflow-x-auto pr-6 sm:overflow-visible sm:pr-0">
				{hasErrors ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onToggleErrorAccordion}
						data-tooltip-id="app-tooltip"
						data-tooltip-content={`${formattingErrors.length} formatting error${formattingErrors.length > 1 ? 's' : ''}`}
						className="pointer-events-auto rounded-lg! px-2! py-1.5! text-base! transition-all focus:outline-none focus:ring-0 bg-red-500/20! text-red-200! hover:bg-red-500/30! sm:px-3! sm:py-2! sm:text-lg!"
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
					className="pointer-events-auto hidden max-[850px]:flex rounded-lg! px-2! py-1.5! text-base! text-slate-100! transition-all focus:outline-none focus:ring-0 bg-white/10! hover:bg-white/20! disabled:opacity-50 sm:px-3! sm:py-2! sm:text-lg!"
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
					disabled={isEditorEmpty}
					className="pointer-events-auto rounded-lg! px-2! py-1.5! text-base! text-slate-100! transition-all focus:outline-none focus:ring-0 bg-white/10! hover:bg-white/20! disabled:opacity-50 sm:px-3! sm:py-2! sm:text-lg!"
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
					className="pointer-events-auto rounded-lg! px-2! py-1.5! text-base! text-slate-100! transition-all focus:outline-none focus:ring-0 bg-white/10! hover:bg-white/20! sm:px-3! sm:py-2! sm:text-lg!"
					aria-label="Show editor shortcuts"
				>
					<MdOutlineInfo />
				</Button>
				<div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#303841] to-transparent sm:hidden dark:from-[#1E1E1E]" />
			</div>
			<div className="flex items-center gap-1.5 sm:gap-2">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onUndo}
					disabled={readOnly || !canUndo}
					data-tooltip-id="app-tooltip"
					data-tooltip-content="Undo"
					className="pointer-events-auto rounded-lg! px-2! py-1.5! text-base! text-slate-100! transition-all focus:outline-none focus:ring-0 bg-white/10! hover:bg-white/20! disabled:opacity-50 sm:px-3! sm:py-2! sm:text-lg!"
					aria-label="Undo"
				>
					<MdOutlineUndo />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onRedo}
					disabled={readOnly || !canRedo}
					data-tooltip-id="app-tooltip"
					data-tooltip-content="Redo"
					className="pointer-events-auto rounded-lg! px-2! py-1.5! text-base! text-slate-100! transition-all focus:outline-none focus:ring-0 bg-white/10! hover:bg-white/20! disabled:opacity-50 sm:px-3! sm:py-2! sm:text-lg!"
					aria-label="Redo"
				>
					<MdOutlineRedo />
				</Button>
			</div>
		</div>
	)
}
