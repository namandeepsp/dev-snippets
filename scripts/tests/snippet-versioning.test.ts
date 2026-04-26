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

	it('gets version history', async () => {
		await script.testGetVersionHistory()
	})

	it('restores version', async () => {
		await script.testRestoreVersion()
	})
})
