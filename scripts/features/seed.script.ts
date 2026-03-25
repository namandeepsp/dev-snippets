import { adminDb } from '../../src/services/firebase/firebase.server';
import { BaseScript } from '../core/base.script';
import type { FirestoreSnippet } from '../../src/features/snippets/core/snippet.types';
import { fileURLToPath } from 'node:url';
import { SNIPPET_TEMPLATES_PART1 } from '../data/snippet.templates';
import { JS_SNIPPET_TEMPLATES } from '../data/jsSnippets.templates';
import { TS_SNIPPET_TEMPLATES } from '../data/tsSnippets.templates';
import { GO_SNIPPET_TEMPLATES } from '../data/goSnippets.templates';
import { PYTHON_SNIPPET_TEMPLATES } from '../data/pythonSnippets.templates';
import { JAVA_SNIPPET_TEMPLATES } from '../data/javaSnippets.templates';
import { HTML_SNIPPET_TEMPLATES } from '../data/htmlSnippets.templates';
import { CSS_SNIPPET_TEMPLATES } from '../data/cssSnippets.templates';
import { SQL_SNIPPET_TEMPLATES } from '../data/sqlSnippets.templates';
import { BROWSER_EXTENSION_SNIPPET_TEMPLATES } from '../data/browserExtensionSnippets.templates';
import { expressSnippets } from '../data/expressSnippets.templates';
import { REACT_SNIPPET_TEMPLATES } from '../data/reactSnippets.templates';
import { USER_TEMPLATES } from '../data/user.templates';

const DEFAULT_SEED_SNIPPET_COUNT = -1; // -1 means use all available templates

type SeedOwner = {
  id: string;
  name: string;
};

type SnippetTemplate = Pick<
  FirestoreSnippet,
  'title' | 'description' | 'code' | 'language' | 'technologies' | 'categories'
>;

const ALL_SNIPPET_TEMPLATES: SnippetTemplate[] = [
  ...JS_SNIPPET_TEMPLATES,
  ...TS_SNIPPET_TEMPLATES,
  ...GO_SNIPPET_TEMPLATES,
  ...PYTHON_SNIPPET_TEMPLATES,
  ...JAVA_SNIPPET_TEMPLATES,
  ...HTML_SNIPPET_TEMPLATES,
  ...CSS_SNIPPET_TEMPLATES,
  ...SQL_SNIPPET_TEMPLATES,
  ...BROWSER_EXTENSION_SNIPPET_TEMPLATES,
  ...expressSnippets,
  ...REACT_SNIPPET_TEMPLATES,
];

const USEFUL_SNIPPET_TEMPLATES: SnippetTemplate[] = ALL_SNIPPET_TEMPLATES;

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
    
    // Randomly shuffle snippets before inserting
    const shuffledSnippets = this.shuffleArray(snippets);

    for (const snippet of shuffledSnippets) {
      await adminDb.collection('snippets').add(snippet);
    }

    this.logSuccess(`Seeded ${shuffledSnippets.length} snippets across ${owners.length} users`);
  }

  private getSeedCount(): number {
    const parsed = Number(process.env.SEED_SNIPPET_COUNT);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
    // Return -1 to use all available templates
    return DEFAULT_SEED_SNIPPET_COUNT;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getSampleSnippets(count: number, owners: SeedOwner[]): Omit<FirestoreSnippet, 'id'>[] {
    const now = Date.now();
    const totalTemplates = USEFUL_SNIPPET_TEMPLATES.length;
    const snippets: Omit<FirestoreSnippet, 'id'>[] = [];

    // If count is -1, use all templates; otherwise use the specified count
    const actualCount = count === -1 ? totalTemplates : Math.min(count, totalTemplates);
    
    for (let index = 0; index < actualCount; index++) {
      const template = USEFUL_SNIPPET_TEMPLATES[index];
      const owner = owners[index % owners.length];
      const createdAt = now - index * 60_000;

      // Random private count between 2-5 per 20 snippets
      const cyclePosition = index % 20;
      const privateCount = Math.floor(Math.random() * 4) + 2; // 2-5
      const isPrivate = cyclePosition >= (20 - privateCount);
      const visibility = isPrivate ? 'private' : 'public';

      snippets.push({
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
      });
    }

    return snippets;
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
