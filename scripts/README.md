# Scripts Architecture

The `scripts/` folder provides a feature-aligned test harness on top of Vitest.  
It is designed to validate behavior through feature boundaries (auth, user, snippets), not low-level utility functions.

## Structure

```text
scripts/
├── core/
│   ├── script.interface.ts      # IScript interface definition
│   ├── base.script.ts           # Base class with utilities
│   └── main.runner.ts           # Multi-script runner
├── data/
│   ├── snippet.templates.ts     # Snippet test data
│   ├── user.templates.ts        # User test data
│   ├── jsSnippets.templates.ts  # Language-specific templates
│   ├── pythonSnippets.templates.ts
│   ├── reactSnippets.templates.ts
│   └── ... (other language templates)
├── features/
│   ├── auth.script.ts           # Auth feature tests
│   ├── user.script.ts           # User feature tests
│   ├── snippet.script.ts        # Snippet feature tests
│   ├── clear.script.ts          # Database cleanup
│   ├── seed.script.ts           # Database seeding
│   └── seed-users.script.ts     # User seeding
└── tests/
    ├── auth.test.ts             # Vitest auth suite
    ├── user.test.ts             # Vitest user suite
    ├── snippet.test.ts          # Vitest snippet suite
    ├── database.test.ts         # Vitest database suite
    └── all.test.ts              # Run all tests
```

## Layering Model

- `core/` defines the reusable execution contract and runtime guards.
- `data/` contains test data templates for each feature.
- `features/` contains feature script classes that call feature ports/services.
- `tests/` contains Vitest suites that orchestrate feature scripts as sequential sub-feature checks.

## Execution Flow

```text
Vitest test file
  -> feature script method
  -> feature service/port
  -> repository implementation
  -> Firestore
```

## Runtime Safety

- All scripts inherit from `BaseScript`.
- `BaseScript.ensureReady()` enforces:
  - `FIREBASE_PROJECT_ID === dev-snippets-dev`
  - Active Firestore connectivity before executing feature logic
  - Prevents accidental data loss in production

## Design Principles

- Feature-oriented scripts, not utility-driven scripts.
- Validate business behavior through public feature APIs.
- Keep each script deterministic and isolated.
- Keep orchestration in `scripts/tests/*` and domain calls in `scripts/features/*`.
- Use test data templates from `scripts/data/*` for consistency.

## Running Scripts

### Run All Tests

```bash
pnpm test:all
```

### Run Feature-Specific Tests

```bash
pnpm test:auth
pnpm test:user
pnpm test:snippet
pnpm test:database
```

### Run Feature Scripts Directly

```bash
pnpm tools:auth
pnpm tools:user
pnpm tools:snippet
```

### Database Operations

```bash
# Seed database with test data
pnpm tools:seed

# Seed only users
pnpm tools:seed:users

# Clear all data (dev only)
pnpm tools:clear
```

## Creating a New Feature Script

### 1. Create Test Data Template

```typescript
// scripts/data/post.templates.ts

export const postTemplates = {
  valid: {
    title: 'Test Post',
    content: 'This is a test post',
    technology: 'javascript',
  },
  invalid: {
    title: '',  // Invalid: empty title
    content: 'Test',
  },
};
```

### 2. Create Feature Script

```typescript
// scripts/features/post.script.ts

import { BaseScript } from '../core/base-script';
import { postService } from '../../src/features/post/post.server.container';
import { postTemplates } from '../data/post.templates';

export class PostScript extends BaseScript {
  name = 'Post Feature Tests';

  async run(): Promise<void> {
    this.ensureReady();
    await this.testCreate();
    await this.testRead();
    await this.testUpdate();
    await this.testDelete();
    this.logSuccess('All tests passed');
  }

  private async testCreate(): Promise<void> {
    const post = await postService.createPost(
      postTemplates.valid,
      'test-user-id',
      'Test User',
    );
    if (!post.id) throw new Error('Create failed');
    this.log('✓ Create');
  }

  private async testRead(): Promise<void> {
    const posts = await postService.listByAuthor('test-user-id');
    if (!Array.isArray(posts)) throw new Error('Read failed');
    this.log('✓ Read');
  }

  private async testUpdate(): Promise<void> {
    // Implementation
    this.log('✓ Update');
  }

  private async testDelete(): Promise<void> {
    // Implementation
    this.log('✓ Delete');
  }
}
```

### 3. Create Vitest Suite

```typescript
// scripts/tests/post.test.ts

import { describe, it } from 'vitest';
import { PostScript } from '../features/post.script';

describe('Post Feature', () => {
  it('should run all tests', async () => {
    await new PostScript().run();
  });
});
```

### 4. Add Package Script

```json
{
  "scripts": {
    "test:post": "vitest run post",
    "tools:post": "set -a; . ./.env.local; set +a; tsx scripts/features/post.script.ts"
  }
}
```
