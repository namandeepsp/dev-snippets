'use client'

import type { EditorLanguage } from '@/features/editor/editor.config'
import { TECHNOLOGY_OPTIONS } from '@/features/technologies/technologies.config'
import { TechnologyIcon } from '@/features/technologies/technology-icons'
import { Button, CustomSelect } from '@/shared/ui/design-system'
import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import { LuWandSparkles } from 'react-icons/lu'
import type { SnippetTechnology } from '../core/snippet.types'

const CodeEditor = dynamic(
	() =>
		import('@/features/editor/CodeEditor').then((mod) => ({
			default: mod.CodeEditor,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="min-h-75 rounded-xl border-2 border-gray-200 bg-[#303841] dark:border-gray-700 dark:bg-[#1E1E1E]" />
		),
	},
)

type SnippetFormCodeEditorProps = {
	primaryTechnology?: SnippetTechnology
	onTechSelected: (technology: SnippetTechnology) => void
	code: string
	onCodeChange: (value: string) => void
	formatterLanguage: EditorLanguage
	onLanguageDetected: (detected: EditorLanguage) => void
	isSaving: boolean
	isFormatting: boolean
}

export function SnippetFormCodeEditor({
	primaryTechnology,
	onTechSelected,
	code,
	onCodeChange,
	formatterLanguage,
	onLanguageDetected,
	isSaving,
	isFormatting,
}: SnippetFormCodeEditorProps) {
	const codeEditorRef = useRef<{ format: () => void }>(null)
	const [detectionState, setDetectionState] = useState(false)

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<label htmlFor="code" className="font-medium">
					Code <span className="text-red-500">*</span>
				</label>
				<div className="flex items-center gap-4 w-full max-w-[320px]">
					<div className="relative flex-1">
						<CustomSelect
							value={primaryTechnology || 'javascript'}
							onChange={(selectedTech) =>
								onTechSelected(selectedTech as SnippetTechnology)
							}
							placeholder="Select primary technology"
							searchable
							searchPlaceholder="Filter technologies..."
							disabled={isSaving}
							options={TECHNOLOGY_OPTIONS.map((tech) => ({
								value: tech.value,
								label: tech.label,
								icon: <TechnologyIcon technology={tech.iconKey} />,
							}))}
						/>
						{detectionState && (
							<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
								<svg
									className="h-4 w-4 animate-spin text-blue-500"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									/>
								</svg>
							</div>
						)}
					</div>

					<Button
						type="button"
						onClick={() => codeEditorRef.current?.format()}
						disabled={isFormatting || !code.trim()}
						size="sm"
						variant="glass"
						data-tooltip-id="app-tooltip"
						data-tooltip-content={
							isFormatting ? 'Formatting...' : 'Format code (Shift+Alt+F)'
						}
						className="min-w-35 border-white/45 bg-white/70 px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 hover:bg-white/90 dark:border-white/15 dark:bg-slate-900/45 dark:text-slate-100 dark:hover:bg-slate-900/70 max-[1024px]:min-w-10.5 max-[1024px]:px-2.5"
					>
						{isFormatting ? (
							<svg
								className="h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								/>
							</svg>
						) : (
							<LuWandSparkles className="h-4 w-4" />
						)}
						<span className="max-[1024px]:hidden">
							{isFormatting ? 'Formatting' : 'Format Code'}
						</span>
					</Button>
				</div>
			</div>

			<CodeEditor
				ref={codeEditorRef}
				value={code}
				onChange={onCodeChange}
				language={formatterLanguage}
				onLanguageDetected={onLanguageDetected}
				onDetectingChange={setDetectionState}
				placeholder="Paste your code here..."
				readOnly={isSaving}
				minHeight="300px"
				maxHeight="600px"
			/>
		</div>
	)
}
