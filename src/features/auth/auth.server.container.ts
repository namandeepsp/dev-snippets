import 'server-only'

import type { AuthPort } from './core/auth.port'
import { FirebaseAdminAuthClient } from './infra/client/firebase-admin-auth.client'

/**
 * Server-side auth dependency container.
 * This module must only be imported from server code.
 */
export const authServerPort: AuthPort = new FirebaseAdminAuthClient()

export async function getCurrentServerUser() {
	return authServerPort.getCurrentUser()
}

export async function validateServerSession() {
	return authServerPort.validateSession()
}

export async function signOutServerSession() {
	return authServerPort.signOut()
}
