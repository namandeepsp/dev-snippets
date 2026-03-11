"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = exports.DomainErrorMessages = exports.UserDomainError = void 0;
const user_types_1 = require("./user.types");
/**
 * ============================================================================
 * DOMAIN ERRORS
 * ============================================================================
 *
 * Business logic errors, not persistence errors.
 * These are what the UI/API layer should handle.
 */
class UserDomainError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'UserDomainError';
    }
}
exports.UserDomainError = UserDomainError;
exports.DomainErrorMessages = {
    INVALID_USERNAME: 'Username can only contain letters, numbers, and underscores',
    USERNAME_TAKEN: 'This username is already taken',
    EMAIL_TAKEN: 'This email is already registered',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'You do not have permission to perform this action',
};
/**
 * ============================================================================
 * USER SERVICE
 * ============================================================================
 *
 * Orchestrates user-related operations with business logic.
 *
 * Key responsibilities:
 * 1. Validate business rules
 * 2. Coordinate between multiple repositories (if needed)
 * 3. Transform DTOs to repository inputs
 * 4. Handle domain events
 *
 * This layer has NO IDEA about Firebase, PostgreSQL, or any database.
 * It only depends on the repository INTERFACE.
 */
class UserService {
    constructor(userPort) {
        this.userPort = userPort;
    }
    /* ----------------------------------------------------------------------- */
    /* CREATE
    /* ----------------------------------------------------------------------- */
    /**
     * Create a new user profile.
     *
     * Business rules:
     * 1. Username must be unique
     * 2. Username format: letters, numbers, underscores only
     * 3. Email must be unique
     * 4. All required fields must be present
     */
    async createUser(input) {
        // Validate username format
        if (!this.isValidUsername(input.username)) {
            throw new UserDomainError(exports.DomainErrorMessages.INVALID_USERNAME, 'INVALID_USERNAME');
        }
        // Business rule: Check uniqueness (repository will also check, but we want early feedback)
        try {
            return await this.userPort.create(input);
        }
        catch (error) {
            // Translate repository errors to domain errors
            if (error.code === 'DUPLICATE_EMAIL') {
                throw new UserDomainError(exports.DomainErrorMessages.EMAIL_TAKEN, 'EMAIL_TAKEN');
            }
            if (error.code === 'DUPLICATE_USERNAME') {
                throw new UserDomainError(exports.DomainErrorMessages.USERNAME_TAKEN, 'USERNAME_TAKEN');
            }
            throw error;
        }
    }
    /* ----------------------------------------------------------------------- */
    /* READ
    /* ----------------------------------------------------------------------- */
    /**
     * Get a user by ID.
     * Returns null if not found (optional entity pattern).
     */
    async getUserById(id) {
        if (!id)
            return null;
        return this.userPort.findById(id);
    }
    /**
     * Get a user by email.
     * Used primarily by auth feature.
     */
    async getUserByEmail(email) {
        if (!email)
            return null;
        return this.userPort.findByEmail(email);
    }
    /**
     * Get a public user profile by username.
     * Used for profile pages.
     */
    async getPublicProfile(username) {
        if (!username)
            return null;
        return this.userPort.findByUsername(username);
    }
    /**
     * Get multiple users by their IDs.
     * Used for batch operations (e.g., loading snippet authors).
     */
    async getUsersByIds(ids) {
        if (ids.length === 0)
            return {};
        const users = await this.userPort.findManyByIds(ids);
        // Convert to record keyed by ID and strip sensitive data
        return users.reduce((acc, user) => {
            acc[user.id] = (0, user_types_1.toPublicUser)(user);
            return acc;
        }, {});
    }
    /* ----------------------------------------------------------------------- */
    /* UPDATE
    /* ----------------------------------------------------------------------- */
    /**
     * Update a user's profile.
     *
     * Business rules:
     * 1. User must exist
     * 2. Only allowed fields can be updated (name, avatar, bio)
     * 3. Cannot update email or username via this method
     */
    async updateUser(userId, input, requestingUserId) {
        // Authorization check
        if (userId !== requestingUserId) {
            throw new UserDomainError(exports.DomainErrorMessages.UNAUTHORIZED, 'UNAUTHORIZED');
        }
        // Ensure user exists
        const existing = await this.userPort.findById(userId);
        if (!existing) {
            throw new UserDomainError(exports.DomainErrorMessages.USER_NOT_FOUND, 'USER_NOT_FOUND');
        }
        // Prevent updating email or username via this method
        if ('email' in input || 'username' in input) {
            throw new UserDomainError('Cannot update email or username through profile update', 'UNAUTHORIZED');
        }
        await this.userPort.update(userId, input);
    }
    /* ----------------------------------------------------------------------- */
    /* DELETE
    /* ----------------------------------------------------------------------- */
    /**
     * Delete a user account.
     *
     * Business rules:
     * 1. User must exist
     * 2. User can only delete their own account
     */
    async deleteUser(userId, requestingUserId) {
        // Authorization check
        if (userId !== requestingUserId) {
            throw new UserDomainError(exports.DomainErrorMessages.UNAUTHORIZED, 'UNAUTHORIZED');
        }
        // Ensure user exists
        const existing = await this.userPort.findById(userId);
        if (!existing) {
            throw new UserDomainError(exports.DomainErrorMessages.USER_NOT_FOUND, 'USER_NOT_FOUND');
        }
        await this.userPort.delete(userId);
    }
    /* ----------------------------------------------------------------------- */
    /* AUTH INTEGRATION
    /* ----------------------------------------------------------------------- */
    /**
     * Called by auth feature after successful authentication.
     * Creates or updates user profile from auth provider data.
     */
    async syncUserFromAuth(uid, email, name, avatarUrl) {
        const dto = {
            uid,
            username: this.generateUsernameFromEmail(email),
            name,
            email,
            avatarUrl,
            bio: '',
        };
        // Upsert - create if doesn't exist, update if does
        return this.userPort.upsert(dto);
    }
    /* ----------------------------------------------------------------------- */
    /* PRIVATE HELPERS
    /* ----------------------------------------------------------------------- */
    isValidUsername(username) {
        // Only letters, numbers, underscores, 3-20 characters
        return /^[a-zA-Z0-9_]{3,20}$/.test(username);
    }
    generateUsernameFromEmail(email) {
        return email
            .split('@')[0]
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 20);
    }
}
exports.UserService = UserService;
