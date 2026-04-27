import { beforeAll, describe, it } from 'vitest'
import { ClearScript } from '../features/clear.script'
import { SeedScript } from '../features/seed.script'
import { SnippetScript } from '../features/snippet.script'

const TEST_SEED_SNIPPET_COUNT = 12

describe.sequential('Snippet Feature', () => {
	let script: SnippetScript

	beforeAll(async () => {
		await new ClearScript().run()
		await new SeedScript(TEST_SEED_SNIPPET_COUNT).run()
		script = new SnippetScript()
	})

	it('creates a snippet', async () => {
		await script.testCreateSnippet()
	})

	it('creates 20 bulk snippets', async () => {
		await script.testCreateBulkSnippets()
	})

	it('lists public snippets', async () => {
		await script.testListPublicSnippets()
	})

	it('gets snippet by ID', async () => {
		await script.testGetSnippetById()
	})

	it('lists snippets by user', async () => {
		await script.testListByUser()
	})

	it('lists snippets by visibility', async () => {
		await script.testListByVisibility()
	})

	it('searches snippets', async () => {
		await script.testSearchSnippets()
	})

	it('filters by technology', async () => {
		await script.testFilterByTechnology()
	})

	it('filters by category', async () => {
		await script.testFilterByCategory()
	})

	it('likes snippet', async () => {
		await script.testLikeSnippet()
	})

	it('dislikes snippet', async () => {
		await script.testDislikeSnippet()
	})

	it('gets seen count', async () => {
		await script.testGetSeenCount()
	})

	it('updates snippet', async () => {
		await script.testUpdateSnippet()
	})

	it('deletes snippet', async () => {
		await script.testDeleteSnippet()
	})
})
