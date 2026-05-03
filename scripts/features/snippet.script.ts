import { fileURLToPath } from 'node:url'
import type {
	CreateSnippetServiceInput,
	SnippetVisibility,
	UpdateSnippetServiceInput,
} from '../../src/features/snippets/core/repositories/snippet.repository'
import { SnippetService } from '../../src/features/snippets/core/snippet.service'
import { SnippetVersionService } from '../../src/features/snippets/core/snippet.version-service'
import { FirebaseSnippetRepository } from '../../src/features/snippets/infra/repositories/firebase-snippet.repository'
import { BaseScript } from '../core/base.script'

const DEFAULT_BULK_SNIPPET_COUNT = 20

type SnippetTemplate = {
	title: string
	description: string
	files: Array<{ filename: string; language: string; code: string }>
	technologies: CreateSnippetServiceInput['technologies']
	categories: CreateSnippetServiceInput['categories']
}

const USEFUL_SNIPPET_TEMPLATES: SnippetTemplate[] = [
	{
		title: 'React Debounced Search Hook',
		description:
			'Debounce input changes to reduce API calls in searchable UIs.',
		files: [
			{
				filename: 'useDebouncedValue.ts',
				language: 'typescript',
				code: `import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay = 300) {
	const [debounced, setDebounced] = useState(value)

	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delay)
		return () => clearTimeout(id)
	}, [value, delay])

	return debounced
}`,
			},
		],
		technologies: ['react', 'typescript'],
		categories: ['frontend', 'hooks'],
	},
	{
		title: 'Express Rate Limit Middleware',
		description: 'Simple in-memory rate limiter for API endpoints.',
		files: [
			{
				filename: 'rateLimit.js',
				language: 'javascript',
				code: `const requests = new Map()

export function rateLimit(windowMs = 60_000, max = 100) {
	return (req, res, next) => {
		const key = req.ip
		const now = Date.now()
		const entry = requests.get(key) || { count: 0, resetAt: now + windowMs }

		if (now > entry.resetAt) {
			entry.count = 0
			entry.resetAt = now + windowMs
		}

		entry.count += 1
		requests.set(key, entry)

		if (entry.count > max) {
			return res.status(429).json({ error: 'Too many requests' })
		}

		next()
	}
}`,
			},
		],
		technologies: ['express', 'node'],
		categories: ['backend', 'middleware'],
	},
	{
		title: 'PostgreSQL Upsert Pattern',
		description:
			'Insert a row or update selected columns when a conflict occurs.',
		files: [
			{
				filename: 'upsert.sql',
				language: 'sql',
				code: `INSERT INTO user_settings (user_id, theme, timezone, updated_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (user_id)
DO UPDATE SET
	theme = EXCLUDED.theme,
	timezone = EXCLUDED.timezone,
	updated_at = NOW();`,
			},
		],
		technologies: ['sql', 'postgres-sql'],
		categories: ['database', 'queries'],
	},
	{
		title: 'Docker Multi-Stage Node Build',
		description: 'Lean production image using dependency and runtime stages.',
		files: [
			{
				filename: 'Dockerfile',
				language: 'dockerfile',
				code: `FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["pnpm", "start"]`,
			},
		],
		technologies: ['docker', 'dev-ops'],
		categories: ['infrastructure', 'deployment'],
	},
	{
		title: 'Python Sliding Window Maximum Sum',
		description:
			'Find the maximum sum of any contiguous subarray of fixed length.',
		files: [
			{
				filename: 'sliding_window.py',
				language: 'python',
				code: `def max_window_sum(nums, k):
    if k <= 0 or k > len(nums):
        return None

    window_sum = sum(nums[:k])
    best = window_sum

    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        best = max(best, window_sum)

    return best`,
			},
		],
		technologies: ['python'],
		categories: ['algorithms', 'data-structures'],
	},
	{
		title: 'Next.js Server Action Form Handler',
		description:
			'Validate form input in a server action and return typed field errors.',
		files: [
			{
				filename: 'actions.ts',
				language: 'typescript',
				code: `'use server'

export async function submitFeedback(_: unknown, formData: FormData) {
	const message = String(formData.get('message') || '').trim()

	if (message.length < 10) {
		return { ok: false, error: 'Message must be at least 10 characters.' }
	}

	// Persist to DB here
	return { ok: true }
}`,
			},
		],
		technologies: ['nextjs', 'typescript'],
		categories: ['framework', 'frontend'],
	},
]

export class SnippetScript extends BaseScript {
	name = 'Snippet Tests'

