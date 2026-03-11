"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnippetService = void 0;
const user_container_1 = require("@/features/user/user.container");
const snippet_model_1 = require("./snippet.model");
/**
 * ============================================================================
 * SNIPPET SERVICE
 * ============================================================================
 *
 * Orchestrates snippet-related operations with business logic.
 *
 * Key responsibilities:
 * 1. Validate business rules
 * 2. Enrich data with ownership metadata
 * 3. Handle versioning
 * 4. Authorization checks
 *
 * This is the PUBLIC API for server components.
 */
class SnippetService {
    constructor(snippetPort, snippetRepository) {
        this.snippetPort = snippetPort;
        this.snippetRepository = snippetRepository;
    }
    /* ----------------------------------------------------------------------- */
    /* CREATE
    /* ----------------------------------------------------------------------- */
    /**
     * Create a new snippet.
     *
     * Business rules:
     * 1. User must be authenticated
     * 2. Title and code are required
     * 3. Creates initial version
     */
    async createSnippet(input, userId, userName) {
        const now = Date.now();
        const createInput = Object.assign(Object.assign({}, input), { ownerId: userId, ownerName: userName, likesCount: 0, viewsCount: 0, createdAt: now, updatedAt: now, isDeleted: false, versions: [
                {
                    version: 1,
                    code: input.code,
                    createdAt: now,
                    createdBy: userId,
                },
            ] });
        return this.snippetPort.create(createInput);
    }
    /* ----------------------------------------------------------------------- */
    /* READ
    /* ----------------------------------------------------------------------- */
    /**
     * Get a snippet by ID.
     * Returns null if not found or deleted.
     */
    async getById(id) {
        return this.snippetRepository.getById(id);
    }
    /**
     * List all public snippets.
     */
    async listPublic(sortBy) {
        return this.snippetRepository.listPublic(sortBy);
    }
    /**
     * List snippets by user with optional visibility filter.
     */
    async listByUser(userId, visibility) {
        return this.snippetRepository.listByUser(userId, visibility);
    }
    /**
     * List public snippets by username.
     * Used for profile pages.
     */
    async listByUsername(username) {
        if (!username)
            return [];
        const user = await user_container_1.userService.getPublicProfile(username);
        if (!user)
            return [];
        return this.snippetRepository.listByUser(user.id, 'public');
    }
    /**
     * List snippets by visibility.
     */
    async listByVisibility(visibility, userId) {
        return this.snippetRepository.listByVisibility(visibility, userId);
    }
    /* ----------------------------------------------------------------------- */
    /* UPDATE
    /* ----------------------------------------------------------------------- */
    /**
     * Update a snippet.
     *
     * Business rules:
     * 1. User must be the owner
     * 2. Creates new version if code changes
     */
    async updateSnippet(snippetId, input, userId) {
        const snippet = await this.snippetRepository.getById(snippetId);
        if (!snippet) {
            throw new Error('Snippet not found');
        }
        if (snippet.ownerId !== userId) {
            throw new Error('Unauthorized');
        }
        const updateInput = Object.assign(Object.assign({}, input), { updatedAt: Date.now() });
        // If code is being updated, create a new version
        if (input.code && input.code !== snippet.code) {
            const newVersion = (0, snippet_model_1.createNextVersion)(snippet, input.code, userId);
            updateInput.versions = [...snippet.versions, newVersion];
        }
        await this.snippetRepository.update(snippetId, updateInput);
    }
    /* ----------------------------------------------------------------------- */
    /* DELETE
    /* ----------------------------------------------------------------------- */
    /**
     * Delete a snippet (soft delete).
     *
     * Business rules:
     * 1. User must be the owner
     */
    async deleteSnippet(snippetId, userId) {
        const snippet = await this.snippetRepository.getById(snippetId);
        if (!snippet) {
            throw new Error('Snippet not found');
        }
        if (snippet.ownerId !== userId) {
            throw new Error('Unauthorized');
        }
        await this.snippetRepository.delete(snippetId);
    }
    /* ----------------------------------------------------------------------- */
    /* VERSION CONTROL
    /* ----------------------------------------------------------------------- */
    /**
     * Restore a previous version of a snippet.
     *
     * Business rules:
     * 1. User must be the owner
     * 2. Creates a new version with the restored code
     */
    async restoreVersion(snippetId, versionNumber, userId) {
        const snippet = await this.snippetRepository.getById(snippetId);
        if (!snippet) {
            throw new Error('Snippet not found');
        }
        if (snippet.ownerId !== userId) {
            throw new Error('Unauthorized');
        }
        const version = snippet.versions.find((v) => v.version === versionNumber);
        if (!version) {
            throw new Error('Version not found');
        }
        // Create new version with current code before restoring
        const newVersion = (0, snippet_model_1.createNextVersion)(snippet, snippet.code, userId);
        await this.snippetRepository.update(snippetId, {
            code: version.code,
            versions: [...snippet.versions, newVersion],
            updatedAt: Date.now(),
        });
    }
    /**
     * Get version history for a snippet.
     */
    async getVersionHistory(snippetId, userId) {
        const snippet = await this.snippetRepository.getById(snippetId);
        if (!snippet) {
            throw new Error('Snippet not found');
        }
        // Private snippets: only owner can view history
        if (snippet.visibility === 'private' && snippet.ownerId !== userId) {
            throw new Error('Unauthorized');
        }
        return snippet.versions;
    }
    /* ----------------------------------------------------------------------- */
    /* SHARING
    /* ----------------------------------------------------------------------- */
    /**
     * Share a snippet with specific users.
     *
     * Business rules:
     * 1. User must be the owner
     * 2. Snippet visibility must be 'shared'
     */
    async shareWithUsers(snippetId, userIds, requestingUserId) {
        const snippet = await this.snippetRepository.getById(snippetId);
        if (!snippet) {
            throw new Error('Snippet not found');
        }
        if (snippet.ownerId !== requestingUserId) {
            throw new Error('Unauthorized');
        }
        const sharedWith = [...new Set([...(snippet.sharedWith || []), ...userIds])];
        await this.snippetRepository.update(snippetId, {
            visibility: 'shared',
            sharedWith,
            updatedAt: Date.now(),
        });
    }
    /**
     * Remove sharing from specific users.
     */
    async unshareWithUsers(snippetId, userIds, requestingUserId) {
        const snippet = await this.snippetRepository.getById(snippetId);
        if (!snippet) {
            throw new Error('Snippet not found');
        }
        if (snippet.ownerId !== requestingUserId) {
            throw new Error('Unauthorized');
        }
        const sharedWith = (snippet.sharedWith || []).filter((id) => !userIds.includes(id));
        await this.snippetRepository.update(snippetId, {
            sharedWith,
            updatedAt: Date.now(),
        });
    }
    /* ----------------------------------------------------------------------- */
    /* UTILITIES
    /* ----------------------------------------------------------------------- */
    /**
     * Increment view count.
     * Fire-and-forget, doesn't throw.
     */
    async incrementViews(snippetId) {
        try {
            await this.snippetRepository.incrementViews(snippetId);
        }
        catch (error) {
            console.error(`Failed to increment views for snippet ${snippetId}:`, error);
        }
    }
    /**
     * Toggle like on a snippet.
     * TODO: Implement likes feature
     */
    async toggleLike(_snippetId, _userId) {
        throw new Error('Not implemented');
    }
}
exports.SnippetService = SnippetService;
