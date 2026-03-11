"use strict";
/**
 * ============================================================================
 * CORE USER TYPES
 * ============================================================================
 *
 * This is the SINGLE SOURCE OF TRUTH for all user-related data shapes.
 * All other features (auth, snippets, etc.) MUST derive from these types.
 *
 * The types are organized in layers:
 * 1. DB Model - Pure data shape, no ID (Firestore adds doc id)
 * 2. Domain Model - DB Model + ID (what our app uses internally)
 * 3. Public Model - Domain Model - sensitive fields (what we expose to clients)
 * 4. DTOs - Input/Output types for specific operations
 */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCompleteUser = isCompleteUser;
exports.toPublicUser = toPublicUser;
exports.generateUsernameFromEmail = generateUsernameFromEmail;
exports.createUserDTOFromAuth = createUserDTOFromAuth;
/* ------------------------------------------------------------------------- */
/* 5. TYPE GUARDS & UTILITIES                                               */
/* ------------------------------------------------------------------------- */
/**
 * Type guard to check if a user object is complete
 */
function isCompleteUser(user) {
    return !!(user.id && user.username && user.name && user.email);
}
/**
 * Convert a full User to PublicUser
 */
function toPublicUser(user) {
    const { email } = user, publicUser = __rest(user, ["email"]);
    return publicUser;
}
/**
 * Generate a username from email
 */
function generateUsernameFromEmail(email) {
    return email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}
/**
 * Create a CreateUserDTO from authentication data
 */
function createUserDTOFromAuth(uid, email, name, avatarUrl) {
    return {
        uid,
        username: generateUsernameFromEmail(email),
        name,
        email,
        avatarUrl,
        bio: '',
    };
}
