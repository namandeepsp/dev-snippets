import { adminDb } from '../../src/services/firebase/firebase.server';
import { BaseScript } from '../core/base.script';
import type { FirestoreSnippet } from '../../src/features/snippets/core/snippet.types';
import { fileURLToPath } from 'node:url';
import { SNIPPET_TEMPLATES_PART1 } from '../data/snippet-templates-part';

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

const USEFUL_SNIPPET_TEMPLATES: SnippetTemplate[] = SNIPPET_TEMPLATES_PART1;

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
    const totalTemplates = USEFUL_SNIPPET_TEMPLATES.length;

    return Array.from({ length: Math.min(count, totalTemplates) }, (_, index) => {
      const template = USEFUL_SNIPPET_TEMPLATES[index];
      const owner = SEED_OWNERS[index % SEED_OWNERS.length];
      const createdAt = now - index * 60_000;

      return {
        title: template.title,
        description: template.description,
        code: template.code,
        language: template.language,
        technologies: template.technologies,
        categories: template.categories,
        visibility: 'public' as const,
        ownerId: owner.id,
        ownerName: owner.name,
        likesCount: 0,
        viewsCount: 0,
        isDeleted: false,
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
