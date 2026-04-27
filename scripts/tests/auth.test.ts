import { beforeAll, describe, it } from 'vitest'
import { AuthScript } from '../features/auth.script'
import { ClearScript } from '../features/clear.script'

describe.sequential('Auth Feature', () => {
	let script: AuthScript

	beforeAll(async () => {
		await new ClearScript().run()
		script = new AuthScript()
	})

	it('signs up with email and password', async () => {
		await script.testSignUpWithEmailAndPassword()
	})

	it('signs in with email and password', async () => {
		await script.testSignInWithEmailAndPassword()
	})

	it('gets current user', async () => {
		await script.testGetCurrentUser()
	})

	it('signs out', async () => {
		await script.testSignOut()
	})

	it('skips google sign-in (interactive)', async () => {
		await script.testSignInWithGoogle()
	})
})
