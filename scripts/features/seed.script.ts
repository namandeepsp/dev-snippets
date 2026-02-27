import { adminDb } from '../../src/services/firebase/firebase.server';
import { BaseScript } from '../core/base.script';
import type { FirestoreSnippet } from '../../src/features/snippets/core/snippet.types';
import { fileURLToPath } from 'node:url';

const DEFAULT_SEED_SNIPPET_COUNT = 100;

type SeedOwner = {
  id: string;
  name: string;
};

type SnippetTemplate = Pick<
  FirestoreSnippet,
  'title' | 'description' | 'code' | 'language' | 'technologies' | 'categories'
>;

const SEED_OWNERS: SeedOwner[] = [
  { id: 'seed-user-1', name: 'Dev User' },
  { id: 'seed-user-2', name: 'Python Dev' },
  { id: 'seed-user-3', name: 'Platform Engineer' },
];

const USEFUL_SNIPPET_TEMPLATES: SnippetTemplate[] = [
  {
    title: 'React Debounced Search Hook',
    description: 'Debounce input changes to reduce API calls in searchable UIs',
    code: 'import { useEffect, useState } from "react";\n\nexport function useDebouncedValue<T>(value: T, delay = 300) {\n  const [debounced, setDebounced] = useState(value);\n\n  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(id);\n  }, [value, delay]);\n\n  return debounced;\n}',
    language: 'typescript',
    technologies: ['react', 'typescript'],
    categories: ['frontend', 'hooks'],
  },
  {
    title: 'Express Request Logger Middleware',
    description: 'Capture method, path, status, and duration for each request',
    code: 'export const requestLogger = (req, res, next) => {\n  const start = Date.now();\n\n  res.on("finish", () => {\n    const durationMs = Date.now() - start;\n    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);\n  });\n\n  next();\n};',
    language: 'javascript',
    technologies: ['express', 'node'],
    categories: ['backend', 'middleware'],
  },
  {
    title: 'PostgreSQL Upsert User Settings',
    description: 'Insert a settings row or update it if user_id already exists',
    code: 'INSERT INTO user_settings (user_id, theme, timezone, updated_at)\nVALUES ($1, $2, $3, NOW())\nON CONFLICT (user_id)\nDO UPDATE SET\n  theme = EXCLUDED.theme,\n  timezone = EXCLUDED.timezone,\n  updated_at = NOW();',
    language: 'sql',
    technologies: ['sql', 'postgres-sql'],
    categories: ['database', 'queries'],
  },
  {
    title: 'Python Sliding Window Max Sum',
    description: 'Maximum sum of a contiguous subarray of size k',
    code: 'def max_window_sum(nums, k):\n    if k <= 0 or k > len(nums):\n        return None\n\n    window_sum = sum(nums[:k])\n    best = window_sum\n\n    for i in range(k, len(nums)):\n        window_sum += nums[i] - nums[i - k]\n        best = max(best, window_sum)\n\n    return best',
    language: 'python',
    technologies: ['python'],
    categories: ['algorithms', 'data-structures'],
  },
  {
    title: 'Docker Multi-Stage Build for Node',
    description: 'Build dependencies in one stage and run in a smaller image',
    code: 'FROM node:20-alpine AS deps\nWORKDIR /app\nCOPY package.json pnpm-lock.yaml ./\nRUN corepack enable && pnpm install --frozen-lockfile\n\nFROM node:20-alpine AS runtime\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nEXPOSE 3000\nCMD ["pnpm", "start"]',
    language: 'dockerfile',
    technologies: ['docker', 'dev-ops'],
    categories: ['infrastructure', 'deployment'],
  },
  {
    title: 'Next.js Server Action Validation',
    description: 'Validate form data on the server before persistence',
    code: '\'use server\'\n\nexport async function submitFeedback(_: unknown, formData: FormData) {\n  const message = String(formData.get("message") || "").trim();\n\n  if (message.length < 10) {\n    return { ok: false, error: "Message must be at least 10 characters." };\n  }\n\n  return { ok: true };\n}',
    language: 'typescript',
    technologies: ['nextjs', 'typescript'],
    categories: ['framework', 'frontend'],
  },
  {
    title: 'Go HTTP Health Endpoint',
    description: 'Minimal health check endpoint for service monitoring',
    code: 'package main\n\nimport (\n  "encoding/json"\n  "net/http"\n)\n\nfunc healthHandler(w http.ResponseWriter, _ *http.Request) {\n  w.Header().Set("Content-Type", "application/json")\n  _ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})\n}\n\nfunc main() {\n  http.HandleFunc("/health", healthHandler)\n  _ = http.ListenAndServe(":8080", nil)\n}',
    language: 'go',
    technologies: ['golang'],
    categories: ['language', 'backend'],
  },
];

export class SeedScript extends BaseScript {
  name = 'Seed Data';

  async run(): Promise<void> {
    await this.ensureReady();
    this.log('Seeding DEV database...');

    const snippets = this.getSampleSnippets(this.getSeedCount());

    for (const snippet of snippets) {
      await adminDb.collection('snippets').add(snippet);
    }

    this.logSuccess(`Seeded ${snippets.length} snippets`);
  }

  private getSeedCount(): number {
    const parsed = Number(process.env.SEED_SNIPPET_COUNT);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
    return DEFAULT_SEED_SNIPPET_COUNT;
  }

  private getSampleSnippets(count: number): Omit<FirestoreSnippet, 'id'>[] {
    const now = Date.now();
    const visibilities: FirestoreSnippet['visibility'][] = ['public', 'private', 'shared'];

    return Array.from({ length: count }, (_, index) => {
      const template = USEFUL_SNIPPET_TEMPLATES[index % USEFUL_SNIPPET_TEMPLATES.length];
      const owner = SEED_OWNERS[index % SEED_OWNERS.length];
      const createdAt = now - index * 60_000;
      const visibility = visibilities[index % visibilities.length];
      const isDeleted = index % 20 === 0;

      return {
        title: `${template.title} #${index + 1}`,
        description: template.description,
        code: template.code,
        language: template.language,
        technologies: template.technologies,
        categories: template.categories,
        visibility,
        ownerId: owner.id,
        ownerName: owner.name,
        likesCount: (index * 7) % 50,
        viewsCount: 50 + ((index * 37) % 1000),
        isDeleted,
        versions: [
          {
            version: 1,
            code: template.code,
            createdAt,
            createdBy: owner.id,
          },
        ],
        createdAt,
        updatedAt: createdAt,
      };
    });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  new SeedScript()
    .run()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
