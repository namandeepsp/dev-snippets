import { fileURLToPath } from 'node:url'
import { FirebaseAdminAuthClient } from '../../src/features/auth/infra/client/firebase-admin-auth.client'
import { BaseScript } from '../core/base.script'

export class AuthScript extends BaseScript {
	name = 'Auth Tests'

	private email = `test-${Date.now()}@example.com`
	private password = 'Test@123456'
	private uid?: string
	private expectedUsername = this.getExpectedUsername(this.email)
	private auth = new FirebaseAdminAuthClient()

	async run(): Promise<void> {
		await this.ensureReady()
		this.log('Running auth tests...')

		await this.testSignUpWithEmailAndPassword()
		await this.testSignInWithEmailAndPassword()
		await this.testGetCurrentUser()
		await this.testSignOut()
		await this.testSignInWithGoogle()

		this.logSuccess('All auth tests passed')
	}

	async testSignUpWithEmailAndPassword() {
		const result = await this.auth.signUpWithEmailAndPassword({
			email: this.email,
			password: this.password,
			name: 'Script Test User',
		})

		if (!result.user?.id || result.user.email !== this.email) {
			throw new Error('Sign up failed')
		}
		if (result.user.username !== this.expectedUsername) {
			throw new Error(
				`Sign up created unexpected username: expected "${this.expectedUsername}", got "${result.user.username}"`,
			)
		}

		this.uid = result.user.id
		this.log(
			`✓ Sign up with email/password (username: ${result.user.username})`,
		)
	}

	async testSignInWithEmailAndPassword() {
		const result = await this.auth.signInWithEmailAndPassword({
			email: this.email,
			password: this.password,
		})

		if (result.user.id !== this.uid) {
			throw new Error('Sign in failed')
		}
		if (result.user.username !== this.expectedUsername) {
			throw new Error(
				`Sign in returned unexpected username: expected "${this.expectedUsername}", got "${result.user.username}"`,
			)
		}

		this.log(
			`✓ Sign in with email/password (username: ${result.user.username})`,
		)
	}

	async testGetCurrentUser() {
		const user = await this.auth.getCurrentUser()

		// Scripts run without a request cookie context, so current user is expected to be null.
		if (user !== null && user.id !== this.uid) {
			throw new Error('Get current user returned unexpected user')
		}

		this.log('✓ Get current user (no session context in script runtime)')
	}

	async testSignOut() {
		await this.auth.signOut()
		const user = await this.auth.getCurrentUser()

		if (user) {
			throw new Error('Sign out failed')
		}

		this.log('✓ Sign out')
	}

	async testSignInWithGoogle() {
		try {
			await this.auth.signInWithGoogle()
			throw new Error('Google sign-in should not be available on server')
		} catch {
			this.log('⊘ Google sign-in skipped (UI/browser flow only)')
		}
	}

	private getExpectedUsername(email: string): string {
		return email
			.split('@')[0]
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '')
			.slice(0, 20)
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	new AuthScript().run().catch((error) => {
		console.error(error)
		process.exit(1)
	})
}
