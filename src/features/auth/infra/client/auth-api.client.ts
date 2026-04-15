import type { PublicUser } from '@/features/user/user.container'

export interface AuthAPIClient {
	signUpWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<PublicUser>

	signInWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<PublicUser>

	signInWithGoogle(): Promise<PublicUser>

	getCurrentUser(): Promise<PublicUser | null>

	signOut(): Promise<void>

	onAuthStateChanged(callback: (user: PublicUser | null) => void): () => void
}
