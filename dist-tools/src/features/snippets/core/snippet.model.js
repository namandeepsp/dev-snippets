"use strict";
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
exports.createSnippet = createSnippet;
exports.createNextVersion = createNextVersion;
exports.canEdit = canEdit;
exports.canView = canView;
exports.getLatestVersion = getLatestVersion;
exports.getVersion = getVersion;
exports.summarizeSnippet = summarizeSnippet;
/**
 * ============================================================================
 * SNIPPET MODEL
 * ============================================================================
 *
 * Factory functions and domain logic for Snippet entities.
 *
 * These functions are PURE - they don't interact with databases or APIs.
 * They just transform data according to business rules.
 */
/**
 * Create a new snippet from user input.
 *
 * This is a factory function - it creates the initial snippet state
 * before it's saved to the database.
 */
function createSnippet(input) {
    const now = Date.now();
    const initialVersion = {
        version: 1,
        code: input.code,
        createdAt: now,
        createdBy: input.ownerId,
    };
    return Object.assign(Object.assign({}, input), { likesCount: 0, viewsCount: 0, createdAt: now, updatedAt: now, isDeleted: false, versions: [initialVersion], sharedWith: input.visibility === 'shared' ? [] : undefined });
}
/**
 * Create a new version entry when code changes.
 *
 * This preserves the OLD code as a version before updating
 * to the new code.
 */
function createNextVersion(snippet, _newCode, userId) {
    return {
        version: snippet.versions.length + 1,
        code: snippet.code, // Store the CURRENT code as the version
        createdAt: Date.now(),
        createdBy: userId,
    };
}
/**
 * Check if a user can edit a snippet.
 */
function canEdit(snippet, userId) {
    if (!userId)
        return false;
    return snippet.ownerId === userId;
}
/**
 * Check if a user can view a snippet.
 */
function canView(snippet, userId) {
    var _a;
    // Public snippets: anyone can view
    if (snippet.visibility === 'public') {
        return true;
    }
    // Private snippets: only owner
    if (snippet.visibility === 'private') {
        return snippet.ownerId === userId;
    }
    // Shared snippets: owner + shared users
    if (snippet.visibility === 'shared') {
        return (snippet.ownerId === userId ||
            (userId !== '' &&
                userId !== undefined &&
                ((_a = snippet.sharedWith) === null || _a === void 0 ? void 0 : _a.includes(userId)) === true));
    }
    return false;
}
/**
 * Get the latest version of a snippet.
 */
function getLatestVersion(snippet) {
    return snippet.versions[snippet.versions.length - 1];
}
/**
 * Get a specific version of a snippet.
 */
function getVersion(snippet, versionNumber) {
    return snippet.versions.find((v) => v.version === versionNumber);
}
/**
 * Summarize snippet for listings.
 * Removes heavy fields like versions and full code preview.
 */
function summarizeSnippet(snippet) {
    const { versions, code } = snippet, rest = __rest(snippet, ["versions", "code"]);
    return Object.assign(Object.assign({}, rest), { codePreview: code.split('\n').slice(0, 5).join('\n') +
            (code.split('\n').length > 5 ? '\n...' : '') });
}
