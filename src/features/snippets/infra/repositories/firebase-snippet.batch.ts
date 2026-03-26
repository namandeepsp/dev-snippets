import { adminDb } from '@/services/firebase/firebase.server'

export const MAX_BATCH_OPERATIONS = 450

export async function deleteDocsInBatches(
	docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[],
): Promise<void> {
	for (let index = 0; index < docs.length; index += MAX_BATCH_OPERATIONS) {
		const chunk = docs.slice(index, index + MAX_BATCH_OPERATIONS)
		const batch = adminDb.batch()
		chunk.forEach((doc) => batch.delete(doc.ref))
		await batch.commit()
	}
}

export async function updateDocsInBatches(
	docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[],
	updateFactory: () => FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>,
): Promise<void> {
	for (let index = 0; index < docs.length; index += MAX_BATCH_OPERATIONS) {
		const chunk = docs.slice(index, index + MAX_BATCH_OPERATIONS)
		const batch = adminDb.batch()
		const updateData = updateFactory()
		chunk.forEach((doc) => batch.update(doc.ref, updateData))
		await batch.commit()
	}
}
