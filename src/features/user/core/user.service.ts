import type { UserPort } from './user.port'
import type {
	CreateUserDTO,
	PublicUser,
	UpdateUserDTO,
	User,
} from './user.types'
import { toPublicUser } from './user.types'

export class UserDomainError extends Error {
	constructor(
		message: string,
		public readonly code: DomainErrorCode,
	) {
		super(message)
		this.name = 'UserDomainError'
	}
}

export type DomainErrorCode =
	| 'INVALID_USERNAME'
	| 'USERNAME_TAKEN'
	| 'EMAIL_TAKEN'
	| 'USER_NOT_FOUND'
	| 'UNAUTHORIZED'

export const DomainErrorMessages: Record<DomainErrorCode, string> = {
	INVALID_USERNAME:
		'Username can only contain letters, numbers, and underscores',
	USERNAME_TAKEN: 'This username is already taken',
	EMAIL_TAKEN: 'This email is already registered',
	USER_NOT_FOUND: 'User not found',
	UNAUTHORIZED: 'You do not have permission to perform this action',
}

export class UserService {
	constructor(private readonly userPort: UserPort) {}

	async createUser(input: CreateUserDTO): Promise<User> {
		if (!this.isValidUsername(input.username)) {
			throw new UserDomainError(
				DomainErrorMessages.INVALID_USERNAME,
				'INVALID_USERNAME',
			)
		}

		try {
			return await this.userPort.create(input)
		} catch (error: any) {
			if (error.code === 'DUPLICATE_EMAIL') {
				throw new UserDomainError(
					DomainErrorMessages.EMAIL_TAKEN,
					'EMAIL_TAKEN',
				)
			}
			if (error.code === 'DUPLICATE_USERNAME') {
				throw new UserDomainError(
					DomainErrorMessages.USERNAME_TAKEN,
					'USERNAME_TAKEN',
				)
			}
			throw error
		}
	}

	async getUserById(id: string): Promise<User | null> {
		if (!id) return null
		return this.userPort.findById(id)
	}

	async getUserByEmail(email: string): Promise<User | null> {
		if (!email) return null
		return this.userPort.findByEmail(email)
	}

	async getPublicProfile(username: string): Promise<PublicUser | null> {
		if (!username) return null
		return this.userPort.findByUsername(username)
	}

	async getUsersByIds(ids: string[]): Promise<Record<string, PublicUser>> {
		if (ids.length === 0) return {}

		const users = await this.userPort.findManyByIds(ids)

		return users.reduce(
			(acc, user) => {
				acc[user.id] = toPublicUser(user)
				return acc
			},
			{} as Record<string, PublicUser>,
		)
	}

	async updateUser(
		userId: string,
		input: UpdateUserDTO,
		requestingUserId: string,
	): Promise<void> {
		if (userId !== requestingUserId) {
			throw new UserDomainError(
				DomainErrorMessages.UNAUTHORIZED,
				'UNAUTHORIZED',
			)
		}

		const existing = await this.userPort.findById(userId)
		if (!existing) {
			throw new UserDomainError(
				DomainErrorMessages.USER_NOT_FOUND,
				'USER_NOT_FOUND',
			)
		}

		if ('email' in input || 'username' in input) {
			throw new UserDomainError(
				'Cannot update email or username through profile update',
				'UNAUTHORIZED',
			)
		}

		await this.userPort.update(userId, input)
	}

	async deleteUser(userId: string, requestingUserId: string): Promise<void> {
		if (userId !== requestingUserId) {
			throw new UserDomainError(
				DomainErrorMessages.UNAUTHORIZED,
				'UNAUTHORIZED',
			)
		}

		const existing = await this.userPort.findById(userId)
		if (!existing) {
			throw new UserDomainError(
				DomainErrorMessages.USER_NOT_FOUND,
				'USER_NOT_FOUND',
			)
		}

		await this.userPort.delete(userId)
	}

	async syncUserFromAuth(
		uid: string,
		email: string,
		name: string,
		avatarUrl?: string | null,
	): Promise<User> {
		const dto: CreateUserDTO = {
			uid,
			username: this.generateUsernameFromEmail(email),
			name,
			email,
			avatarUrl,
			bio: '',
		}

		return this.userPort.upsert(dto)
	}

	private isValidUsername(username: string): boolean {
		return /^[a-zA-Z0-9_]{3,20}$/.test(username)
	}

	private generateUsernameFromEmail(email: string): string {
		return email
			.split('@')[0]
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '')
			.slice(0, 20)
	}
}
