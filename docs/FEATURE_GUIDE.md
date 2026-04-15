# Creating New Features - Architecture Guide

This guide walks through creating a new feature following the DevSnippets hexagonal architecture pattern.

## Feature Structure Template

```
src/features/{feature}/
├── core/
│   ├── {feature}.types.ts           # Domain types and interfaces
│   ├── {feature}.port.ts            # Port interface (contract)
│   ├── {feature}.service.ts         # Main business logic
│   ├── {feature}.validator.ts       # Input validation (optional)
│   └── repositories/
│       └── {feature}.repository.ts  # Repository port interface
├── infra/
│   ├── repositories/
│   │   └── firebase-{feature}.repository.ts  # Firebase implementation
│   └── client/
│       ├── {feature}-api.client.ts          # API client interface
│       ├── {feature}-api.factory.ts         # Factory for API mode selection
│       └── server-action.client.ts          # Server action wrapper
├── ui/
│   ├── {Feature}Form.tsx            # Create/edit form
│   ├── {Feature}Card.tsx            # Preview/list card
│   ├── {Feature}Viewer.tsx          # Detail view
│   └── use{Feature}Form.ts          # Form state hook
├── {feature}.actions.ts             # Server actions
├── {feature}.client.container.ts    # Client-side DI
├── {feature}.server.container.ts    # Server-side DI
└── {feature}.container.ts           # Backward-compatible alias
```

## Step-by-Step Implementation

### 1. Define Domain Types (`{feature}.types.ts`)

```typescript
// src/features/post/core/post.types.ts

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
}

export interface CreatePostInput {
  title: string;
  content: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
}
```

### 2. Create Repository Port (`repositories/{feature}.repository.ts`)

```typescript
// src/features/post/core/repositories/post.repository.ts

import type { Post, CreatePostInput, UpdatePostInput } from '../post.types';

export interface PostRepository {
  create(input: CreatePostInput & { authorId: string; authorName: string }): Promise<Post>;
  getById(id: string): Promise<Post | null>;
  listByAuthor(authorId: string): Promise<Post[]>;
  update(id: string, input: UpdatePostInput): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### 3. Create Feature Port (`{feature}.port.ts`)

```typescript
// src/features/post/core/post.port.ts

import type { Post, CreatePostInput, UpdatePostInput } from './post.types';

