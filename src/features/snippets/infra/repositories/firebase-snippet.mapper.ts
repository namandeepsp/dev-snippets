import type { FirestoreSnippet, Snippet } from '../../core/snippet.types'

export function mapDocToSnippet(
	doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
): Snippet {
	const data = doc.data() as FirestoreSnippet
	return {
		id: doc.id,
		...data,
		versions: data.versions || [],
	}
}
