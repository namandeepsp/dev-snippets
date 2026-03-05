import { adminDb } from '../../src/services/firebase/firebase.server';
import { BaseScript } from '../core/base.script';
import type { FirestoreSnippet } from '../../src/features/snippets/core/snippet.types';
import { fileURLToPath } from 'node:url';
import { SNIPPET_TEMPLATES_PART1 } from '../data/snippet.templates';
import { USER_TEMPLATES } from '../data/user.templates';

const DEFAULT_SEED_SNIPPET_COUNT = 100;

type SeedOwner = {
  id: string;
  name: string;
};

type SnippetTemplate = Pick<
  FirestoreSnippet,
  'title' | 'description' | 'code' | 'language' | 'technologies' | 'categories'
>;

const SEED_OWNERS: SeedOwner[] = [];

const USEFUL_SNIPPET_TEMPLATES: SnippetTemplate[] = SNIPPET_TEMPLATES_PART1;

export class SeedScript extends BaseScript {
  name = 'Seed Data';

  async run(): Promise<void> {
    await this.ensureReady();
    this.log('Seeding snippets...');

    // Get all users from Firestore that match our template emails
    const templateEmails = USER_TEMPLATES.map(t => t.email);
    const usersSnapshot = await adminDb.collection('users')
      .where('email', 'in', templateEmails)
      .get();

    if (usersSnapshot.empty) {
      this.logError('No seed users found. Please run seed-users script first.');
      return;
    }

    const owners: SeedOwner[] = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));

    this.log(`Found ${owners.length} users: ${owners.map(o => o.name).join(', ')}`);

    const snippets = this.getSampleSnippets(this.getSeedCount(), owners);

    for (const snippet of snippets) {
      await adminDb.collection('snippets').add(snippet);
    }

    this.logSuccess(`Seeded ${snippets.length} snippets across ${owners.length} users`);
  }

  private getSeedCount(): number {
    const parsed = Number(process.env.SEED_SNIPPET_COUNT);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
    return DEFAULT_SEED_SNIPPET_COUNT;
  }

  private getSampleSnippets(count: number, owners: SeedOwner[]): Omit<FirestoreSnippet, 'id'>[] {
    const now = Date.now();
    const totalTemplates = USEFUL_SNIPPET_TEMPLATES.length;

    return Array.from({ length: Math.min(count, totalTemplates) }, (_, index) => {
      const template = USEFUL_SNIPPET_TEMPLATES[index];
      const owner = owners[index % owners.length]; // Randomly cycle through owners
      const createdAt = now - index * 60_000;
      const visibility = index % 2 === 0 ? 'public' : 'private';

      return {
        title: template.title,
        description: template.description,
        code: template.code,
        language: template.language,
        technologies: template.technologies,
        categories: template.categories,
        visibility,
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
