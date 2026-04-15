export interface UserDBModel {
	username: string
	name: string
	email: string
	avatarUrl: string | null
	bio?: string
	createdAt: number
	updatedAt: number
}

export interface User extends UserDBModel {
	id: string
}

export type PublicUser = Omit<User, 'email'>

export type Author =
	| PublicUser
	| { id: string; username: string; name: string; avatarUrl: string | null }

export type CreateUserDTO = {
	uid: string

	username: string
	name: string
	email: string
	avatarUrl?: string | null
	bio?: string
}

export type UpdateUserDTO = Partial<{
	name: string
	avatarUrl: string | null
	bio: string
}>

export function isCompleteUser(user: Partial<User>): user is User {
	return !!(user.id && user.username && user.name && user.email)
}

export function toPublicUser(user: User): PublicUser {
	const { email, ...publicUser } = user
	return publicUser
}

export function generateUsernameFromEmail(email: string): string {
	return email
		.split('@')[0]
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '')
}

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
