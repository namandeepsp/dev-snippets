import type {
	CreateUserDTO,
	PublicUser,
	UpdateUserDTO,
	User,
} from '../user.types'

export interface UserRepository {
	create(input: CreateUserDTO): Promise<User>

	upsert(input: CreateUserDTO): Promise<User>

	findById(id: string): Promise<User | null>

	findByEmail(email: string): Promise<User | null>

	findByUsername(username: string): Promise<PublicUser | null>

	update(id: string, input: UpdateUserDTO): Promise<void>

	delete(id: string): Promise<void>

	findManyByIds(ids: string[]): Promise<User[]>
}

export class UserRepositoryError extends Error {
	constructor(
		message: string,
		public readonly code: ErrorCode,
	) {
		super(message)
		this.name = 'UserRepositoryError'
	}
}

export type ErrorCode =
	| 'DUPLICATE_EMAIL'
	| 'DUPLICATE_USERNAME'
	| 'USER_NOT_FOUND'
	| 'INVALID_EMAIL'
	| 'DATABASE_ERROR'

export const ErrorMessages: Record<ErrorCode, string> = {
	DUPLICATE_EMAIL: 'A user with this email already exists',
	DUPLICATE_USERNAME: 'This username is already taken',
	USER_NOT_FOUND: 'User not found',
	INVALID_EMAIL: 'Invalid email format',
	DATABASE_ERROR: 'Database operation failed',
}
