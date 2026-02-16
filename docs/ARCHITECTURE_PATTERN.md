# Hexagonal Feature Architecture

This project uses a feature-first hexagonal architecture (ports and adapters), with separate client/server containers where needed.

## Request Flow

### Client-side reads/writes (feature API clients)

```
UI Component
  -> infra/client/*-api.factory.ts
  -> infra/client/server-action.client.ts
  -> feature actions
  -> service
  -> repository
  -> Firestore
```

### Server-side business operations

```
Server Action / Route / Script
  -> feature server container
  -> service
  -> repository port implementation
  -> Firestore
```

## Current Feature Layout

### Auth (`src/features/auth`)

```
core/
  auth.port.ts
  auth.types.ts
infra/client/
  firebase-auth.client.ts          # browser auth implementation
  firebase-admin-auth.client.ts    # server auth implementation
ui/
  store/auth.store.tsx
auth.client.container.ts           # exports authPort for client code
auth.server.container.ts           # exports authServerPort for server code
auth.container.ts                  # backward-compatible client alias
```

### User (`src/features/user`)

```
core/
  user.types.ts
  user.service.ts
  repositories/user.repository.ts  # repository port
infra/repositories/
  firebase-user.repository.ts
infra/client/
  user-api.client.ts
  user-api.factory.ts
  server-action.client.ts
user.actions.ts
user.container.ts                  # wires UserService + FirebaseUserRepository
```

### Snippets (`src/features/snippets`)

```
core/
  snippet.types.ts
  snippet.port.ts
  snippet.service.ts
  repositories/snippet.repository.ts
infra/repositories/
  firebase-snippet.repository.ts
infra/client/
  snippet-api.client.ts
  snippet-api.factory.ts
  server-action.client.ts
adapters/
  snippet-port.adapter.ts
snippet.actions.ts
snippet.client.container.ts
snippet.server.container.ts
snippet.container.ts               # backward-compatible server alias
```

## Hexagonal Boundaries

- `Port`: contract used by service (`auth.port.ts`, `snippet.port.ts`, `user.repository.ts`).
- `Adapter/Implementation`: Firebase/Admin/ServerAction implementations of those contracts.
- `Service`: business rules and orchestration (`user.service.ts`, `snippet.service.ts`).
- `Container`: dependency wiring and environment-safe exports.

## Scripts and Tests Alignment

The `scripts/` folder mirrors feature boundaries and exercises feature APIs without bypassing business rules:

- `scripts/features/auth.script.ts` uses `FirebaseAdminAuthClient` (`AuthPort`) for server-side auth flows.
- `scripts/features/user.script.ts` uses `userService` (`UserService`) for user domain validation and repository access.
- `scripts/features/snippet.script.ts` uses `SnippetService` with `FirebaseSnippetRepository`.
- `scripts/tests/*.test.ts` run granular sub-feature checks with Vitest (`describe.sequential`).

## Practical Rules

