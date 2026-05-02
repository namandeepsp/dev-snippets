'use client'

import type { EditorLanguage } from '@/features/editor/editor.config'
import {
	EDITOR_LANGUAGES,
	SUPPORTED_LANGUAGES,
} from '@/features/editor/editor.config'
import { LANGUAGE_TO_PRIMARY_TECHNOLOGY } from '@/features/technologies/technologies.config'
import { TechnologyIcon } from '@/features/technologies/technology-icons'
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal'
import { Button, CustomSelect, toast } from '@/shared/ui/design-system'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { LuPlus, LuTrash2, LuWandSparkles } from 'react-icons/lu'
import { MdErrorOutline } from 'react-icons/md'
import type { SnippetFile } from '../core/snippet.types'

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

const LANGUAGE_OPTIONS = SUPPORTED_LANGUAGES.map((lang) => {
	const tech = LANGUAGE_TO_PRIMARY_TECHNOLOGY[lang]
	return {
		value: lang,
		label: EDITOR_LANGUAGES[lang].label,
		icon: tech ? (
			<TechnologyIcon technology={tech} className="h-4 w-4" />
		) : undefined,
	}
})

type SnippetFormFilesProps = {
	files: SnippetFile[]
	onFilesChange: (files: SnippetFile[]) => void
	isSaving: boolean
	isFormatting: boolean
	onSave?: () => void
	onLanguageDetected?: (language: EditorLanguage) => void
}

