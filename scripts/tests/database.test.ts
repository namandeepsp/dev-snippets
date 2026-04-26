import { describe, it } from 'vitest'
import { ClearScript } from '../features/clear.script'
import { SeedScript } from '../features/seed.script'

const TEST_SEED_SNIPPET_COUNT = 12

describe('Database Operations', () => {
	it('should clear database', async () => {
		const script = new ClearScript()
		await script.run()
	})

	it('should seed database', async () => {
		const script = new SeedScript(TEST_SEED_SNIPPET_COUNT)
		await script.run()
	})
})
