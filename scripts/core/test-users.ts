import type { User } from '../../src/features/user/core/user.types'
import { userService } from '../../src/features/user/user.container'
import { getServerFirebaseAuth } from '../../src/services/firebase/firebase.server'

type TestUserTemplate = {
	uid: string
	email: string
	name: string
	password: string
}

const TEST_USER_TEMPLATES: TestUserTemplate[] = [
	{
		uid: 'seed-user-frontend',
		email: 'seed-frontend@example.com',
		name: 'Seed Frontend User',
		password: 'SeedUser@123',
	},
	{
		uid: 'seed-user-backend',
		email: 'seed-backend@example.com',
		name: 'Seed Backend User',
		password: 'SeedUser@123',
	},
]

export async function ensureFixtureUsers(): Promise<User[]> {
	const auth = getServerFirebaseAuth()
	const users: User[] = []

	for (const template of TEST_USER_TEMPLATES) {
		try {
			await auth.getUser(template.uid)
		} catch {
			await auth.createUser({
				uid: template.uid,
				email: template.email,
				password: template.password,
				displayName: template.name,
				emailVerified: true,
			})
		}

		const user = await userService.syncUserFromAuth(
			template.uid,
			template.email,
			template.name,
			null,
		)
		users.push(user)
	}

	return users
}