export function SnippetFormFiles({
	files,
	onFilesChange,
	isSaving,
	isFormatting,
	onSave,
	onLanguageDetected,
}: SnippetFormFilesProps) {
	const codeEditorRefs = useRef<Record<string, { format: () => void }>>({})
	const tabButtonsRef = useRef<Record<string, HTMLButtonElement | null>>({})
	const [activeFileId, setActiveFileId] = useState(files[0]?.id || '')
	const [fileToDelete, setFileToDelete] = useState<SnippetFile | null>(null)
	const [filenameErrors, setFilenameErrors] = useState<Record<string, string>>(
		{},
	)
	const [formatterErrors, setFormatterErrors] = useState<
		Record<string, string>
	>({})

	const activeFile = files.find((f) => f.id === activeFileId)
	const _codeEditorRef = useRef<{
		format: () => void
		clearErrors?: () => void
	} | null>(null)
	const detectedLanguageRef = useRef<EditorLanguage | null>(null)

	const handleCodeChange = (value: string) => {
		if (!activeFile) return
		onFilesChange(
			files.map((f) => (f.id === activeFile.id ? { ...f, code: value } : f)),
		)
		// Clear formatter error when user edits code
		if (formatterErrors[activeFileId]) {
			setFormatterErrors((prev) => {
				const updated = { ...prev }
				delete updated[activeFileId]
				return updated
			})
		}
	}

	const handleAddFile = () => {
		if (files.length >= 10) {
			toast.info('Maximum 10 files allowed per snippet')
			return
		}
		const newFile: SnippetFile = {
			id: `file-${Date.now()}`,
			filename: `untitled-${files.length + 1}.js`,
			language: 'javascript' as EditorLanguage,
			code: '',
			order: files.length,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		}
		const updated = [...files, newFile]
		onFilesChange(updated)
		setActiveFileId(newFile.id)
		setFilenameErrors({})
	}

	const handleRemoveFile = (fileId: string) => {
		if (files.length === 1) {
			alert('You must have at least one file')
			return
		}

		const file = files.find((f) => f.id === fileId)
		if (file && file.code.trim()) {
			setFileToDelete(file)
		} else {
			performDelete(fileId)
		}
	}

	const performDelete = (fileId: string) => {
		const updated = files.filter((f) => f.id !== fileId)
		onFilesChange(updated)
		if (activeFileId === fileId) {
			setActiveFileId(updated[0]?.id || '')
		}
		setFileToDelete(null)
		// Clear errors for deleted file
		setFormatterErrors((prev) => {
			const updated = { ...prev }
			delete updated[fileId]
			return updated
		})
		setFilenameErrors((prev) => {
			const updated = { ...prev }
			delete updated[fileId]
			return updated
		})
	}

	const getFileExtension = (language: EditorLanguage): string => {
		const extensions = EDITOR_LANGUAGES[language]?.extensions
		if (!extensions || extensions.length === 0) return 'txt'
		return extensions[0].replace('.', '')
	}

	const getFilenameWithoutExtension = (filename: string): string => {
		const lastDot = filename.lastIndexOf('.')
		return lastDot > 0 ? filename.substring(0, lastDot) : filename
	}

	const generateDefaultFilename = (language: EditorLanguage): string => {
		const ext = getFileExtension(language)
		let counter = 1
		let filename = `untitled-${counter}.${ext}`
		while (files.some((f) => f.filename === filename)) {
			counter++
			filename = `untitled-${counter}.${ext}`
		}
		return filename
	}

	const validateFilename = (nameWithoutExt: string, fileId: string): string => {
		if (!nameWithoutExt.trim()) {
			return 'Filename cannot be empty'
		}

		const file = files.find((f) => f.id === fileId)
		if (!file) return ''

		const ext = getFileExtension(file.language)
		const fullFilename = `${nameWithoutExt}.${ext}`

		const isDuplicate = files.some(
			(f) => f.id !== fileId && f.filename === fullFilename,
		)
		if (isDuplicate) {
			return `File "${fullFilename}" already exists`
		}

		return ''
	}

	const MAX_FILENAME_LENGTH = 50

	const handleFilenameChange = (fileId: string, nameWithoutExt: string) => {
		const file = files.find((f) => f.id === fileId)
		if (!file) return

		// Enforce max filename length
		if (nameWithoutExt.length > MAX_FILENAME_LENGTH) {
			nameWithoutExt = nameWithoutExt.slice(0, MAX_FILENAME_LENGTH)
		}

		const ext = getFileExtension(file.language)
		const filename = nameWithoutExt ? `${nameWithoutExt}.${ext}` : ''

		onFilesChange(files.map((f) => (f.id === fileId ? { ...f, filename } : f)))
		setFilenameErrors((prev) => {
			const updated = { ...prev }
			delete updated[fileId]
			return updated
		})
	}

	const handleFilenameBlur = (fileId: string) => {
		const file = files.find((f) => f.id === fileId)
		if (!file) return

		const nameWithoutExt = getFilenameWithoutExtension(file.filename)
		const error = validateFilename(nameWithoutExt, fileId)

		if (error) {
			setFilenameErrors((prev) => ({ ...prev, [fileId]: error }))
			// Auto-fix: generate default filename
			const defaultFilename = generateDefaultFilename(file.language)
			onFilesChange(
				files.map((f) =>
					f.id === fileId ? { ...f, filename: defaultFilename } : f,
				),
			)
			setFilenameErrors((prev) => {
				const updated = { ...prev }
				delete updated[fileId]
				return updated
			})
		}
	}

	const handleTabSwitch = (fileId: string) => {
		if (activeFileId === fileId) return

		const currentFile = files.find((f) => f.id === activeFileId)
		if (!currentFile) {
			setActiveFileId(fileId)
			return
		}

		const nameWithoutExt = getFilenameWithoutExtension(currentFile.filename)
		const error = validateFilename(nameWithoutExt, activeFileId)

		if (error) {
			setFilenameErrors((prev) => ({ ...prev, [activeFileId]: error }))
			// Auto-fix: generate default filename
			const defaultFilename = generateDefaultFilename(currentFile.language)
			onFilesChange(
				files.map((f) =>
					f.id === activeFileId ? { ...f, filename: defaultFilename } : f,
				),
			)
			setFilenameErrors((prev) => {
				const updated = { ...prev }
				delete updated[activeFileId]
				return updated
			})
		}

		setActiveFileId(fileId)
	}

	const handleTabKeyDown = (
		e: React.KeyboardEvent<HTMLButtonElement>,
		fileId: string,
	) => {
		if (e.key === 'ArrowRight') {
			e.preventDefault()
			const currentIndex = files.findIndex((f) => f.id === fileId)
			const nextIndex = (currentIndex + 1) % files.length
			const nextFileId = files[nextIndex]?.id
			if (nextFileId) {
				handleTabSwitch(nextFileId)
				setTimeout(() => {
					tabButtonsRef.current[nextFileId]?.focus()
				}, 0)
			}
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault()
			const currentIndex = files.findIndex((f) => f.id === fileId)
			const prevIndex = currentIndex === 0 ? files.length - 1 : currentIndex - 1
			const prevFileId = files[prevIndex]?.id
			if (prevFileId) {
				handleTabSwitch(prevFileId)
				setTimeout(() => {
					tabButtonsRef.current[prevFileId]?.focus()
				}, 0)
			}
		}
	}

	const handleLanguageChange = (fileId: string, language: EditorLanguage) => {
		const file = files.find((f) => f.id === fileId)
		if (!file) return
		const ext = getFileExtension(language)
		const nameWithoutExt = getFilenameWithoutExtension(file.filename)
		const newFilename = nameWithoutExt
			? `${nameWithoutExt}.${ext}`
			: `untitled.${ext}`
		onFilesChange(
			files.map((f) =>
				f.id === fileId ? { ...f, language, filename: newFilename } : f,
			),
		)
		setFilenameErrors((prev) => {
			const updated = { ...prev }
			delete updated[fileId]
			return updated
		})
	}

	const handleFormatError = (error: string) => {
		setFormatterErrors((prev) => ({
			...prev,
			[activeFileId]: error,
		}))
	}

	// Sync detected language to file state
	useEffect(() => {
		if (
			detectedLanguageRef.current &&
			activeFile &&
			detectedLanguageRef.current !== activeFile.language
		) {
			handleLanguageChange(activeFile.id, detectedLanguageRef.current)
			detectedLanguageRef.current = null
		}
	}, [activeFile?.code])

	const modifierStateRef = useRef({ ctrl: false, alt: false, shift: false })

	// Global keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement
			const isInput =
				target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

			// Track modifier keys
			if (e.key === 'Control' || e.key === 'Meta')
				modifierStateRef.current.ctrl = true
			if (e.key === 'Alt') modifierStateRef.current.alt = true
			if (e.key === 'Shift') modifierStateRef.current.shift = true

			// Ctrl+Shift+Right/Left for tab switching
			if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
				if (e.key === 'ArrowRight') {
					e.preventDefault()
					const currentIndex = files.findIndex((f) => f.id === activeFileId)
					const nextIndex = (currentIndex + 1) % files.length
					const nextFileId = files[nextIndex]?.id
					if (nextFileId) handleTabSwitch(nextFileId)
					return
				} else if (e.key === 'ArrowLeft') {
					e.preventDefault()
					const currentIndex = files.findIndex((f) => f.id === activeFileId)
					const prevIndex =
						currentIndex === 0 ? files.length - 1 : currentIndex - 1
					const prevFileId = files[prevIndex]?.id
					if (prevFileId) handleTabSwitch(prevFileId)
					return
				}
			}
			// Ctrl+Alt+N for adding new file (using tracked modifier state)
			if (
				!isInput &&
				modifierStateRef.current.ctrl &&
				modifierStateRef.current.alt &&
				e.code === 'KeyN'
			) {
				e.preventDefault()
				handleAddFile()
			}
			// Ctrl+Alt+D for deleting current file (using tracked modifier state)
			if (
				!isInput &&
				modifierStateRef.current.ctrl &&
				modifierStateRef.current.alt &&
				e.code === 'KeyD'
			) {
				e.preventDefault()
				if (files.length > 1) {
					handleRemoveFile(activeFileId)
				}
			}
		}

		const handleKeyUp = (e: KeyboardEvent) => {
			// Reset modifier keys on key up
			if (e.key === 'Control' || e.key === 'Meta')
				modifierStateRef.current.ctrl = false
			if (e.key === 'Alt') modifierStateRef.current.alt = false
			if (e.key === 'Shift') modifierStateRef.current.shift = false
		}

		window.addEventListener('keydown', handleKeyDown, true)
		window.addEventListener('keyup', handleKeyUp, true)
		return () => {
			window.removeEventListener('keydown', handleKeyDown, true)
			window.removeEventListener('keyup', handleKeyUp, true)
		}
	}, [activeFileId, files])

	return (
		<div className="space-y-4">
			<label className="font-medium">
				Files <span className="text-red-500">*</span>
			</label>

			{/* File Tabs and Format Button */}
			<div className="flex items-center justify-between gap-2 bg-gray-100/50 dark:bg-slate-800/50 rounded-lg border border-gray-200/50 dark:border-slate-700 p-1">
				<div className="flex gap-1 overflow-x-auto flex-1">
					<div className="flex gap-1 overflow-x-auto">
						{files.map((file) => {
							const tech = LANGUAGE_TO_PRIMARY_TECHNOLOGY[file.language]
							const hasError = !!formatterErrors[file.id]
							const isActive = activeFileId === file.id
							return (
								<Button
									key={file.id}
									type="button"
									ref={(el) => {
										if (el) tabButtonsRef.current[file.id] = el as any
									}}
									onClick={(e) => {
										e.preventDefault()
										handleTabSwitch(file.id)
									}}
									onKeyDown={(e) => handleTabKeyDown(e as any, file.id)}
									variant="ghost"
									size="sm"
									className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all shrink-0 truncate focus:outline-none focus:ring-0 ${
										isActive
											? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-md'
											: 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50'
									}`}
									data-tooltip-id="app-tooltip"
									data-tooltip-content={file.filename?.split('.')[0]}
								>
									{tech && (
										<TechnologyIcon technology={tech} className="h-4 w-4" />
									)}
									<span className="inline-block max-w-25 truncate">
										{file.filename?.split('.')[0]}
									</span>
									<span>.{file.filename?.split('.')[1]}</span>
									{hasError && (
										<MdErrorOutline className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
									)}
								</Button>
							)
						})}
					</div>
					<Button
						type="button"
						onClick={handleAddFile}
						disabled={isSaving}
						variant="ghost"
						size="sm"
						data-tooltip-id="app-tooltip"
						data-tooltip-content={
							files.length >= 10
								? 'Maximum 10 files per snippet'
								: 'Add file (Ctrl+Alt+N)'
						}
						className="shrink-0 px-2 py-1.5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md transition-all"
					>
						<LuPlus className="h-4 w-4" />
					</Button>
				</div>

				<div className="flex items-center gap-2">
					<Button
						type="button"
						onClick={() => codeEditorRefs.current[activeFileId]?.format()}
						disabled={isFormatting || !activeFile?.code.trim()}
						size="sm"
						variant="ghost"
						data-tooltip-id="app-tooltip"
						data-tooltip-content={
							isFormatting ? 'Formatting...' : 'Format code (Shift+Alt+F)'
						}
						className="shrink-0 px-2 py-1.5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md transition-all sm:px-3 sm:gap-2 sm:flex sm:items-center"
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
						<span className="hidden sm:inline text-sm font-medium">Format</span>
					</Button>
				</div>
			</div>

			{/* Active File Editor */}
			{activeFile && (
				<div className="space-y-3">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="flex flex-col gap-1 flex-1">
							<div className="flex items-center gap-2">
								<input
									type="text"
									value={getFilenameWithoutExtension(activeFile.filename)}
									onChange={(e) =>
										handleFilenameChange(activeFile.id, e.target.value)
									}
									onBlur={() => handleFilenameBlur(activeFile.id)}
									placeholder="Filename"
									disabled={isSaving}
									maxLength={MAX_FILENAME_LENGTH}
									className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 flex-1 sm:max-w-48"
								/>
								<span className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
									.{getFileExtension(activeFile.language)}
								</span>
							</div>
							{filenameErrors[activeFile.id] && (
								<p className="text-xs text-red-500 dark:text-red-400">
									{filenameErrors[activeFile.id]}
								</p>
							)}
						</div>
						<div className="flex gap-3">
							<CustomSelect
								value={activeFile.language}
								onChange={(value) =>
									handleLanguageChange(activeFile.id, value as EditorLanguage)
								}
								placeholder="Select language"
								searchable
								searchPlaceholder="Filter languages..."
								disabled={isSaving}
								options={LANGUAGE_OPTIONS}
							/>
							{files.length > 1 && (
								<Button
									type="button"
									onClick={() => handleRemoveFile(activeFile.id)}
									disabled={isSaving}
									variant="ghost"
									size="sm"
									data-tooltip-id="app-tooltip"
									data-tooltip-content="Delete file (Ctrl+Alt+D)"
									className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
								>
									<LuTrash2 className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>

					<CodeEditor
						ref={(el) => {
							if (el) codeEditorRefs.current[activeFile.id] = el
						}}
						value={activeFile.code}
						onChange={handleCodeChange}
						language={activeFile.language}
						onLanguageDetected={(detectedLanguage) => {
							detectedLanguageRef.current = detectedLanguage
							onLanguageDetected?.(detectedLanguage)
						}}
						onSave={onSave}
						onFormatError={handleFormatError}
						initialErrors={
							formatterErrors[activeFile.id]
								? [formatterErrors[activeFile.id]]
								: undefined
						}
						placeholder="Paste your code here..."
						readOnly={isSaving}
						minHeight="300px"
						maxHeight="600px"
					/>
				</div>
			)}

			<ConfirmationModal
				open={fileToDelete !== null}
				onClose={() => setFileToDelete(null)}
				title="Delete File"
				description={`Are you sure you want to delete "${fileToDelete?.filename}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={() => {
					if (fileToDelete) {
						performDelete(fileToDelete.id)
					}
				}}
				isLoading={isSaving}
			/>
		</div>
	)
}
