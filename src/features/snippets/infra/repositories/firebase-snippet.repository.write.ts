import type {
	CreateSnippetInput,
	UpdateSnippetInput,
} from '../../core/repositories/snippet.repository'
import type {
	FirestoreSnippet,
	Snippet,
	SnippetVersion,
} from '../../core/snippet.types'

export interface FirebaseSnippetRepositoryContext {
	getCollection(): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
}

export async function createSnippet(
	repo: FirebaseSnippetRepositoryContext,
	input: CreateSnippetInput,
): Promise<Snippet> {
	const payload: Omit<FirestoreSnippet, 'sharedWith'> = {
		...input,
	}

	const docRef = await repo.getCollection().add(payload)
	const doc = await docRef.get()
	const data = doc.data() as FirestoreSnippet

	return {
		id: docRef.id,
		...data,
		versions: data.versions || [],
	}
}

export async function updateSnippet(
	repo: FirebaseSnippetRepositoryContext,
	id: string,
	input: UpdateSnippetInput,
): Promise<void> {
	const docRef = repo.getCollection().doc(id)
	const snapshot = await docRef.get()

	if (!snapshot.exists) {
		throw new Error('Snippet not found')
	}

	const data = snapshot.data() as FirestoreSnippet
	if (data.isDeleted) {
		throw new Error('Cannot update deleted snippet')
	}

	const updatePayload: any = {
		...input,
		updatedAt: Date.now(),
	}

	if (
		input.files &&
		JSON.stringify(input.files) !== JSON.stringify(data.files)
	) {
		const versions = data.versions || []
		const newVersion: SnippetVersion = {
			version: versions.length + 1,
			files: data.files,
			createdAt: Date.now(),
			createdBy: data.ownerId,
		}

		updatePayload.versions = [...versions, newVersion]
	}

	await docRef.update(updatePayload)
}

export async function softDeleteSnippet(
	repo: FirebaseSnippetRepositoryContext,
	id: string,
): Promise<void> {
	const docRef = repo.getCollection().doc(id)
	await docRef.update({
		isDeleted: true,
		updatedAt: Date.now(),
	})
}
