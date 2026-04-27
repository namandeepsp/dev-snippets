import { fileURLToPath } from 'node:url'
import type {
	CreateUserDTO,
	UpdateUserDTO,
} from '../../src/features/user/core/user.types'
import { userService } from '../../src/features/user/user.container'
import { BaseScript } from '../core/base.script'

export class UserScript extends BaseScript {
	name = 'User Tests'

	private userId?: string
	private username?: string
	private email?: string

	async run(): Promise<void> {
		await this.ensureReady()
		this.log('Running user tests...')

		await this.testCreateUser()
		await this.testGetUserById()
		await this.testGetUserByUsername()
		await this.testGetUserByEmail()
		await this.testUpdateUser()
		await this.testDeleteUser()

		this.logSuccess('All user tests passed')
	}

	async testCreateUser(): Promise<void> {
		const timestamp = Date.now()
		const username = this.buildValidUsername(timestamp)
		const input: CreateUserDTO = {
			uid: `test-user-${timestamp}`,
			username,
			email: `test-${timestamp}@example.com`,
			name: 'Test User',
			avatarUrl: null,
			bio: '',
		}

		const user = await userService.createUser(input)

		if (!user.id || user.username !== input.username) {
			throw new Error('Create user failed')
		}

		this.userId = user.id
		this.username = user.username
		this.email = user.email

		this.log('✓ Create user')
	}

	private buildValidUsername(timestamp: number): string {
		return `u_${timestamp.toString().slice(-10)}`
	}

	async testGetUserById(): Promise<void> {
		if (!this.userId) {
			throw new Error('Get user by ID failed (missing test user)')
		}

		const user = await userService.getUserById(this.userId)

		if (!user) {
			throw new Error('Get user by ID failed')
		}

		this.log('✓ Get user by ID')
	}

	async testGetUserByUsername(): Promise<void> {
		if (!this.username) {
			throw new Error('Get user by username failed (missing test user)')
		}

		const user = await userService.getPublicProfile(this.username)

		if (!user) {
			throw new Error('Get user by username failed')
		}

		this.log('✓ Get user by username')
	}

	async testGetUserByEmail(): Promise<void> {
		if (!this.email) {
			throw new Error('Get user by email failed (missing test user)')
		}

		const user = await userService.getUserByEmail(this.email)

		if (!user) {
			throw new Error('Get user by email failed')
		}

		this.log('✓ Get user by email')
	}

	async testUpdateUser(): Promise<void> {
		if (!this.userId) {
			throw new Error('Update user failed (missing test user)')
		}

		const updateInput: UpdateUserDTO = {
			name: 'Updated Name',
			bio: 'Updated bio',
		}

		await userService.updateUser(this.userId, updateInput, this.userId)

		this.log('✓ Update user')
	}

	async testDeleteUser(): Promise<void> {
		if (!this.userId) {
			throw new Error('Delete user failed (missing test user)')
		}

		await userService.deleteUser(this.userId, this.userId)

		this.log('✓ Delete user')
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	new UserScript().run().catch((error) => {
		console.error(error)
		process.exit(1)
	})
}
