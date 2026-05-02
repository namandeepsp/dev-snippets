import type { SnippetRepository } from './repositories/snippet.repository'
import type { SnippetVersion, SnippetVersionDetail } from './snippet.types'

export class SnippetVersionService {
	constructor(private readonly snippetRepository: SnippetRepository) {}

	async getVersionDetail(
		snippetId: string,
		versionNumber: number,
		userId?: string,
	): Promise<SnippetVersionDetail> {
		const snippet = await this.snippetRepository.getById(snippetId)

		if (!snippet) {
			throw new Error('Snippet not found')
		}

		if (snippet.visibility === 'private' && snippet.ownerId !== userId) {
			throw new Error('Unauthorized')
		}

		const versionData = await this.snippetRepository.getVersionDetail(
			snippetId,
			versionNumber,
		)

		if (!versionData) {
			throw new Error('Version not found')
		}

		return versionData
	}

	async restoreVersion(
		snippetId: string,
		versionNumber: number,
		userId: string,
	): Promise<void> {
		const snippet = await this.snippetRepository.getById(snippetId)

		if (!snippet) {
			throw new Error('Snippet not found')
		}

		if (snippet.ownerId !== userId) {
			throw new Error('Unauthorized')
		}

		const version = snippet.versions.find((v) => v.version === versionNumber)

		if (!version) {
			throw new Error('Version not found')
		}

		const newVersion: SnippetVersion = {
			version: snippet.versions.length + 1,
			files: version.files,
			createdAt: Date.now(),
			createdBy: userId,
		}

		await this.snippetRepository.update(snippetId, {
			files: version.files,
			versions: [...snippet.versions, newVersion],
			updatedAt: Date.now(),
		})
	}

	async getVersionHistory(
		snippetId: string,
		userId?: string,
	): Promise<SnippetVersion[]> {
		const snippet = await this.snippetRepository.getById(snippetId)

		if (!snippet) {
			throw new Error('Snippet not found')
		}

		if (snippet.visibility === 'private' && snippet.ownerId !== userId) {
			throw new Error('Unauthorized')
		}

		return snippet.versions
	}
}