	private snippetId?: string
	private ownerId = `test-owner-${Date.now()}`
	private ownerName = 'Script Snippet Owner'
	private snippetRepository = new FirebaseSnippetRepository()
	private snippetService = new SnippetService(
		this.snippetRepository,
		this.snippetRepository,
	)
	private versionService = new SnippetVersionService(this.snippetRepository)

	async run(): Promise<void> {
		await this.ensureReady()
		this.log('Running snippet tests...')

		await this.testCreateSnippet()
		await this.testCreateBulkSnippets()
		await this.testListPublicSnippets()
		await this.testGetSnippetById()
		await this.testListByUser()
		await this.testListByVisibility()
		await this.testSearchSnippets()
		await this.testFilterByTechnology()
		await this.testFilterByCategory()
		await this.testLikeSnippet()
		await this.testDislikeSnippet()
		await this.testGetSeenCount()
		await this.testUpdateSnippet()
		await this.testCreateMultipleVersions()
		await this.testGetVersionHistory()
		await this.testGetVersionDetail()
		await this.testRestoreVersion()
		await this.testRestoreVersionCreatesNewVersion()
		await this.testDeleteSnippet()

		this.logSuccess('All snippet tests passed')
	}

	async testCreateSnippet(): Promise<void> {
		const randomSnippet = this.buildUsefulRandomSnippet()
		const snippet = await this.snippetService.createSnippet(
			randomSnippet,
			this.ownerId,
			this.ownerName,
		)

		if (!snippet.id || snippet.title !== randomSnippet.title) {
			throw new Error('Create snippet failed')
		}

		this.snippetId = snippet.id
		// Small delay to ensure Firestore persistence
		await new Promise((resolve) => setTimeout(resolve, 100))
		this.log('✓ Create snippet')
	}

	async testCreateBulkSnippets(
		count = DEFAULT_BULK_SNIPPET_COUNT,
	): Promise<void> {
		const visibilities: SnippetVisibility[] = ['public', 'private', 'shared']
		let created = 0

		for (let i = 0; i < count; i += 1) {
			const snippet = this.buildUsefulRandomSnippet(i + 1)
			snippet.visibility = visibilities[i % visibilities.length]

			await this.snippetService.createSnippet(
				snippet,
				this.ownerId,
				this.ownerName,
			)
			created += 1
		}

		this.log(`✓ Bulk create snippets (${created} created)`)
	}

	async testListPublicSnippets(): Promise<void> {
		const snippets = await this.snippetService.listPublic()

		if (!Array.isArray(snippets)) {
			throw new Error('List public snippets failed')
		}

		this.log(`✓ List public snippets (${snippets.length} found)`)
	}

	async testGetSnippetById(): Promise<void> {
		if (!this.snippetId) {
			throw new Error('Get snippet by ID failed (missing test snippet)')
		}

		const snippet = await this.snippetService.getById(this.snippetId)

		if (!snippet) {
			throw new Error('Get snippet by ID failed')
		}

		this.log('✓ Get snippet by ID')
	}

	async testListByUser(): Promise<void> {
		const snippets = await this.snippetService.listByUser(this.ownerId)

		if (!Array.isArray(snippets)) {
			throw new Error('List snippets by user failed')
		}

		this.log(`✓ List snippets by user (${snippets.length} found)`)
	}

	async testListByVisibility(): Promise<void> {
		const snippets = await this.snippetService.listByVisibility('public')

		if (!Array.isArray(snippets)) {
			throw new Error('List snippets by visibility failed')
		}

		this.log(`✓ List snippets by visibility (${snippets.length} found)`)
	}

	async testSearchSnippets(): Promise<void> {
		const snippets = await this.snippetService.search('React')

		if (!Array.isArray(snippets)) {
			throw new Error('Search snippets failed')
		}

		this.log(`✓ Search snippets (${snippets.length} found)`)
	}

	async testFilterByTechnology(): Promise<void> {
		const snippets = await this.snippetService.filterByTechnology('react')

		if (!Array.isArray(snippets)) {
			throw new Error('Filter by technology failed')
		}

		this.log(`✓ Filter by technology (${snippets.length} found)`)
	}

	async testFilterByCategory(): Promise<void> {
		const snippets = await this.snippetService.filterByCategory('frontend')

		if (!Array.isArray(snippets)) {
			throw new Error('Filter by category failed')
		}

		this.log(`✓ Filter by category (${snippets.length} found)`)
	}

	async testLikeSnippet(): Promise<void> {
		if (!this.snippetId) {
			throw new Error('Like snippet failed (missing test snippet)')
		}

		const userId = `test-user-${Date.now()}`
		await this.snippetService.likeSnippet(this.snippetId, userId)

		this.log('✓ Like snippet')
	}

