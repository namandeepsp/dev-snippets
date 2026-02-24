'use client'

import { useAuthenticatedUser } from '@/features/auth/ui/store/auth.store'
import { formatCode } from '@/features/editor/formatter/formatter.registry'
import { snippetApiClient } from '@/features/snippets/snippet.client.container'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { TechnologyBadge } from './TechnologyBadge'

import type { EditorLanguage } from '@/features/editor/editor.config'
import type { CreateSnippetServiceInput } from '../core/repositories/snippet.repository'
import type {
	SnippetCategory,
	SnippetTechnology,
	SnippetVisibility,
} from '../core/snippet.types'

import {
	CATEGORIES,
	TECHNOLOGY_OPTIONS,
} from '@/features/technologies/technologies.config'
import { TechnologyIcon } from '@/features/technologies/technology-icons'
import { CustomSelect, Select } from '@/shared/ui/design-system'

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

/**
 * ============================================================================
 * CREATE SNIPPET FORM
 * ============================================================================
 *
 * Client Component for creating new snippets.
 *
 * Why Client Component?
 * - Form state - Need useState for form inputs
 * - Authentication - Uses useAuthenticatedUser hook
 * - Client-side formatting - Prettier runs in browser
 * - API client - Uses the configured API client (serverless or REST)
 */

export function CreateSnippetForm() {
	const router = useRouter()
	const _user = useAuthenticatedUser() // Throws if not authenticated

	// Form state
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [code, setCode] = useState('')
	const [language, setLanguage] = useState<EditorLanguage>('javascript')
	const [visibility, setVisibility] = useState<SnippetVisibility>('private')
	const [technologies, setTechnologies] = useState<SnippetTechnology[]>([])
	const [categories, setCategories] = useState<SnippetCategory[]>([])
	const [techToAdd, setTechToAdd] = useState('')

	// UI state
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
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
			// Don't show error to user - formatting is optional
			console.error('Formatting failed:', err)
		} finally {
			setIsFormatting(false)
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!isValid) return

		setIsSaving(true)
		setError(null)

		try {
			// Format code before saving
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

			const snippet = await snippetApiClient.create(input)

			// Redirect to the new snippet
			router.push(`/snippets/${snippet.id}`)
			router.refresh() // Refresh server components
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create snippet')
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
			{/* Error Message */}
			{error && (
				<div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-400">
					{error}
				</div>
			)}

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
						{/* Language Selector */}
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

						{/* Format Button */}
						<button
							type="button"
							onClick={handleFormatCode}
							disabled={isFormatting || !code.trim()}
							className="text-sm text-gray-500 hover:text-foreground disabled:opacity-50 transition"
						>
							{isFormatting ? 'Formatting...' : 'Format Code'}
						</button>
					</div>
				</div>

				<textarea
					id="code"
					value={code}
					onChange={(e) => setCode(e.target.value)}
					placeholder="Paste your code here..."
					rows={12}
					className="w-full rounded-md border border-default bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
					disabled={isSaving}
					required
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
								<button
									key={tech}
									type="button"
									onClick={() => toggleTechnology(tech)}
									disabled={isSaving}
									className="rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
								>
									<span className="mr-1" aria-hidden>
										<TechnologyIcon technology={techOption?.iconKey ?? tech} />
									</span>
									{techOption?.label ?? tech}
									<span className="ml-1" aria-hidden>
										×
									</span>
								</button>
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
						<button
							key={cat}
							type="button"
							onClick={() => toggleCategory(cat)}
							disabled={isSaving}
							className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
								categories.includes(cat)
									? 'bg-foreground text-background'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
							}`}
						>
							{cat}
						</button>
					))}
				</div>
			</div>

			{/* Preview - Show selected items */}
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
				<button
					type="submit"
					disabled={!isValid}
					className="rounded-md bg-foreground px-6 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
				>
					{isSaving ? 'Creating...' : 'Create Snippet'}
				</button>

				<button
					type="button"
					onClick={() => router.back()}
					disabled={isSaving}
					className="rounded-md border border-default px-6 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition"
				>
					Cancel
				</button>
			</div>
		</form>
	)
}
