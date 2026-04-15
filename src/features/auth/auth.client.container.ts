'use client'

import { toast } from '@/shared/ui/design-system'
import type { AuthPort } from './core/auth.port'
import { FirebaseAuthClient } from './infra/client/firebase-auth.client'

export const authPort: AuthPort = new FirebaseAuthClient()

export { useAuth } from './ui/store/auth.store'

export async function signInWithGoogle() {
	return authPort.signInWithGoogle()
}

export async function signInWithEmailAndPassword(
	email: string,
	password: string,
) {
	return authPort.signInWithEmailAndPassword({ email, password })
}

export async function signUpWithEmailAndPassword(
	email: string,
	password: string,
	name: string,
) {
	return authPort.signUpWithEmailAndPassword({ email, password, name })
}

export async function logout() {
	await authPort.signOut()
	toast.success('Logged out successfully', {
		description: 'You have been signed out',
	})
}

export async function getCurrentUser() {
	return authPort.getCurrentUser()
}

export async function validateSession() {
	return authPort.validateSession()
}
