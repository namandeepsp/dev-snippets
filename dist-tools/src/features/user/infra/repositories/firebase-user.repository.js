"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseUserPort = void 0;
const firebase_server_1 = require("@/services/firebase/firebase.server");
const user_port_1 = require("../../core/user.port");
const COLLECTION_NAME = 'users';
/**
 * ============================================================================
 * FIREBASE USER REPOSITORY
 * ============================================================================
 *
 * Firebase/Firestore implementation of the UserPort port.
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
class FirebaseUserPort {
    getCollection() {
        return firebase_server_1.adminDb.collection(COLLECTION_NAME);
    }
    removeUndefined(obj) {
        return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
    }
    /* ----------------------------------------------------------------------- */
    /* CREATE / UPSERT
    /* ----------------------------------------------------------------------- */
    async create(input) {
        var _a, _b;
        try {
            // Check for duplicate email
            const existingByEmail = await this.findByEmail(input.email);
            if (existingByEmail) {
                throw new user_port_1.UserPortError(user_port_1.ErrorMessages.DUPLICATE_EMAIL, 'DUPLICATE_EMAIL');
            }
            // Check for duplicate username
            const existingByUsername = await this.findByUsername(input.username);
            if (existingByUsername) {
                throw new user_port_1.UserPortError(user_port_1.ErrorMessages.DUPLICATE_USERNAME, 'DUPLICATE_USERNAME');
            }
            const now = Date.now();
            // UserDBModel shape - keep avatarUrl explicit for schema consistency.
            const userData = this.removeUndefined({
                username: input.username,
                name: input.name,
                email: input.email,
                avatarUrl: (_a = input.avatarUrl) !== null && _a !== void 0 ? _a : null,
                bio: (_b = input.bio) !== null && _b !== void 0 ? _b : '',
                createdAt: now,
                updatedAt: now,
            });
            // Use Firebase UID as the document ID
            const docRef = this.getCollection().doc(input.uid);
            await docRef.set(userData);
            // Return domain User shape (DB model + id)
            return Object.assign({ id: docRef.id }, userData);
        }
        catch (error) {
            if (error instanceof user_port_1.UserPortError) {
                throw error;
            }
            throw new user_port_1.UserPortError(user_port_1.ErrorMessages.DATABASE_ERROR, 'DATABASE_ERROR');
        }
    }
    async upsert(input) {
        var _a, _b;
        try {
            const now = Date.now();
            const userData = this.removeUndefined({
                username: input.username,
                name: input.name,
                email: input.email,
                avatarUrl: (_a = input.avatarUrl) !== null && _a !== void 0 ? _a : null,
                bio: (_b = input.bio) !== null && _b !== void 0 ? _b : '',
                createdAt: now,
                updatedAt: now,
            });
            const docRef = this.getCollection().doc(input.uid);
            await docRef.set(userData, { merge: true });
            return Object.assign({ id: docRef.id }, userData);
        }
        catch (_error) {
            throw new user_port_1.UserPortError(user_port_1.ErrorMessages.DATABASE_ERROR, 'DATABASE_ERROR');
        }
    }
    /* ----------------------------------------------------------------------- */
    /* READ
    /* ----------------------------------------------------------------------- */
    async findById(id) {
        var _a;
        try {
            const snapshot = await this.getCollection().doc(id).get();
            if (!snapshot.exists) {
                return null;
            }
            const data = snapshot.data();
            return {
                id: snapshot.id,
                username: data.username,
                name: data.name,
                email: data.email,
                avatarUrl: (_a = data.avatarUrl) !== null && _a !== void 0 ? _a : null,
                bio: data.bio,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            };
        }
        catch (_error) {
            throw new user_port_1.UserPortError(user_port_1.ErrorMessages.DATABASE_ERROR, 'DATABASE_ERROR');
        }
    }
    async findByEmail(email) {
        var _a;
        try {
            const snapshot = await this.getCollection()
                .where('email', '==', email)
                .limit(1)
                .get();
            if (snapshot.empty) {
                return null;
            }
            const doc = snapshot.docs[0];
            const data = doc.data();
            return {
                id: doc.id,
                username: data.username,
                name: data.name,
                email: data.email,
                avatarUrl: (_a = data.avatarUrl) !== null && _a !== void 0 ? _a : null,
                bio: data.bio,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            };
        }
        catch (_error) {
            throw new user_port_1.UserPortError(user_port_1.ErrorMessages.DATABASE_ERROR, 'DATABASE_ERROR');
        }
    }
    async findByUsername(username) {
        var _a;
        try {
            const snapshot = await this.getCollection()
                .where('username', '==', username)
                .limit(1)
                .get();
            if (snapshot.empty) {
                return null;
            }
            const doc = snapshot.docs[0];
            const data = doc.data();
            // Return PublicUser - email intentionally excluded
            return {
                id: doc.id,
                username: data.username,
                name: data.name,
                avatarUrl: (_a = data.avatarUrl) !== null && _a !== void 0 ? _a : null,
                bio: data.bio,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            };
        }
        catch (_error) {
            throw new user_port_1.UserPortError(user_port_1.ErrorMessages.DATABASE_ERROR, 'DATABASE_ERROR');
        }
    }
    async findManyByIds(ids) {
        try {
            if (ids.length === 0)
                return [];
            // Firestore can only handle up to 10 items in 'in' query
            // For simplicity, we'll do one query. In production, you'd batch this.
            const snapshot = await this.getCollection()
                .where('__name__', 'in', ids.slice(0, 10))
                .get();
            return snapshot.docs.map((doc) => {
                var _a;
                const data = doc.data();
                return {
                    id: doc.id,
                    username: data.username,
                    name: data.name,
                    email: data.email,
                    avatarUrl: (_a = data.avatarUrl) !== null && _a !== void 0 ? _a : null,
                    bio: data.bio,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                };
            });
        }
        catch (_error) {
            throw new user_port_1.UserPortError(user_port_1.ErrorMessages.DATABASE_ERROR, 'DATABASE_ERROR');
        }
    }
    /* ----------------------------------------------------------------------- */
    /* UPDATE
    /* ----------------------------------------------------------------------- */
    async update(id, input) {
        try {
            const exists = await this.findById(id);
            if (!exists) {
                throw new user_port_1.UserPortError(user_port_1.ErrorMessages.USER_NOT_FOUND, 'USER_NOT_FOUND');
            }
            await this.getCollection()
                .doc(id)
                .update(this.removeUndefined(Object.assign(Object.assign({}, input), { updatedAt: Date.now() })));
        }
        catch (error) {
            if (error instanceof user_port_1.UserPortError) {
                throw error;
            }
            throw new user_port_1.UserPortError(user_port_1.ErrorMessages.DATABASE_ERROR, 'DATABASE_ERROR');
        }
    }
    /* ----------------------------------------------------------------------- */
    /* DELETE
    /* ----------------------------------------------------------------------- */
    async delete(id) {
        try {
            const exists = await this.findById(id);
            if (!exists) {
                throw new user_port_1.UserPortError(user_port_1.ErrorMessages.USER_NOT_FOUND, 'USER_NOT_FOUND');
            }
            await this.getCollection().doc(id).delete();
        }
        catch (error) {
            if (error instanceof user_port_1.UserPortError) {
                throw error;
            }
            throw new user_port_1.UserPortError(user_port_1.ErrorMessages.DATABASE_ERROR, 'DATABASE_ERROR');
        }
    }
}
exports.FirebaseUserPort = FirebaseUserPort;
