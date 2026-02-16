import { adminDb } from '@/services/firebase/firebase.server'
import type { UserRepository } from '../../core/repositories/user.repository'
import {
	ErrorMessages,
	UserRepositoryError,
} from '../../core/repositories/user.repository'
import type {
	CreateUserDTO,
	PublicUser,
	UpdateUserDTO,
	User,
} from '../../core/user.types'

const COLLECTION_NAME = 'users'

/**
 * ============================================================================
 * FIREBASE USER REPOSITORY
 * ============================================================================
 *
 * Firebase/Firestore implementation of the UserRepository port.
 *
 * Key responsibilities:
 * 1. Map Firebase uid → Firestore document ID
 * 2. Convert between Firestore data shape and our domain shape
 * 3. Handle Firestore-specific error cases
 * 4. No business logic - just persistence
 *
 * This is the ONLY place where Firestore-specific code should exist
 * for user operations.
 */

export class FirebaseUserRepository implements UserRepository {
	private getCollection() {
		return adminDb.collection(COLLECTION_NAME)
	}

	private removeUndefined<T extends Record<string, unknown>>(obj: T): T {
		return Object.fromEntries(
			Object.entries(obj).filter(([, value]) => value !== undefined),
		) as T
	}

	/* ----------------------------------------------------------------------- */
	/* CREATE / UPSERT
	/* ----------------------------------------------------------------------- */

	async create(input: CreateUserDTO): Promise<User> {
		try {
			// Check for duplicate email
			const existingByEmail = await this.findByEmail(input.email)
			if (existingByEmail) {
				throw new UserRepositoryError(
					ErrorMessages.DUPLICATE_EMAIL,
					'DUPLICATE_EMAIL',
				)
			}

			// Check for duplicate username
			const existingByUsername = await this.findByUsername(input.username)
			if (existingByUsername) {
				throw new UserRepositoryError(
					ErrorMessages.DUPLICATE_USERNAME,
					'DUPLICATE_USERNAME',
				)
			}

			const now = Date.now()

			// UserDBModel shape - keep avatarUrl explicit for schema consistency.
			const userData = this.removeUndefined({
				username: input.username,
				name: input.name,
				email: input.email,
				avatarUrl: input.avatarUrl ?? null,
				bio: input.bio ?? '',
				createdAt: now,
				updatedAt: now,
			})

			// Use Firebase UID as the document ID
			const docRef = this.getCollection().doc(input.uid)
			await docRef.set(userData)

			// Return domain User shape (DB model + id)
			return {
				id: docRef.id,
				...userData,
			}
		} catch (error) {
			if (error instanceof UserRepositoryError) {
				throw error
			}

			throw new UserRepositoryError(
				ErrorMessages.DATABASE_ERROR,
				'DATABASE_ERROR',
			)
		}
	}

	async upsert(input: CreateUserDTO): Promise<User> {
		try {
			const now = Date.now()

			const userData = this.removeUndefined({
				username: input.username,
				name: input.name,
				email: input.email,
				avatarUrl: input.avatarUrl ?? null,
				bio: input.bio ?? '',
				createdAt: now,
				updatedAt: now,
			})

			const docRef = this.getCollection().doc(input.uid)
			await docRef.set(userData, { merge: true })

			return {
				id: docRef.id,
				...userData,
			}
		} catch (_error) {
			throw new UserRepositoryError(
				ErrorMessages.DATABASE_ERROR,
				'DATABASE_ERROR',
			)
		}
	}

	/* ----------------------------------------------------------------------- */
	/* READ
	/* ----------------------------------------------------------------------- */

	async findById(id: string): Promise<User | null> {
		try {
			const snapshot = await this.getCollection().doc(id).get()

			if (!snapshot.exists) {
				return null
			}

			const data = snapshot.data()!

			return {
				id: snapshot.id,
				username: data.username,
				name: data.name,
				email: data.email,
				avatarUrl: data.avatarUrl ?? null,
				bio: data.bio,
				createdAt: data.createdAt,
				updatedAt: data.updatedAt,
			}
		} catch (_error) {
			throw new UserRepositoryError(
				ErrorMessages.DATABASE_ERROR,
				'DATABASE_ERROR',
			)
		}
	}

