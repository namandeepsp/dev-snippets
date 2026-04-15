import type { PublicUser, UpdateUserDTO } from '../../core/user.types'

export interface UserApiClient {
	getProfile(username: string): Promise<PublicUser | null>

	getUsersByIds(ids: string[]): Promise<Record<string, PublicUser>>

	updateProfile(input: UpdateUserDTO): Promise<void>

	deleteAccount(): Promise<void>
}

export type ApiResponse<T = void> = {
	success: boolean
	data?: T
	error?: string
}
