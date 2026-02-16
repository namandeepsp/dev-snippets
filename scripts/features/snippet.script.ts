import { BaseScript } from '../core/base.script'
import { SnippetService } from '../../src/features/snippets/core/snippet.service'
import type { UpdateSnippetServiceInput } from '../../src/features/snippets/core/repositories/snippet.repository'
import { FirebaseSnippetRepository } from '../../src/features/snippets/infra/repositories/firebase-snippet.repository'

export class SnippetScript extends BaseScript {
	name = 'Snippet Tests'

	private snippetId?: string
	private ownerId = `test-owner-${Date.now()}`
	private ownerName = 'Script Snippet Owner'
	private snippetService = new SnippetService(
		new FirebaseSnippetRepository(),
		new FirebaseSnippetRepository(),
	)

	async run(): Promise<void> {
		await this.ensureReady()
		this.log('Running snippet tests...')

		await this.testCreateSnippet()
		await this.testListPublicSnippets()
		await this.testGetSnippetById()
		await this.testListByUser()
		await this.testListByVisibility()
		await this.testUpdateSnippet()
		await this.testDeleteSnippet()

		this.logSuccess('All snippet tests passed')
	}

	async testCreateSnippet(): Promise<void> {
		const snippet = await this.snippetService.createSnippet(
			{
				title: 'Test Snippet',
				description: 'Test description',
				code: 'console.log("test");',
				language: 'javascript',
				technologies: ['node'],
				categories: ['testing'],
				visibility: 'public',
			},
			this.ownerId,
			this.ownerName,
		)

		if (!snippet.id || snippet.title !== 'Test Snippet') {
			throw new Error('Create snippet failed')
		}

		this.snippetId = snippet.id
		this.log('✓ Create snippet')
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
}
