/**
 * ============================================================================
 * CORE USER TYPES
 * ============================================================================
 *
 * This is the SINGLE SOURCE OF TRUTH for all user-related data shapes.
 * All other features (auth, snippets, etc.) MUST derive from these types.
 *
 * The types are organized in layers:
 * 1. DB Model - Pure data shape, no ID (Firestore adds doc id)
 * 2. Domain Model - DB Model + ID (what our app uses internally)
 * 3. Public Model - Domain Model - sensitive fields (what we expose to clients)
 * 4. DTOs - Input/Output types for specific operations
 */

/* ------------------------------------------------------------------------- */
/* 1. DB MODEL - Pure data shape, no database-specific fields               */
/* ------------------------------------------------------------------------- */

/**
 * Raw user data as stored in ANY database (Firestore, PostgreSQL, MongoDB, etc.)
 *
 * No ID field - databases handle IDs differently:
 * - Firestore: doc.id is separate from data
 * - PostgreSQL: id is a column
 * - MongoDB: _id is special
 *
 * This is database-agnostic - no Firebase-specific fields!
 */
export interface UserDBModel {
	/** Unique username for public profiles */
	username: string

	/** Display name */
	name: string

	/** Email address (unique) */
	email: string

	/** Avatar image URL */
	avatarUrl: string | null

	/** User bio/description */
	bio?: string

	/** When the user was created */
	createdAt: number

	/** When the user was last updated */
	updatedAt: number
}

/* ------------------------------------------------------------------------- */
/* 2. DOMAIN MODEL - What our application uses internally                   */
/* ------------------------------------------------------------------------- */

/**
 * Full user entity used throughout the application.
 *
 * This is the canonical user type. Every user operation should:
 * - Accept this type as input (or a subset)
 * - Return this type as output
 *
 * Features that need user data should depend on this type.
 */
export interface User extends UserDBModel {
	/** Unique identifier - format depends on database adapter */
	id: string
}

/* ------------------------------------------------------------------------- */
/* 3. PUBLIC MODEL - What we expose to clients                              */
/* ------------------------------------------------------------------------- */

/**
 * User data safe for public consumption.
 *
 * Used for:
 * - Profile pages
 * - Snippet author information
 * - API responses to non-owners
 *
 * Sensitive fields (email) are excluded.
 */
export type PublicUser = Omit<User, 'email'>

export type Author =
	| PublicUser
	| { id: string; username: string; name: string; avatarUrl: string | null }

/* ------------------------------------------------------------------------- */
/* 4. DTOs - Data Transfer Objects for specific operations                  */
/* ------------------------------------------------------------------------- */

/**
 * Input required to CREATE a user.
 *
 * Notes:
 * - `uid` is from authentication provider (Firebase Auth, Auth0, etc.)
 * - We map uid → id at the repository level
 * - createdAt/updatedAt are set by the service layer
 */
export type CreateUserDTO = {
	/** Authentication provider's user ID */
	uid: string

	username: string
	name: string
	email: string
	avatarUrl?: string | null
	bio?: string
}

/**
 * Input required to UPDATE a user.
 *
 * All fields are optional - partial updates only.
 * Only profile fields can be updated, not auth fields.
 */
export type UpdateUserDTO = Partial<{
	name: string
	avatarUrl: string | null
	bio: string
}>

/* ------------------------------------------------------------------------- */
/* 5. TYPE GUARDS & UTILITIES                                               */
/* ------------------------------------------------------------------------- */

/**
 * Type guard to check if a user object is complete
 */
export function isCompleteUser(user: Partial<User>): user is User {
	return !!(user.id && user.username && user.name && user.email)
}

/**
 * Convert a full User to PublicUser
 */
export function toPublicUser(user: User): PublicUser {
	const { email, ...publicUser } = user
	return publicUser
}

/**
 * Generate a username from email
 */
export function generateUsernameFromEmail(email: string): string {
	return email
		.split('@')[0]
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '')
}

/**
 * Create a CreateUserDTO from authentication data
 */
export function createUserDTOFromAuth(
	uid: string,
	email: string,
	name: string,
	avatarUrl?: string | null,
): CreateUserDTO {
	return {
		uid,
		username: generateUsernameFromEmail(email),
		name,
		email,
		avatarUrl,
		bio: '',
	}
}
