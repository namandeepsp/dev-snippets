'use client'

import { FirebaseAuthClient } from './firebase-auth.client'

function createAuthAPIClient() {
	return new FirebaseAuthClient()
}

export const authApiClient = createAuthAPIClient()
