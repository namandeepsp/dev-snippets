'use server'

import { FirebaseUserPort } from '@/features/user/infra/repositories/firebase-user.repository'
import { getServerFirebaseAuth } from '@/services/firebase/firebase.server'
import { cookies } from 'next/headers'
import { createUserDTOFromAuth } from '../user/core/user.types'

const userRepo = new FirebaseUserPort()

export async function createUserProfileAction(): Promise<void> {
	const auth = getServerFirebaseAuth()
	const cookieStore = await cookies()
	const decodedUser = await auth.verifySessionCookie(
		cookieStore.get('__session')?.value ?? '',
		true,
	)

	if (!decodedUser) {
		throw new Error('Unauthorized')
	}

	const existingUser = await userRepo.findById(decodedUser.uid)
	if (existingUser) return

	const userInput = createUserDTOFromAuth(
		decodedUser.uid,
		decodedUser.email || '',
		decodedUser.name || 'Anonymous',
		decodedUser.picture,
	)

	await userRepo.create(userInput)
}
