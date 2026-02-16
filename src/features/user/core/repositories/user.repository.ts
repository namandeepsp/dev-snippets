import type {
	CreateUserDTO,
	PublicUser,
	UpdateUserDTO,
	User,
} from '../user.types'

/**
 * ============================================================================
 * USER REPOSITORY PORT
 * ============================================================================
 *
 * This interface defines how the application interacts with user data storage.
 *
 * Key design principles:
 * 1. Database agnostic - No Firebase, PostgreSQL, or MongoDB specifics
 * 2. Uses canonical types - Only imports from user.types.ts
 * 3. Clear boundaries - Each method has single responsibility
 * 4. No business logic - Only raw data operations
 *
 * Implementations:
 * - FirebaseUserRepository
 * - PostgreSQLUserRepository
 * - InMemoryUserRepository (for testing)
 */

export interface UserRepository {
	/* ----------------------------------------------------------------------- */
	/* CREATE / UPSERT
	/* ----------------------------------------------------------------------- */

	/**
	 * Create a new user profile.
	 *
	 * The repository implementation is responsible for:
	 * 1. Mapping uid → id (Firebase: uid becomes doc id)
	 * 2. Setting timestamps if not provided
	 * 3. Handling duplicate email/username
	 *
	 * @throws {Error} If email or username already exists
	 */
	create(input: CreateUserDTO): Promise<User>

	/**
	 * Create or update a user profile atomically.
	 *
	 * Used primarily by the auth feature after successful authentication.
	 * This is an upsert operation - creates if doesn't exist, updates if does.
	 *
	 * Unlike create(), this does NOT throw on duplicates - it updates instead.
	 */
	upsert(input: CreateUserDTO): Promise<User>

	/* ----------------------------------------------------------------------- */
	/* READ
	/* ----------------------------------------------------------------------- */

	/**
	 * Find a user by their unique ID.
	 * Returns null if not found.
	 */
	findById(id: string): Promise<User | null>

	/**
	 * Find a user by their email address.
	 * Returns null if not found.
	 *
	 * @throws {Error} If email is invalid format
	 */
	findByEmail(email: string): Promise<User | null>

	/**
	 * Find a user by their username.
	 * Returns PUBLIC user data (email excluded).
	 * Returns null if not found.
	 */
	findByUsername(username: string): Promise<PublicUser | null>

	/* ----------------------------------------------------------------------- */
	/* UPDATE
	/* ----------------------------------------------------------------------- */

	/**
	 * Update a user's profile fields.
	 *
	 * Only updates the fields provided in the DTO.
	 * Always updates the `updatedAt` timestamp automatically.
	 *
	 * @throws {Error} If user doesn't exist
	 */
	update(id: string, input: UpdateUserDTO): Promise<void>

	/* ----------------------------------------------------------------------- */
	/* DELETE
	/* ----------------------------------------------------------------------- */

	/**
	 * Permanently delete a user and all their data.
	 *
	 * Note: In production, you might want soft delete instead.
	 * This is hard delete for simplicity.
	 *
	 * @throws {Error} If user doesn't exist
	 */
	delete(id: string): Promise<void>

	/* ----------------------------------------------------------------------- */
	/* BULK OPERATIONS
	/* ----------------------------------------------------------------------- */

	/**
	 * Find multiple users by their IDs.
	 * Useful for batch operations (e.g., loading snippet authors).
	 * Non-existent IDs are silently omitted from results.
	 */
	findManyByIds(ids: string[]): Promise<User[]>
}

/**
 * ============================================================================
 * REPOSITORY ERROR TYPES
 * ============================================================================
 *
 * Standardized error types for consistent error handling across
 * different database implementations.
 */

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
