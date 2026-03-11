"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmailCredentials = isEmailCredentials;
exports.isOAuthCredentials = isOAuthCredentials;
/* ------------------------------------------------------------------------- */
/* TYPE GUARDS
/* ------------------------------------------------------------------------- */
function isEmailCredentials(credentials) {
    return (credentials === null || credentials === void 0 ? void 0 : credentials.email) && (credentials === null || credentials === void 0 ? void 0 : credentials.password);
}
function isOAuthCredentials(credentials) {
    return (credentials === null || credentials === void 0 ? void 0 : credentials.provider) && credentials.provider !== 'email';
}
