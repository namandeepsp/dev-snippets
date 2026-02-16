import { adminDb } from '../../src/services/firebase/firebase.server';
import { BaseScript } from '../core/base.script';
import type { FirestoreSnippet } from '../../src/features/snippets/core/snippet.types';

export class SeedScript extends BaseScript {
  name = 'Seed Data';

  async run(): Promise<void> {
    await this.ensureReady();
    this.log('Seeding DEV database...');

    const snippets = this.getSampleSnippets();

    for (const snippet of snippets) {
      await adminDb.collection('snippets').add(snippet);
    }

    this.logSuccess(`Seeded ${snippets.length} snippets`);
  }

  private getSampleSnippets(): Omit<FirestoreSnippet, 'id'>[] {
    const now = Date.now();

    return [
      {
        title: 'React useState Hook',
        description: 'Basic example of useState hook in React',
        code: 'const [count, setCount] = useState(0);',
        language: 'typescript',
        technologies: ['react', 'typescript'],
        categories: ['frontend', 'hooks'],
        visibility: 'public',
        ownerId: 'seed-user-1',
        ownerName: 'Dev User',
        likesCount: 5,
        viewsCount: 100,
        isDeleted: false,
        versions: [
          {
            version: 1,
            code: 'const [count, setCount] = useState(0);',
            createdAt: now,
            createdBy: 'seed-user-1',
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Express Middleware',
        description: 'Custom authentication middleware for Express',
        code: 'const authMiddleware = (req, res, next) => {\n  // Auth logic\n  next();\n};',
        language: 'javascript',
        technologies: ['express', 'node'],
        categories: ['backend', 'middleware'],
        visibility: 'public',
        ownerId: 'seed-user-1',
        ownerName: 'Dev User',
        likesCount: 12,
        viewsCount: 250,
        isDeleted: false,
        versions: [
          {
            version: 1,
            code: 'const authMiddleware = (req, res, next) => {\n  // Auth logic\n  next();\n};',
            createdAt: now,
            createdBy: 'seed-user-1',
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Python List Comprehension',
        description: 'Filter and transform lists efficiently',
        code: 'squares = [x**2 for x in range(10) if x % 2 == 0]',
        language: 'python',
        technologies: ['python'],
        categories: ['algorithms', 'data-structures'],
        visibility: 'public',
        ownerId: 'seed-user-2',
        ownerName: 'Python Dev',
        likesCount: 8,
        viewsCount: 180,
        isDeleted: false,
        versions: [
          {
            version: 1,
            code: 'squares = [x**2 for x in range(10) if x % 2 == 0]',
            createdAt: now,
            createdBy: 'seed-user-2',
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'SQL Join Query',
        description: 'Join users with their orders',
        code: 'SELECT u.name, o.total FROM users u\nINNER JOIN orders o ON u.id = o.user_id;',
        language: 'sql',
        technologies: ['sql', 'postgres-sql'],
        categories: ['database', 'queries'],
        visibility: 'public',
        ownerId: 'seed-user-2',
        ownerName: 'Python Dev',
        likesCount: 15,
        viewsCount: 320,
        isDeleted: false,
        versions: [
          {
            version: 1,
            code: 'SELECT u.name, o.total FROM users u\nINNER JOIN orders o ON u.id = o.user_id;',
            createdAt: now,
            createdBy: 'seed-user-2',
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Docker Compose Setup',
        description: 'Multi-container Docker application',
        code: 'version: "3.8"\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"',
        language: 'yaml',
        technologies: ['docker', 'dev-ops'],
        categories: ['infrastructure', 'deployment'],
        visibility: 'public',
        ownerId: 'seed-user-1',
        ownerName: 'Dev User',
        likesCount: 20,
        viewsCount: 450,
        isDeleted: false,
        versions: [
          {
            version: 1,
            code: 'version: "3.8"\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"',
            createdAt: now,
            createdBy: 'seed-user-1',
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ];
  }
}