	async testDislikeSnippet(): Promise<void> {
		if (!this.snippetId) {
			throw new Error('Dislike snippet failed (missing test snippet)')
		}

		const userId = `test-user-${Date.now()}`
		await this.snippetService.dislikeSnippet(this.snippetId, userId)

		this.log('✓ Dislike snippet')
	}

	async testGetSeenCount(): Promise<void> {
		if (!this.snippetId) {
			throw new Error('Get views count failed (missing test snippet)')
		}

		const snippet = await this.snippetService.getById(this.snippetId)

		if (!snippet) {
			throw new Error('Snippet not found')
		}

		const viewsCount = snippet.viewsCount ?? 0
		this.log(`✓ Get views count (${viewsCount} views)`)
	}

	async testUpdateSnippet(): Promise<void> {
		if (!this.snippetId) {
			throw new Error('Update snippet failed (missing test snippet)')
		}

		const updateInput: UpdateSnippetServiceInput = { title: 'Updated Title' }

		await this.snippetService.updateSnippet(
			this.snippetId,
			updateInput,
			this.ownerId,
		)

		this.log('✓ Update snippet')
	}

	async testDeleteSnippet(): Promise<void> {
		if (!this.snippetId) {
			throw new Error('Delete snippet failed (missing test snippet)')
		}

		await this.snippetService.deleteSnippet(this.snippetId, this.ownerId)

		this.log('✓ Delete snippet')
	}

	async testGetVersionHistory(): Promise<void> {
		if (!this.snippetId) {
			throw new Error('Get version history failed (missing test snippet)')
		}

		const versions = await this.versionService.getVersionHistory(
			this.snippetId,
			this.ownerId,
		)

		if (!Array.isArray(versions)) {
			throw new Error('Get version history failed')
		}

		if (versions.length === 0) {
			throw new Error('Version history should have at least one version')
		}

		this.log(`✓ Get version history (${versions.length} versions found)`)
	}

	async testRestoreVersion(): Promise<void> {
		if (!this.snippetId) {
			throw new Error('Restore version failed (missing test snippet)')
		}

		// Get initial versions
		const initialVersions = await this.versionService.getVersionHistory(
			this.snippetId,
			this.ownerId,
		)

		if (initialVersions.length === 0) {
			throw new Error('No versions found')
		}

		// Make an update to files to create a new version
		const snippet = await this.snippetService.getById(this.snippetId)
		if (!snippet) {
			throw new Error('Snippet not found')
		}

		const updatedFiles = snippet.files.map((f) => ({
			...f,
			code: f.code + '\n// Updated for version test',
		}))

		const updateInput: UpdateSnippetServiceInput = {
			files: updatedFiles,
		}

		await this.snippetService.updateSnippet(
			this.snippetId,
			updateInput,
			this.ownerId,
		)

		// Small delay to ensure version is persisted
		await new Promise((resolve) => setTimeout(resolve, 200))

		// Get current versions
		const versions = await this.versionService.getVersionHistory(
			this.snippetId,
			this.ownerId,
		)

		if (versions.length < 2) {
			this.log(
				`⊘ Restore version skipped (only ${versions.length} version available)`,
			)
			return
		}

		// Restore to first version
		const firstVersion = versions[0]
		await this.versionService.restoreVersion(
			this.snippetId,
			firstVersion.version,
			this.ownerId,
		)

		// Verify restoration
		const restoredSnippet = await this.snippetService.getById(this.snippetId)
		if (!restoredSnippet) {
			throw new Error('Snippet not found after restore')
		}

		if (restoredSnippet.files[0]?.code !== firstVersion.files[0]?.code) {
			throw new Error('Restored code does not match original version')
		}

		this.log('✓ Restore version')
	}

	async testCreateMultipleVersions(): Promise<void> {
		if (!this.snippetId) {
			throw new Error('Create multiple versions failed (missing test snippet)')
		}

		const snippet = await this.snippetService.getById(this.snippetId)
		if (!snippet) {
			throw new Error('Snippet not found')
		}

		// Create version 2
		const v2Files = snippet.files.map((f) => ({
			...f,
			code: f.code + '\n// Version 2 changes',
		}))

		await this.snippetService.updateSnippet(
			this.snippetId,
			{ files: v2Files },
			this.ownerId,
		)

		await new Promise((resolve) => setTimeout(resolve, 100))

		// Create version 3
		const v3Files = v2Files.map((f) => ({
			...f,
			code: f.code + '\n// Version 3 changes',
		}))

		await this.snippetService.updateSnippet(
			this.snippetId,
			{ files: v3Files },
			this.ownerId,
		)

		await new Promise((resolve) => setTimeout(resolve, 100))

		// Create version 4
		const v4Files = v3Files.map((f) => ({
			...f,
			code: f.code + '\n// Version 4 changes',
		}))

		await this.snippetService.updateSnippet(
			this.snippetId,
			{ files: v4Files },
			this.ownerId,
		)

		await new Promise((resolve) => setTimeout(resolve, 100))

		const versions = await this.versionService.getVersionHistory(
			this.snippetId,
			this.ownerId,
		)

		if (versions.length < 4) {
			throw new Error(`Expected at least 4 versions, got ${versions.length}`)
		}

		this.log(`✓ Create multiple versions (${versions.length} versions created)`)
	}

