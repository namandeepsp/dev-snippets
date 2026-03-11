"use strict";
/**
 * ============================================================================
 * SNIPPET TYPES
 * ============================================================================
 *
 * Single source of truth for all snippet-related types.
 *
 * Layered architecture:
 * 1. FirestoreSnippet - Raw database shape
 * 2. Snippet - Domain model (FirestoreSnippet + id + versions)
 * 3. DTOs - Input/output types for operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
