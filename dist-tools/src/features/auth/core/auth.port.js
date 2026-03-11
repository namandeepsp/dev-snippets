"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthErrorMessages = exports.AuthError = void 0;
/**
 * ============================================================================
 * AUTHENTICATION ERROR TYPES
 * ============================================================================
 */
class AuthError extends Error {
    constructor(message, code, provider) {
        super(message);
        this.code = code;
        this.provider = provider;
        this.name = 'AuthError';
    }
}
exports.AuthError = AuthError;
exports.AuthErrorMessages = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
    WEAK_PASSWORD: 'Password should be at least 6 characters',
    INVALID_EMAIL: 'Please enter a valid email address',
    USER_DISABLED: 'This account has been disabled',
    USER_NOT_FOUND: 'No account found with this email',
    POPUP_BLOCKED: 'Sign-in popup was blocked by your browser',
    POPUP_CLOSED: 'Sign-in popup was closed before completing',
    UNAUTHORIZED_DOMAIN: 'This domain is not authorized for authentication',
    NETWORK_ERROR: 'Network error. Please check your connection',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again',
    UNKNOWN_ERROR: 'An unexpected error occurred',
};
