import { FieldPath } from 'firebase-admin/firestore'
import type { PaginatedSnippets, SnippetListCursor, SnippetSortBy, SnippetVisibility } from '../../core/repositories/snippet.repository'
import type { FirestoreSnippet, Snippet, SnippetTechnology } from '../../core/snippet.types'
import { getSortConfig, getSortValue } from './firebase-snippet.sort'
import { mapDocToSnippet } from './firebase-snippet.mapper'

const DEFAULT_PAGE_SIZE = 5

export interface FirebaseSnippetRepositoryContext {
    getCollection(): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
}

export async function listPublicSnippetsPaginated(
    repo: FirebaseSnippetRepositoryContext,
    sortBy: SnippetSortBy = 'latest',
    limit = DEFAULT_PAGE_SIZE,
    cursor: SnippetListCursor | null = null,
    technologies?: SnippetTechnology[],
): Promise<PaginatedSnippets> {
    const pageSize = Math.max(1, Math.min(limit, 25))
    const { field, direction } = getSortConfig(sortBy)

    if (!technologies || technologies.length === 0) {
        let query = repo
            .getCollection()
            .where('visibility', '==', 'public')
            .where('isDeleted', '==', false)
            .orderBy(field, direction)
            .orderBy(FieldPath.documentId(), direction)
            .limit(pageSize + 1)

        if (cursor) query = query.startAfter(cursor.sortValue, cursor.id)

        const snapshot = await query.get()
        const hasMore = snapshot.docs.length > pageSize
        const docs = snapshot.docs.slice(0, pageSize)
        const items = docs.map(mapDocToSnippet)

        let nextCursor: SnippetListCursor | null = null
        if (hasMore && docs.length > 0) {
            const lastDoc = docs[docs.length - 1]
            const lastData = lastDoc.data() as FirestoreSnippet
            nextCursor = {
                id: lastDoc.id,
                sortValue: getSortValue(lastData, sortBy),
            }
        }

        return { items, nextCursor }
    }

    const allResults: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = []
    const seenIds = new Set<string>()

    for (const tech of technologies) {
        let query = repo
            .getCollection()
            .where('visibility', '==', 'public')
            .where('isDeleted', '==', false)
            .where('technologies', 'array-contains', tech)
            .orderBy(field, direction)
            .orderBy(FieldPath.documentId(), direction)

        if (cursor) query = query.startAfter(cursor.sortValue, cursor.id)

        const snapshot = await query.get()
        for (const doc of snapshot.docs) {
            if (!seenIds.has(doc.id)) {
                allResults.push(doc)
                seenIds.add(doc.id)
            }
        }
    }

    allResults.sort((a, b) => {
        const aData = a.data() as FirestoreSnippet
        const bData = b.data() as FirestoreSnippet
        const aVal = getSortValue(aData, sortBy)
        const bVal = getSortValue(bData, sortBy)

        if (direction === 'desc') return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    })

    const hasMore = allResults.length > pageSize
    const docs = allResults.slice(0, pageSize)
    const items = docs.map(mapDocToSnippet)

    let nextCursor: SnippetListCursor | null = null
    if (hasMore && docs.length > 0) {
        const lastDoc = docs[docs.length - 1]
        const lastData = lastDoc.data() as FirestoreSnippet
        nextCursor = {
            id: lastDoc.id,
            sortValue: getSortValue(lastData, sortBy),
        }
    }

    return { items, nextCursor }
}

export async function listByUserPaginated(
    repo: FirebaseSnippetRepositoryContext,
    userId: string,
    visibility?: SnippetVisibility,
    limit = DEFAULT_PAGE_SIZE,
    cursor: SnippetListCursor | null = null,
): Promise<PaginatedSnippets> {
    const pageSize = Math.max(1, Math.min(limit, 25))

    let query = repo
        .getCollection()
        .where('ownerId', '==', userId)
        .where('isDeleted', '==', false)

    if (visibility) query = query.where('visibility', '==', visibility)

    query = query
        .orderBy('updatedAt', 'desc')
        .orderBy(FieldPath.documentId(), 'desc')
        .limit(pageSize + 1)

    if (cursor) query = query.startAfter(cursor.sortValue, cursor.id)

    const snapshot = await query.get()
    const hasMore = snapshot.docs.length > pageSize
    const docs = snapshot.docs.slice(0, pageSize)
    const items = docs.map(mapDocToSnippet)

    let nextCursor: SnippetListCursor | null = null
    if (hasMore && docs.length > 0) {
        const lastDoc = docs[docs.length - 1]
        const lastData = lastDoc.data() as FirestoreSnippet
        nextCursor = {
            id: lastDoc.id,
            sortValue: lastData.updatedAt,
        }
    }

    return { items, nextCursor }
}
