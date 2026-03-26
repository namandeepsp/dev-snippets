import type { User } from '@/features/user/core/user.types'
import type { User as FirebaseUser } from 'firebase/auth'
import type { Session } from '../../core/auth.types'

export async function fetchSessionPayload(): Promise<{
	session: Session | null
	user: User | null
}> {
	try {
		const response = await fetch('/api/auth/session', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		})

		if (!response.ok) {
			return { session: null, user: null }
		}

		const data = await response.json()
		return {
			session: (data.session as Session | null) ?? null,
			user: (data.user as User | null) ?? null,
		}
	} catch {
		return { session: null, user: null }
	}
}

export async function postSessionWithRetry(
	idToken: string,
	name?: string,
	maxAttempts = 2,
): Promise<any> {
	let lastError: unknown

	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		try {
			const response = await fetch('/api/auth/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken, name }),
			})

			if (!response.ok) {
				const payload = await response
					.json()
					.catch(() => ({ error: 'Failed to create session cookie' }))
				throw new Error(payload?.error || 'Failed to create session cookie')
			}

			return await response.json()
		} catch (error) {
			lastError = error
			if (attempt < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, attempt * 300))
			}
		}
	}

	throw lastError instanceof Error
		? lastError
		: new Error('Failed to create session cookie')
}

export async function validateSessionWithServer(
	idToken: string,
): Promise<User | null> {
	try {
		const response = await fetch('/api/auth/validate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ idToken }),
		})

		if (!response.ok) {
			return null
		}

		const data = await response.json()
		return data.user ?? null
	} catch {
		return null
	}
}

export async function callLogoutEndpoint(): Promise<void> {
	await fetch('/api/auth/logout', { method: 'POST' })
}

export function isNewUser(user: FirebaseUser): boolean {
	const creationTime = user.metadata?.creationTime
	if (!creationTime) return false

	const created = new Date(creationTime).getTime()
	const now = Date.now()

	return now - created < 60 * 1000
}
