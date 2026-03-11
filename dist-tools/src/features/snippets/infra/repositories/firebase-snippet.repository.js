"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseSnippetRepository = void 0;
const firebase_server_1 = require("@/services/firebase/firebase.server");
const firestore_1 = require("firebase-admin/firestore");
const COLLECTION_NAME = 'snippets';
/**
 * ============================================================================
 * FIREBASE SNIPPET REPOSITORY
 * ============================================================================
 *
 * Firebase/Firestore implementation of the SnippetRepository port.
 *
 * Key responsibilities:
 * 1. Map Firestore document data to domain Snippet type
 * 2. Handle Firestore-specific operations (atomic increments, batches)
 * 3. Implement soft delete pattern
 * 4. No business logic - just persistence
 *
 * This is the ONLY place where Firestore-specific code should exist
 * for snippet operations.
 */
class FirebaseSnippetRepository {
    getCollection() {
        return firebase_server_1.adminDb.collection(COLLECTION_NAME);
    }
    /* ----------------------------------------------------------------------- */
    /* CREATE
    /* ----------------------------------------------------------------------- */
    async create(input) {
        // Input is already in FirestoreSnippet shape (minus sharedWith)
        const payload = Object.assign({}, input);
        const docRef = await this.getCollection().add(payload);
        const doc = await docRef.get();
        const data = doc.data();
        return Object.assign(Object.assign({ id: docRef.id }, data), { versions: data.versions || [] });
    }
    /* ----------------------------------------------------------------------- */
    /* READ
    /* ----------------------------------------------------------------------- */
    async getById(id) {
        const docRef = this.getCollection().doc(id);
        const snapshot = await docRef.get();
        if (!snapshot.exists) {
            return null;
        }
        const data = snapshot.data();
        // Soft delete check
        if (data.isDeleted) {
            return null;
        }
        // Increment views (fire-and-forget, don't await)
        this.incrementViews(id).catch(() => {
            // Silently fail - views aren't critical
        });
        return Object.assign(Object.assign({ id: snapshot.id }, data), { versions: data.versions || [] });
    }
    async listPublic(sortBy = 'latest') {
        let query = this.getCollection()
            .where('visibility', '==', 'public')
            .where('isDeleted', '==', false);
        // Apply sorting
        switch (sortBy) {
            case 'latest':
                query = query.orderBy('createdAt', 'desc');
                break;
            case 'oldest':
                query = query.orderBy('createdAt', 'asc');
                break;
            case 'views':
                query = query.orderBy('viewsCount', 'desc');
                break;
            case 'title':
                query = query.orderBy('title', 'asc');
                break;
        }
        const snapshot = await query.get();
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { versions: data.versions || [] });
        });
    }
    async listByUser(userId, visibility) {
        let query = this.getCollection()
            .where('ownerId', '==', userId)
            .where('isDeleted', '==', false);
        if (visibility) {
            query = query.where('visibility', '==', visibility);
        }
        const snapshot = await query.orderBy('updatedAt', 'desc').get();
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { versions: data.versions || [] });
        });
    }
    async listByVisibility(visibility, userId) {
        let query = this.getCollection()
            .where('visibility', '==', visibility)
            .where('isDeleted', '==', false);
        // Private snippets require owner filter
        if (visibility === 'private') {
            if (!userId)
                return [];
            query = query.where('ownerId', '==', userId);
        }
        // Shared snippets - TODO: implement shared list query
        if (visibility === 'shared') {
            if (!userId)
                return [];
            // This will need array-contains query on sharedWith
            // query = query.where('sharedWith', 'array-contains', userId)
        }
        const snapshot = await query.orderBy('updatedAt', 'desc').get();
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, data), { versions: data.versions || [] });
        });
    }
    /* ----------------------------------------------------------------------- */
    /* UPDATE
    /* ----------------------------------------------------------------------- */
    async update(id, input) {
        const docRef = this.getCollection().doc(id);
        // Check if snippet exists and is not deleted
        const snapshot = await docRef.get();
        if (!snapshot.exists) {
            throw new Error('Snippet not found');
        }
        const data = snapshot.data();
        if (data.isDeleted) {
            throw new Error('Cannot update deleted snippet');
        }
        // Handle version creation if code changed
        const updatePayload = Object.assign(Object.assign({}, input), { updatedAt: Date.now() });
        // If code is being updated, create a new version entry
        if (input.code && input.code !== data.code) {
            const versions = data.versions || [];
            const newVersion = {
                version: versions.length + 1,
                code: data.code, // Store the OLD code as a version
                createdAt: Date.now(),
                createdBy: data.ownerId,
            };
            updatePayload.versions = [...versions, newVersion];
        }
        await docRef.update(updatePayload);
    }
    /* ----------------------------------------------------------------------- */
    /* DELETE (Soft Delete)
    /* ----------------------------------------------------------------------- */
    async delete(id) {
        const docRef = this.getCollection().doc(id);
        // Soft delete - just mark as deleted
        await docRef.update({
            isDeleted: true,
            updatedAt: Date.now(),
        });
    }
    /* ----------------------------------------------------------------------- */
    /* UTILITY OPERATIONS
    /* ----------------------------------------------------------------------- */
    async incrementViews(id) {
        const docRef = this.getCollection().doc(id);
        // Atomic increment - no need to read first
        await docRef
            .update({
            viewsCount: firestore_1.FieldValue.increment(1),
        })
            .catch(() => {
            // Silently fail - views aren't critical
        });
    }
    /* ----------------------------------------------------------------------- */
    /* HARD DELETE (Admin only)
    /* ----------------------------------------------------------------------- */
    /**
     * Permanently delete a snippet from Firestore.
     * This should only be used in tests or admin operations.
     */
    async permanentlyDelete(id) {
        await this.getCollection().doc(id).delete();
    }
    /**
     * Permanently delete all snippets.
     * This should only be used in tests.
     */
    async permanentlyDeleteAll() {
        const snapshot = await this.getCollection().get();
        const batch = firebase_server_1.adminDb.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
}
exports.FirebaseSnippetRepository = FirebaseSnippetRepository;
