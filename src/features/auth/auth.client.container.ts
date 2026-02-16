'use client'

import type { AuthPort } from './core/auth.port'
import { FirebaseAuthClient } from './infra/client/firebase-auth.client'

/**
 * Client-side auth dependency container.
 * This module must only be imported from client components/hooks.
 */
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
	return authPort.signOut()
}

export async function getCurrentUser() {
	return authPort.getCurrentUser()
}

export async function validateSession() {
	return authPort.validateSession()
}