export interface PostPort {
  create(input: CreatePostInput & { authorId: string; authorName: string }): Promise<Post>;
  update(id: string, input: UpdatePostInput): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### 4. Implement Repository (`infra/repositories/firebase-{feature}.repository.ts`)

```typescript
// src/features/post/infra/repositories/firebase-post.repository.ts

import { db } from '@/services/firebase/admin';
import type { PostRepository } from '../../core/repositories/post.repository';
import type { Post, CreatePostInput, UpdatePostInput } from '../../core/post.types';

export class FirebasePostRepository implements PostRepository {
  async create(input: CreatePostInput & { authorId: string; authorName: string }): Promise<Post> {
    const now = Date.now();
    const docRef = db.collection('posts').doc();
    
    const post: Post = {
      id: docRef.id,
      ...input,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };
    
    await docRef.set(post);
    return post;
  }

  async getById(id: string): Promise<Post | null> {
    const doc = await db.collection('posts').doc(id).get();
    return doc.exists ? (doc.data() as Post) : null;
  }

  async listByAuthor(authorId: string): Promise<Post[]> {
    const snapshot = await db
      .collection('posts')
      .where('authorId', '==', authorId)
      .where('isDeleted', '==', false)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Post);
  }

  async update(id: string, input: UpdatePostInput): Promise<void> {
    await db.collection('posts').doc(id).update({
      ...input,
      updatedAt: Date.now(),
    });
  }

  async delete(id: string): Promise<void> {
    await db.collection('posts').doc(id).update({
      isDeleted: true,
      updatedAt: Date.now(),
    });
  }
}
```

### 5. Create Service (`{feature}.service.ts`)

```typescript
// src/features/post/core/post.service.ts

import type { PostPort } from './post.port';
import type { PostRepository } from './repositories/post.repository';
import type { Post, CreatePostInput, UpdatePostInput } from './post.types';
import { PostValidator } from './post.validator';

export class PostService {
  constructor(
    private readonly postPort: PostPort,
    private readonly postRepository: PostRepository,
  ) {}

  async createPost(
    input: CreatePostInput,
    authorId: string,
    authorName: string,
  ): Promise<Post> {
    PostValidator.validateCreateInput(input);
    
    return this.postPort.create({
      ...input,
      authorId,
      authorName,
    });
  }

  async getById(id: string): Promise<Post | null> {
    return this.postRepository.getById(id);
  }

  async listByAuthor(authorId: string): Promise<Post[]> {
    return this.postRepository.listByAuthor(authorId);
  }

  async updatePost(
    id: string,
    input: UpdatePostInput,
    authorId: string,
  ): Promise<void> {
    PostValidator.validateUpdateInput(input);
    
    const post = await this.postRepository.getById(id);
    if (!post) throw new Error('Post not found');
    if (post.authorId !== authorId) throw new Error('Unauthorized');
    
    await this.postPort.update(id, input);
  }

  async deletePost(id: string, authorId: string): Promise<void> {
    const post = await this.postRepository.getById(id);
    if (!post) throw new Error('Post not found');
    if (post.authorId !== authorId) throw new Error('Unauthorized');
    
    await this.postPort.delete(id);
  }
}
```

### 6. Create Validator (`{feature}.validator.ts`)

```typescript
// src/features/post/core/post.validator.ts

import type { CreatePostInput, UpdatePostInput } from './post.types';

export class PostValidator {
  static validateCreateInput(input: CreatePostInput): void {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Content is required');
    }
    if (input.title.length > 200) {
      throw new Error('Title must be less than 200 characters');
    }
  }

  static validateUpdateInput(input: UpdatePostInput): void {
    if (input.title !== undefined && input.title.length > 200) {
      throw new Error('Title must be less than 200 characters');
    }
  }
}
```

### 7. Create API Client (`infra/client/{feature}-api.client.ts`)

```typescript
// src/features/post/infra/client/post-api.client.ts

import type { Post, CreatePostInput, UpdatePostInput } from '../../core/post.types';

export interface PostAPIClient {
  create(input: CreatePostInput & { authorId: string; authorName: string }): Promise<Post>;
  update(id: string, input: UpdatePostInput): Promise<void>;
  delete(id: string): Promise<void>;
}

export class ServerActionPostClient implements PostAPIClient {
  constructor(private readonly actions: any) {}

  async create(input: CreatePostInput & { authorId: string; authorName: string }): Promise<Post> {
    return this.actions.createPostAction(input);
  }

  async update(id: string, input: UpdatePostInput): Promise<void> {
    return this.actions.updatePostAction(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.actions.deletePostAction(id);
  }
}
```

### 8. Create API Factory (`infra/client/{feature}-api.factory.ts`)

```typescript
// src/features/post/infra/client/post-api.factory.ts

import type { PostAPIClient } from './post-api.client';
import { ServerActionPostClient } from './post-api.client';
import * as postActions from '../post.actions';

export function createPostApiClient(): PostAPIClient {
  const mode = process.env.NEXT_PUBLIC_API_MODE || 'serverless';
  
  if (mode === 'rest') {
    // Future: implement RestPostClient
    throw new Error('REST mode not yet implemented');
  }
  
  return new ServerActionPostClient(postActions);
}

export const postApiClient = createPostApiClient();
```

### 9. Create Server Actions (`{feature}.actions.ts`)

```typescript
// src/features/post/post.actions.ts

'use server';

import { auth } from '@/services/auth';
import { postService } from './post.server.container';
import type { CreatePostInput, UpdatePostInput } from './core/post.types';

export async function createPostAction(
  input: CreatePostInput & { authorId: string; authorName: string },
) {
  const user = await auth.getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  return postService.createPost(input, user.id, user.name);
}

export async function updatePostAction(id: string, input: UpdatePostInput) {
  const user = await auth.getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  return postService.updatePost(id, input, user.id);
}

export async function deletePostAction(id: string) {
  const user = await auth.getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  return postService.deletePost(id, user.id);
}
```

### 10. Create Containers (`{feature}.server.container.ts` & `{feature}.client.container.ts`)

```typescript
// src/features/post/post.server.container.ts

import { FirebasePostRepository } from './infra/repositories/firebase-post.repository';
import { PostService } from './core/post.service';
import { SnippetPortAdapter } from './adapters/post-port.adapter';
import { postApiClient } from './infra/client/post-api.factory';

const postRepository = new FirebasePostRepository();
const postPort = new SnippetPortAdapter(postApiClient, postRepository);
export const postService = new PostService(postPort, postRepository);
```

```typescript
// src/features/post/post.client.container.ts

export { postApiClient } from './infra/client/post-api.factory';
```

```typescript
// src/features/post/post.container.ts

export { postService } from './post.server.container';
export { postApiClient } from './post.client.container';
```

### 11. Create UI Components

```typescript
// src/features/post/ui/PostForm.tsx

'use client';

import { postApiClient } from '../post.client.container';
import type { CreatePostInput } from '../core/post.types';

export function PostForm() {
  const handleSubmit = async (data: CreatePostInput) => {
    try {
      await postApiClient.create({
        ...data,
        authorId: 'current-user-id',
        authorName: 'current-user-name',
      });
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      // Handle form submission
    }}>
      {/* Form fields */}
    </form>
  );
}
```

### 12. Create Test Script (`scripts/features/{feature}.script.ts`)

```typescript
// scripts/features/post.script.ts

import { BaseScript } from '../core/base-script';
import { postService } from '../../src/features/post/post.server.container';

export class PostScript extends BaseScript {
  name = 'Post Feature Tests';

  async run(): Promise<void> {
    this.ensureReady();
    await this.testCreate();
    await this.testRead();
    this.logSuccess('All tests passed');
  }

  private async testCreate(): Promise<void> {
    const post = await postService.createPost(
      { title: 'Test Post', content: 'Test content' },
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
}
```

## Key Principles

1. **Port-Driven Design**: Services depend on ports, not implementations
2. **Dependency Injection**: Containers wire dependencies, not services
3. **Validation First**: Validate inputs before business logic
4. **Authorization Checks**: Verify ownership/permissions in service layer
5. **Soft Deletes**: Use `isDeleted` flag instead of hard deletes
6. **Timestamps**: Track `createdAt` and `updatedAt` for all entities
7. **Error Handling**: Throw meaningful errors with context
8. **Type Safety**: Use strict TypeScript types at boundaries

## Testing the Feature

```bash
# Run feature-specific tests
pnpm test:post

# Run feature script directly
pnpm tools:post

# Run all tests
pnpm test:all
```

## Migration Path

When migrating from Firebase to PostgreSQL:

1. Create `PostgresPostRepository` implementing `PostRepository`
2. Update `post.server.container.ts` to use new repository
3. No changes needed in service, port, or UI layers
4. Update tests to use new repository

This architecture ensures your feature is production-ready and migration-proof from day one.
