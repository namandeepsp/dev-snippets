import { beforeAll, describe, it } from 'vitest'
import { ClearScript } from '../features/clear.script'
import { SnippetScript } from '../features/snippet.script'

describe.sequential('Snippet Versioning Feature', () => {
	let script: SnippetScript

	beforeAll(async () => {
		await new ClearScript().run()
		script = new SnippetScript()
	})

	it('creates a snippet for versioning tests', async () => {
		await script.testCreateSnippet()
	})

	it('creates multiple versions by updating files', async () => {
		await script.testCreateMultipleVersions()
	})

	it('gets version history with all versions', async () => {
		await script.testGetVersionHistory()
	})

	it('gets version detail for specific version', async () => {
		await script.testGetVersionDetail()
	})

	it('restores to previous version', async () => {
		await script.testRestoreVersion()
	})

	it('verifies restored version creates new version entry', async () => {
		await script.testRestoreVersionCreatesNewVersion()
	})
})