- Do not call Firestore directly from UI components.
- Keep all business validation in services.
- Keep persistence concerns in repository implementations.
- Keep environment-specific code in client/server containers.
- Use feature services or ports in scripts/tests to avoid bypassing domain logic.
export class RestSnippetClient implements SnippetApiClient {
  async create(input: CreateSnippetInput): Promise<Snippet> {
    const response = await fetch('/api/snippets', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.json();
  }
}

// Factory
export function createSnippetApiClient(): SnippetApiClient {
  const mode = process.env.NEXT_PUBLIC_API_MODE;
  
  if (mode === 'rest') {
    return new RestSnippetClient();
  }
  
  return new ServerActionSnippetClient();
}

export const snippetApiClient = createSnippetApiClient();
```

**Key Principles**:
- Environment-based selection
- Easy migration path
- No code changes in UI layer

---

### 6. Actions Layer (`*.actions.ts`)

**Purpose**: Server Actions for Next.js (serverless)

**Pattern**: Server functions that call service layer

```typescript
'use server';

import { snippetService } from './snippet.container';
import { auth } from '@/services/auth';

export async function createSnippetAction(input: CreateSnippetInput) {
  const user = await auth.getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  return snippetService.create(input, user.id, user.name);
}

export async function getSnippetAction(id: string) {
  return snippetService.getById(id);
}
```

**Key Principles**:
- Marked with 'use server'
- Handles authentication
- Calls service layer
- Returns serializable data

---

### 7. UI Layer (`ui/*.tsx`)

**Purpose**: React components for user interface

**Pattern**: Components use API client

```typescript
'use client';

import { snippetApiClient } from '../api/snippet-api.factory';

export function CreateSnippetForm() {
  const handleSubmit = async (data: CreateSnippetInput) => {
    const snippet = await snippetApiClient.create(data);
    console.log('Created:', snippet);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Key Principles**:
- Uses API client (not service directly)
- No business logic
- Focuses on presentation
- Handles user interactions

---

## Migration Path: Serverless → Traditional Server

### Current: Serverless (Next.js + Firebase)

```
UI → snippetApiClient → ServerActionClient → Server Action → Service → Repository → Firestore
```

### Future: Traditional Server (Express + PostgreSQL)

```
UI → snippetApiClient → RestClient → HTTP API → Controller → Service → Repository → PostgreSQL
```

### Migration Steps

1. **API Layer** (5 minutes)
   - Set `NEXT_PUBLIC_API_MODE=rest`
   - No code changes needed

2. **Repository Layer** (1 day)
   - Create `PostgresSnippetRepository`
   - Update container to use new repository

3. **Controller Layer** (2-3 hours)
   - Create Express controllers
   - Map routes to service methods

4. **Server Setup** (4-6 hours)
   - Set up Express server
   - Add middleware
   - Configure routes

---

## Testing Architecture

### Structure

```
scripts/
├── core/
│   ├── script.interface.ts    # IScript interface
│   ├── base-script.ts         # Base class with utilities
│   └── main-runner.ts         # Run multiple scripts
├── features/
│   ├── snippet.script.ts      # Snippet tests
│   └── user.script.ts         # User tests
└── tests/
    ├── snippet.test.ts        # Vitest test file
    └── user.test.ts           # Vitest test file
```

### Creating Tests

```typescript
// scripts/features/snippet.script.ts
import { BaseScript } from '../core/base-script';
import { snippetService } from '../../src/features/snippets/snippet.container';

export class SnippetScript extends BaseScript {
  name = 'Snippet Tests';

  async run(): Promise<void> {
    this.ensureDevEnvironment();
    await this.testCreate();
    await this.testList();
    this.logSuccess('All tests passed');
  }

  private async testCreate(): Promise<void> {
    const snippet = await snippetService.create(/* ... */);
    if (!snippet.id) throw new Error('Create failed');
    this.log('✓ Create');
  }
}
```

```typescript
// scripts/tests/snippet.test.ts
import { describe, it } from 'vitest';
import { SnippetScript } from '../features/snippet.script';

describe('Snippet Feature', () => {
  it('should run all tests', async () => {
    await new SnippetScript().run();
  });
});
```

---

## Best Practices

### 1. Type Safety
- Use TypeScript utility types
- Avoid type duplication
- Single source of truth

### 2. Dependency Injection
- Use container pattern
- Easy to test with mocks
- Swap implementations easily

### 3. Separation of Concerns
- Each layer has one responsibility
- No business logic in UI
- No data access in services

### 4. Testing
- Test each layer independently
- Use class-based test scripts
- Safety checks for dev/prod

### 5. Migration Ready
- Abstract API layer
- Interface-based repositories
- Environment-based configuration

---

## Quick Start Checklist

When creating a new feature:

- [ ] Create `{feature}.types.ts` with base types
- [ ] Create `{feature}.repository.ts` interface
- [ ] Create `firebase-{feature}.repository.ts` implementation
- [ ] Create `{feature}.service.ts` with business logic
- [ ] Create `{feature}.container.ts` for DI
- [ ] Create `{feature}.actions.ts` for server actions
- [ ] Create `api/` folder with client abstraction
- [ ] Create `ui/` folder with React components
- [ ] Create `scripts/features/{feature}.script.ts` for tests
- [ ] Create `scripts/tests/{feature}.test.ts` for Vitest

---

## Example Projects

This architecture is used in:
- DevSnippets (code snippet manager)
- [Your next project here]

---

**Copy this document to your new projects and adapt as needed!**