	async testGetVersionDetail(): Promise<void> {
		if (!this.snippetId) {
			throw new Error('Get version detail failed (missing test snippet)')
		}

		const versions = await this.versionService.getVersionHistory(
			this.snippetId,
			this.ownerId,
		)

		if (versions.length === 0) {
			throw new Error('No versions found')
		}

		// Get detail for first version
		const versionDetail = await this.versionService.getVersionDetail(
			this.snippetId,
			versions[0].version,
			this.ownerId,
		)

		if (!versionDetail) {
			throw new Error('Version detail not found')
		}

		if (!versionDetail.files || versionDetail.files.length === 0) {
			throw new Error('Version detail should contain files')
		}

		if (versionDetail.version !== versions[0].version) {
			throw new Error('Version number mismatch')
		}

		if (versionDetail.createdBy !== versions[0].createdBy) {
			throw new Error('Creator mismatch')
		}

		// Get detail for middle version
		const middleVersionIndex = Math.floor(versions.length / 2)
		const middleVersionDetail = await this.versionService.getVersionDetail(
			this.snippetId,
			versions[middleVersionIndex].version,
			this.ownerId,
		)

		if (!middleVersionDetail) {
			throw new Error('Middle version detail not found')
		}

		this.log(
			`✓ Get version detail (retrieved ${versions.length} version details)`,
		)
	}

	async testRestoreVersionCreatesNewVersion(): Promise<void> {
		if (!this.snippetId) {
			throw new Error(
				'Restore version creates new version failed (missing test snippet)',
			)
		}

		const versionsBefore = await this.versionService.getVersionHistory(
			this.snippetId,
			this.ownerId,
		)

		if (versionsBefore.length < 2) {
			this.log(
				'⊘ Restore version creates new version skipped (need at least 2 versions)',
			)
			return
		}

		const targetVersion = versionsBefore[0]

		// Restore to first version
		await this.versionService.restoreVersion(
			this.snippetId,
			targetVersion.version,
			this.ownerId,
		)

		await new Promise((resolve) => setTimeout(resolve, 100))

		const versionsAfter = await this.versionService.getVersionHistory(
			this.snippetId,
			this.ownerId,
		)

		if (versionsAfter.length !== versionsBefore.length + 1) {
			throw new Error(
				`Expected ${versionsBefore.length + 1} versions after restore, got ${versionsAfter.length}`,
			)
		}

		const newVersion = versionsAfter[versionsAfter.length - 1]
		if (newVersion.version !== versionsBefore.length + 1) {
			throw new Error('New version number is incorrect')
		}

		if (newVersion.createdBy !== this.ownerId) {
			throw new Error('New version creator should be current user')
		}

		// Verify the restored files match the target version
		const snippet = await this.snippetService.getById(this.snippetId)
		if (!snippet) {
			throw new Error('Snippet not found')
		}

		if (JSON.stringify(snippet.files) !== JSON.stringify(targetVersion.files)) {
			throw new Error('Restored files do not match target version')
		}

		this.log(
			`✓ Restore version creates new version (${versionsAfter.length} total versions)`,
		)
	}

	private buildUsefulRandomSnippet(seed?: number): CreateSnippetServiceInput {
		const template = this.pickRandom(USEFUL_SNIPPET_TEMPLATES)
		const suffix = seed ?? Math.floor(Math.random() * 10_000)
		const now = Date.now()

		return {
			title: `${template.title} #${suffix}`,
			description: template.description,
			files: template.files.map((f, idx) => ({
				id: `file-${now}-${idx}`,
				filename: f.filename,
				language: f.language as any,
				code: f.code,
				order: idx,
				createdAt: now,
				updatedAt: now,
			})),
			primaryLanguage: template.files[0]?.language as any,
			technologies: template.technologies,
			categories: template.categories,
			visibility: 'public',
		}
	}

	private pickRandom<T>(items: T[]): T {
		const index = Math.floor(Math.random() * items.length)
		return items[index]
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	new SnippetScript().run().catch((error) => {
		console.error(error)
		process.exit(1)
	})
}
