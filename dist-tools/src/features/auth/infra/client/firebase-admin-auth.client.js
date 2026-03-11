"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAdminAuthClient = void 0;
const user_container_1 = require("@/features/user/user.container");
const firebase_server_1 = require("@/services/firebase/firebase.server");
const utils_1 = require("@/shared/utils/utils");
const auth_port_1 = require("../../core/auth.port");
/**
 * ============================================================================
 * FIREBASE ADMIN AUTH CLIENT
 * ============================================================================
 *
 * ⚠️ IMPORTANT: This file is ONLY imported on the server!
 * Import this via auth.server.container.ts only.
 *
 * Used in:
 * - Server Components
 * - API Routes
 * - Tests and Scripts
 */
class FirebaseAdminAuthClient {
    /* ----------------------------------------------------------------------- */
    /* SESSION - Now uses dynamic imports for next/headers
    /* ----------------------------------------------------------------------- */
    /**
     * Get current session from cookie.
     * This method dynamically imports next/headers ONLY when called,
     * and ONLY on the server.
     */
    async getCurrentSession() {
        var _a, _b;
        try {
            // Dynamic import - only runs when method is called
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const sessionCookie = (_a = cookieStore.get('__session')) === null || _a === void 0 ? void 0 : _a.value;
            if (!sessionCookie) {
                return null;
            }
            const decodedClaims = await firebase_server_1.adminAuth.verifySessionCookie(sessionCookie, true);
            return {
                uid: decodedClaims.uid,
                createdAt: decodedClaims.auth_time * 1000,
                expiresAt: decodedClaims.exp * 1000,
                provider: (0, utils_1.getAuthProvider)((_b = decodedClaims.firebase) === null || _b === void 0 ? void 0 : _b.sign_in_provider),
            };
        }
        catch (_c) {
            return null;
        }
    }
    async getCurrentUser() {
        try {
            const session = await this.getCurrentSession();
            if (!session)
                return null;
            return user_container_1.userService.getUserById(session.uid);
        }
        catch (_a) {
            return null;
        }
    }
    async validateSession() {
        return this.getCurrentUser();
    }
    /* ----------------------------------------------------------------------- */
    /* SIGN OUT
    /* ----------------------------------------------------------------------- */
    async signOut() {
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            cookieStore.delete('__session');
        }
        catch (error) {
            if (error instanceof Error &&
                error.message.includes('outside a request scope')) {
                // Expected when called from scripts/tests without Next request context.
                return;
            }
            console.error('Failed to sign out:', error);
        }
    }
    /* ----------------------------------------------------------------------- */
    /* OTHER METHODS (unchanged)
    /* ----------------------------------------------------------------------- */
    async signInWithEmailAndPassword(credentials) {
        try {
            const { email } = credentials;
            const userRecord = await firebase_server_1.adminAuth.getUserByEmail(email);
            const user = await user_container_1.userService.getUserById(userRecord.uid);
            if (!user) {
                throw new Error('User profile not found');
            }
            const session = {
                uid: user.id,
                createdAt: Date.now(),
                expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
                provider: 'email',
            };
            return {
                user,
                session,
                isNewUser: false,
            };
        }
        catch (error) {
            throw this.mapFirebaseError(error);
        }
    }
    async signInWithGoogle() {
        throw new auth_port_1.AuthError('Google sign-in is not available in server environment', 'UNKNOWN_ERROR', 'google');
    }
    async signInWithProvider(provider) {
        throw new auth_port_1.AuthError(`${provider} sign-in is not available in server environment`, 'UNKNOWN_ERROR', provider);
    }
    async signUpWithEmailAndPassword(credentials) {
        try {
            const { email, password, name } = credentials;
            const userRecord = await firebase_server_1.adminAuth.createUser({
                email,
                password,
                displayName: (name === null || name === void 0 ? void 0 : name.trim()) || undefined,
                emailVerified: false,
            });
            const user = await user_container_1.userService.syncUserFromAuth(userRecord.uid, userRecord.email, userRecord.displayName || name || email.split('@')[0], userRecord.photoURL || undefined);
            const session = {
                uid: user.id,
                createdAt: Date.now(),
                expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
                provider: 'email',
            };
            return {
                user,
                session,
                isNewUser: true,
            };
        }
        catch (error) {
            throw this.mapFirebaseError(error);
        }
    }
    onAuthStateChanged(callback) {
        this.getCurrentUser()
            .then((user) => callback(user))
            .catch(() => callback(null));
        return () => { };
    }
    /* ----------------------------------------------------------------------- */
    /* PRIVATE HELPERS
    /* ----------------------------------------------------------------------- */
    mapFirebaseError(error) {
        const code = error.code;
        const errorMap = {
            'auth/email-already-exists': 'EMAIL_ALREADY_EXISTS',
            'auth/user-not-found': 'USER_NOT_FOUND',
            'auth/invalid-email': 'INVALID_EMAIL',
            'auth/weak-password': 'WEAK_PASSWORD',
            'auth/user-disabled': 'USER_DISABLED',
        };
        const authErrorCode = errorMap[code] || 'UNKNOWN_ERROR';
        return new auth_port_1.AuthError(error.message || auth_port_1.AuthErrorMessages[authErrorCode], authErrorCode);
    }
}
exports.FirebaseAdminAuthClient = FirebaseAdminAuthClient;
