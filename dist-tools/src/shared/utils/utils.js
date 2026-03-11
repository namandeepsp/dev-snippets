"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.getAuthProvider = getAuthProvider;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
/* Merge Tailwind classes */
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
/* Extract sign-in provider */
function getAuthProvider(decodedToken) {
    var _a;
    const providerId = (_a = decodedToken.firebase) === null || _a === void 0 ? void 0 : _a.sign_in_provider;
    if (!providerId) {
        console.warn('No sign-in provider found in token:', decodedToken);
        return 'email'; // Default to email if not available
    }
    return (providerId === 'password'
        ? 'email'
        : (providerId === null || providerId === void 0 ? void 0 : providerId.replace('.com', '')) || 'google');
}
