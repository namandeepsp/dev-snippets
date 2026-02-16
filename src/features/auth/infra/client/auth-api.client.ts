import type { PublicUser } from '@/features/user/user.container'

/**
 * API Client interface for authentication operations
 * Transport / SDK abstraction (Firebase, JWT, OAuth, etc.)
 */
export interface AuthAPIClient {
	/* ---------- Sign up ---------- */

	signUpWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<PublicUser>

	/* ---------- Sign in ---------- */

	signInWithEmailAndPassword(
		email: string,
		password: string,
	): Promise<PublicUser>

	signInWithGoogle(): Promise<PublicUser>

	/* ---------- Session ---------- */

	getCurrentUser(): Promise<PublicUser | null>

	/* ---------- Sign out ---------- */

	signOut(): Promise<void>

	/* ---------- handle auth state change ---------- */

	onAuthStateChanged(callback: (user: PublicUser | null) => void): () => void
}