	async findByEmail(email: string): Promise<User | null> {
		try {
			const snapshot = await this.getCollection()
				.where('email', '==', email)
				.limit(1)
				.get()

			if (snapshot.empty) {
				return null
			}

			const doc = snapshot.docs[0]
			const data = doc.data()

			return {
				id: doc.id,
				username: data.username,
				name: data.name,
				email: data.email,
				avatarUrl: data.avatarUrl ?? null,
				bio: data.bio,
				createdAt: data.createdAt,
				updatedAt: data.updatedAt,
			}
		} catch (_error) {
			throw new UserRepositoryError(
				ErrorMessages.DATABASE_ERROR,
				'DATABASE_ERROR',
			)
		}
	}

	async findByUsername(username: string): Promise<PublicUser | null> {
		try {
			const snapshot = await this.getCollection()
				.where('username', '==', username)
				.limit(1)
				.get()

			if (snapshot.empty) {
				return null
			}

			const doc = snapshot.docs[0]
			const data = doc.data()

			// Return PublicUser - email intentionally excluded
			return {
				id: doc.id,
				username: data.username,
				name: data.name,
				avatarUrl: data.avatarUrl ?? null,
				bio: data.bio,
				createdAt: data.createdAt,
				updatedAt: data.updatedAt,
			}
		} catch (_error) {
			throw new UserRepositoryError(
				ErrorMessages.DATABASE_ERROR,
				'DATABASE_ERROR',
			)
		}
	}

	async findManyByIds(ids: string[]): Promise<User[]> {
		try {
			if (ids.length === 0) return []

			// Firestore can only handle up to 10 items in 'in' query
			// For simplicity, we'll do one query. In production, you'd batch this.
			const snapshot = await this.getCollection()
				.where('__name__', 'in', ids.slice(0, 10))
				.get()

			return snapshot.docs.map((doc) => {
				const data = doc.data()
				return {
					id: doc.id,
					username: data.username,
					name: data.name,
					email: data.email,
					avatarUrl: data.avatarUrl ?? null,
					bio: data.bio,
					createdAt: data.createdAt,
					updatedAt: data.updatedAt,
				}
			})
		} catch (_error) {
			throw new UserRepositoryError(
				ErrorMessages.DATABASE_ERROR,
				'DATABASE_ERROR',
			)
		}
	}

	/* ----------------------------------------------------------------------- */
	/* UPDATE
	/* ----------------------------------------------------------------------- */

	async update(id: string, input: UpdateUserDTO): Promise<void> {
		try {
			const exists = await this.findById(id)
			if (!exists) {
				throw new UserRepositoryError(
					ErrorMessages.USER_NOT_FOUND,
					'USER_NOT_FOUND',
				)
			}

			await this.getCollection()
				.doc(id)
				.update(
					this.removeUndefined({
						...input,
						updatedAt: Date.now(),
					}),
				)
		} catch (error) {
			if (error instanceof UserRepositoryError) {
				throw error
			}

			throw new UserRepositoryError(
				ErrorMessages.DATABASE_ERROR,
				'DATABASE_ERROR',
			)
		}
	}

	/* ----------------------------------------------------------------------- */
	/* DELETE
	/* ----------------------------------------------------------------------- */

	async delete(id: string): Promise<void> {
		try {
			const exists = await this.findById(id)
			if (!exists) {
				throw new UserRepositoryError(
					ErrorMessages.USER_NOT_FOUND,
					'USER_NOT_FOUND',
				)
			}

			await this.getCollection().doc(id).delete()
		} catch (error) {
			if (error instanceof UserRepositoryError) {
				throw error
			}

			throw new UserRepositoryError(
				ErrorMessages.DATABASE_ERROR,
				'DATABASE_ERROR',
			)
		}
	}
}
