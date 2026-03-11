"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnippetScript = void 0;
const base_script_1 = require("../core/base.script");
const snippet_service_1 = require("../../src/features/snippets/core/snippet.service");
const firebase_snippet_repository_1 = require("../../src/features/snippets/infra/repositories/firebase-snippet.repository");
const DEFAULT_BULK_SNIPPET_COUNT = 100;
const USEFUL_SNIPPET_TEMPLATES = [
    {
        title: 'React Debounced Search Hook',
        description: 'Debounce input changes to reduce API calls in searchable UIs.',
        code: `import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay = 300) {
	const [debounced, setDebounced] = useState(value)

	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delay)
		return () => clearTimeout(id)
	}, [value, delay])

	return debounced
}`,
        language: 'typescript',
        technologies: ['react', 'typescript'],
        categories: ['frontend', 'hooks'],
    },
    {
        title: 'Express Rate Limit Middleware',
        description: 'Simple in-memory rate limiter for API endpoints.',
        code: `const requests = new Map()

export function rateLimit(windowMs = 60_000, max = 100) {
	return (req, res, next) => {
		const key = req.ip
		const now = Date.now()
		const entry = requests.get(key) || { count: 0, resetAt: now + windowMs }

		if (now > entry.resetAt) {
			entry.count = 0
			entry.resetAt = now + windowMs
		}

		entry.count += 1
		requests.set(key, entry)

		if (entry.count > max) {
			return res.status(429).json({ error: 'Too many requests' })
		}

		next()
	}
}`,
        language: 'javascript',
        technologies: ['express', 'node'],
        categories: ['backend', 'middleware'],
    },
    {
        title: 'PostgreSQL Upsert Pattern',
        description: 'Insert a row or update selected columns when a conflict occurs.',
        code: `INSERT INTO user_settings (user_id, theme, timezone, updated_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (user_id)
DO UPDATE SET
	theme = EXCLUDED.theme,
	timezone = EXCLUDED.timezone,
	updated_at = NOW();`,
        language: 'sql',
        technologies: ['sql', 'postgres-sql'],
        categories: ['database', 'queries'],
    },
    {
        title: 'Docker Multi-Stage Node Build',
        description: 'Lean production image using dependency and runtime stages.',
        code: `FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["pnpm", "start"]`,
        language: 'dockerfile',
        technologies: ['docker', 'dev-ops'],
        categories: ['infrastructure', 'deployment'],
    },
    {
        title: 'Python Sliding Window Maximum Sum',
        description: 'Find the maximum sum of any contiguous subarray of fixed length.',
        code: `def max_window_sum(nums, k):
    if k <= 0 or k > len(nums):
        return None

    window_sum = sum(nums[:k])
    best = window_sum

    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        best = max(best, window_sum)

    return best`,
        language: 'python',
        technologies: ['python'],
        categories: ['algorithms', 'data-structures'],
    },
    {
        title: 'Next.js Server Action Form Handler',
        description: 'Validate form input in a server action and return typed field errors.',
        code: `'use server'

export async function submitFeedback(_: unknown, formData: FormData) {
	const message = String(formData.get('message') || '').trim()

	if (message.length < 10) {
		return { ok: false, error: 'Message must be at least 10 characters.' }
	}

	// Persist to DB here
	return { ok: true }
}`,
        language: 'typescript',
        technologies: ['nextjs', 'typescript'],
        categories: ['framework', 'frontend'],
    },
];
class SnippetScript extends base_script_1.BaseScript {
    constructor() {
        super(...arguments);
        this.name = 'Snippet Tests';
        this.ownerId = `test-owner-${Date.now()}`;
        this.ownerName = 'Script Snippet Owner';
        this.snippetService = new snippet_service_1.SnippetService(new firebase_snippet_repository_1.FirebaseSnippetRepository(), new firebase_snippet_repository_1.FirebaseSnippetRepository());
    }
    async run() {
        await this.ensureReady();
        this.log('Running snippet tests...');
        await this.testCreateSnippet();
        await this.testCreateBulkSnippets();
        await this.testListPublicSnippets();
        await this.testGetSnippetById();
        await this.testListByUser();
        await this.testListByVisibility();
        await this.testUpdateSnippet();
        await this.testDeleteSnippet();
        this.logSuccess('All snippet tests passed');
    }
    async testCreateSnippet() {
        const randomSnippet = this.buildUsefulRandomSnippet();
        const snippet = await this.snippetService.createSnippet(randomSnippet, this.ownerId, this.ownerName);
        if (!snippet.id || snippet.title !== randomSnippet.title) {
            throw new Error('Create snippet failed');
        }
        this.snippetId = snippet.id;
        this.log('✓ Create snippet');
    }
    async testCreateBulkSnippets(count = DEFAULT_BULK_SNIPPET_COUNT) {
        const visibilities = ['public', 'private', 'shared'];
        let created = 0;
        for (let i = 0; i < count; i += 1) {
            const snippet = this.buildUsefulRandomSnippet(i + 1);
            snippet.visibility = visibilities[i % visibilities.length];
            await this.snippetService.createSnippet(snippet, this.ownerId, this.ownerName);
            created += 1;
        }
        this.log(`✓ Bulk create snippets (${created} created)`);
    }
    async testListPublicSnippets() {
        const snippets = await this.snippetService.listPublic();
        if (!Array.isArray(snippets)) {
            throw new Error('List public snippets failed');
        }
        this.log(`✓ List public snippets (${snippets.length} found)`);
    }
    async testGetSnippetById() {
        if (!this.snippetId) {
            throw new Error('Get snippet by ID failed (missing test snippet)');
        }
        const snippet = await this.snippetService.getById(this.snippetId);
        if (!snippet) {
            throw new Error('Get snippet by ID failed');
        }
        this.log('✓ Get snippet by ID');
    }
    async testListByUser() {
        const snippets = await this.snippetService.listByUser(this.ownerId);
        if (!Array.isArray(snippets)) {
            throw new Error('List snippets by user failed');
        }
        this.log(`✓ List snippets by user (${snippets.length} found)`);
    }
    async testListByVisibility() {
        const snippets = await this.snippetService.listByVisibility('public');
        if (!Array.isArray(snippets)) {
            throw new Error('List snippets by visibility failed');
        }
        this.log(`✓ List snippets by visibility (${snippets.length} found)`);
    }
    async testUpdateSnippet() {
        if (!this.snippetId) {
            throw new Error('Update snippet failed (missing test snippet)');
        }
        const updateInput = { title: 'Updated Title' };
        await this.snippetService.updateSnippet(this.snippetId, updateInput, this.ownerId);
        this.log('✓ Update snippet');
    }
    async testDeleteSnippet() {
        if (!this.snippetId) {
            throw new Error('Delete snippet failed (missing test snippet)');
        }
        await this.snippetService.deleteSnippet(this.snippetId, this.ownerId);
        this.log('✓ Delete snippet');
    }
    buildUsefulRandomSnippet(seed) {
        const template = this.pickRandom(USEFUL_SNIPPET_TEMPLATES);
        const suffix = seed !== null && seed !== void 0 ? seed : Math.floor(Math.random() * 10000);
        return {
            title: `${template.title} #${suffix}`,
            description: template.description,
            code: template.code,
            language: template.language,
            technologies: template.technologies,
            categories: template.categories,
            visibility: 'public',
        };
    }
    pickRandom(items) {
        const index = Math.floor(Math.random() * items.length);
        return items[index];
    }
}
exports.SnippetScript = SnippetScript;
