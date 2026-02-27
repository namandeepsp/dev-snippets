'use client'

import { useAuthenticatedUser } from '@/features/auth/ui/store/auth.store'
import { CodeEditor } from '@/features/editor/CodeEditor'
import { formatCode } from '@/features/editor/formatter/formatter.registry'
import { snippetApiClient } from '@/features/snippets/snippet.client.container'
import { useRouter } from 'next/navigation'
import { type SubmitEvent, useState } from 'react'
import { TechnologyBadge } from './TechnologyBadge'

import type { EditorLanguage } from '@/features/editor/editor.config'
import type { CreateSnippetServiceInput } from '../core/repositories/snippet.repository'
import type {
	Snippet,
	SnippetCategory,
	SnippetTechnology,
	SnippetVisibility,
} from '../core/snippet.types'

import {
	CATEGORIES,
	TECHNOLOGY_OPTIONS,
} from '@/features/technologies/technologies.config'
import { TechnologyIcon } from '@/features/technologies/technology-icons'
import { Button, CustomSelect, Select, toast } from '@/shared/ui/design-system'
import { LuWandSparkles } from 'react-icons/lu'

const LANGUAGES: EditorLanguage[] = [
	'javascript',
	'typescript',
	'json',
	'html',
	'css',
	'go',
	'python',
	'markdown',
	'sql',
	'yaml',
]

type Props = {
	mode: 'create' | 'edit'
	snippet?: Snippet
}

