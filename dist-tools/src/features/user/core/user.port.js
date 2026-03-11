"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = exports.UserPortError = void 0;
/**
 * ============================================================================
 * PORT ERROR TYPES
 * ============================================================================
 *
 * Standardized error types for consistent error handling across
 * different database implementations.
 */
class UserPortError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'UserPortError';
    }
}
exports.UserPortError = UserPortError;
exports.ErrorMessages = {
    DUPLICATE_EMAIL: 'A user with this email already exists',
    DUPLICATE_USERNAME: 'This username is already taken',
    USER_NOT_FOUND: 'User not found',
    INVALID_EMAIL: 'Invalid email format',
    DATABASE_ERROR: 'Database operation failed',
};