export function SnippetForm({ mode, snippet }: Props) {
	const router = useRouter()
	const _user = useAuthenticatedUser()

	// Form state
	const [title, setTitle] = useState(snippet?.title ?? '')
	const [description, setDescription] = useState(snippet?.description ?? '')
	const [code, setCode] = useState(snippet?.code ?? '')
	const [language, setLanguage] = useState<EditorLanguage>(
		(snippet?.language as EditorLanguage) ?? 'javascript',
	)
	const [visibility, setVisibility] = useState<SnippetVisibility>(
		snippet?.visibility ?? 'private',
	)
	const [technologies, setTechnologies] = useState<SnippetTechnology[]>(
		snippet?.technologies ?? [],
	)
	const [categories, setCategories] = useState<SnippetCategory[]>(
		snippet?.categories ?? [],
	)
	const [techToAdd, setTechToAdd] = useState('')

	// UI state
	const [isSaving, setIsSaving] = useState(false)
	const [isFormatting, setIsFormatting] = useState(false)

	// Form validation
	const isValid = title.trim() && code.trim() && !isSaving

	async function handleFormatCode() {
		if (!code.trim()) return

		setIsFormatting(true)
		try {
			const formatted = await formatCode(code, language)
			setCode(formatted)
		} catch (err) {
			console.error('Formatting failed:', err)
		} finally {
			setIsFormatting(false)
		}
	}

	async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
		e.preventDefault()

		if (!isValid) return

		setIsSaving(true)

		try {
			const formattedCode = await formatCode(code, language)

			const input: CreateSnippetServiceInput = {
				title: title.trim(),
				description: description.trim() || undefined,
				code: formattedCode,
				language,
				technologies,
				categories,
				visibility,
			}

			if (mode === 'edit' && snippet) {
				await snippetApiClient.update(snippet.id, input)
				toast.success('Snippet updated successfully!')
				router.push(`/snippets/${snippet.id}`)
			} else {
				const newSnippet = await snippetApiClient.create(input)
				toast.success('Snippet created successfully!')
				router.push(`/snippets/${newSnippet.id}`)
			}

			router.refresh()
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : `Failed to ${mode} snippet`,
			)
		} finally {
			setIsSaving(false)
		}
	}

	function toggleTechnology(tech: SnippetTechnology) {
		setTechnologies((prev) =>
			prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech],
		)
	}

	function toggleCategory(cat: SnippetCategory) {
		setCategories((prev) =>
			prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
		)
	}

	function handleAddTechnology(value: string) {
		const tech = value as SnippetTechnology
		if (technologies.includes(tech)) return
		setTechnologies((prev) => [...prev, tech])
		setTechToAdd('')
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			{/* Title & Description */}
			<div className="space-y-4">
				<div>
					<label htmlFor="title" className="block mb-2 font-medium">
						Title <span className="text-red-500">*</span>
					</label>
					<input
						id="title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g., React useState Hook Example"
						className="w-full rounded-md border border-default bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-foreground/20"
						disabled={isSaving}
						required
					/>
				</div>

				<div>
					<label htmlFor="description" className="block mb-2 font-medium">
						Description
					</label>
					<textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Briefly describe what this snippet does..."
						rows={3}
						className="w-full rounded-md border border-default bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-foreground/20"
						disabled={isSaving}
					/>
				</div>
			</div>

			{/* Code Editor */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<label htmlFor="code" className="font-medium">
						Code <span className="text-red-500">*</span>
					</label>
					<div className="flex items-center gap-4">
						<Select
							value={language}
							onChange={(e) => setLanguage(e.target.value as EditorLanguage)}
							uiSize="sm"
							variant="default"
							disabled={isSaving}
						>
							{LANGUAGES.map((lang) => (
								<option key={lang} value={lang}>
									{lang}
								</option>
							))}
						</Select>

						<Button
							type="button"
							onClick={handleFormatCode}
							disabled={isFormatting || !code.trim()}
							size="sm"
							variant="glass"
							data-tooltip-id="app-tooltip"
							data-tooltip-content={
								isFormatting ? 'Formatting...' : 'Format code (Shift+Alt+F)'
							}
							className="min-w-[140px] border-white/45 bg-white/70 px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 hover:bg-white/90 dark:border-white/15 dark:bg-slate-900/45 dark:text-slate-100 dark:hover:bg-slate-900/70 max-[1024px]:min-w-[42px] max-[1024px]:px-2.5"
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
					value={code}
					onChange={setCode}
					language={language}
					placeholder="Paste your code here..."
					readOnly={isSaving}
					minHeight="300px"
					maxHeight="600px"
				/>
			</div>

			{/* Visibility */}
			<div>
				<label className="block mb-2 font-medium">Visibility</label>
				<div className="flex gap-4">
					{(['private', 'public', 'shared'] as const).map((v) => (
						<label key={v} className="flex items-center gap-2">
							<input
								type="radio"
								name="visibility"
								value={v}
								checked={visibility === v}
								onChange={(e) =>
									setVisibility(e.target.value as SnippetVisibility)
								}
								disabled={isSaving}
								className="rounded border-default text-foreground focus:ring-foreground/20"
							/>
							<span className="text-sm capitalize">{v}</span>
						</label>
					))}
				</div>
				<p className="mt-1 text-xs text-gray-500">
					{visibility === 'private' && 'Only you can view this snippet'}
					{visibility === 'public' && 'Anyone can view this snippet'}
					{visibility === 'shared' && 'Share with specific users (coming soon)'}
				</p>
			</div>

			{/* Technologies */}
			<div>
				<label className="block mb-2 font-medium">Technologies</label>
				<div className="space-y-3">
					<CustomSelect
						value={techToAdd}
						onChange={handleAddTechnology}
						placeholder="Add technology"
						disabled={isSaving}
						options={TECHNOLOGY_OPTIONS.map((tech) => ({
							value: tech.value,
							label: tech.label,
							icon: <TechnologyIcon technology={tech.iconKey} />,
							disabled: technologies.includes(tech.value),
						}))}
					/>
					<div className="flex flex-wrap gap-2">
						{technologies.map((tech) => {
							const techOption = TECHNOLOGY_OPTIONS.find(
								(option) => option.value === tech,
							)
							return (
								<Button
									key={tech}
									type="button"
									onClick={() => toggleTechnology(tech)}
									disabled={isSaving}
									size="sm"
									className="h-auto rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-none hover:opacity-90"
								>
									<span className="mr-1" aria-hidden>
										<TechnologyIcon technology={techOption?.iconKey ?? tech} />
									</span>
									{techOption?.label ?? tech}
									<span className="ml-1" aria-hidden>
										×
									</span>
								</Button>
							)
						})}
					</div>
				</div>
			</div>

			{/* Categories */}
			<div>
				<label className="block mb-2 font-medium">Categories</label>
				<div className="flex flex-wrap gap-2">
					{CATEGORIES.map((cat) => (
						<Button
							key={cat}
							type="button"
							onClick={() => toggleCategory(cat)}
							disabled={isSaving}
							size="sm"
							variant={categories.includes(cat) ? 'primary' : 'secondary'}
							className={`h-auto rounded-full px-3 py-1.5 text-xs font-medium transition ${
								categories.includes(cat)
									? 'bg-foreground text-background shadow-none'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
							}`}
						>
							{cat}
						</Button>
					))}
				</div>
			</div>

			{/* Preview */}
			{(technologies.length > 0 || categories.length > 0) && (
				<div className="rounded-md bg-gray-50 dark:bg-gray-900 p-4">
					<p className="text-sm font-medium mb-2">Selected:</p>
					<div className="flex flex-wrap gap-2">
						{technologies.map((tech) => (
							<TechnologyBadge key={tech} technology={tech} />
						))}
						{categories.map((cat) => (
							<span
								key={cat}
								className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
							>
								{cat}
							</span>
						))}
					</div>
				</div>
			)}

			{/* Actions */}
			<div className="flex items-center gap-4 pt-4">
				<Button
					type="submit"
					disabled={!isValid}
					isLoading={isSaving}
					size="md"
					className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 text-white shadow-lg shadow-blue-600/30 hover:from-sky-600 hover:to-blue-600"
				>
					{mode === 'edit' ? 'Update Snippet' : 'Create Snippet'}
				</Button>

				<Button
					type="button"
					onClick={() => router.back()}
					disabled={isSaving}
					variant="outline"
					size="md"
					className="border-gray-300 bg-white px-6 text-slate-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
				>
					Cancel
				</Button>
			</div>
		</form>
	)
}
