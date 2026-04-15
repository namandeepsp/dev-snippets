# Snippet Feature - Deep Dive

The Snippet feature is the most complex feature in DevSnippets, demonstrating advanced patterns for versioning, sharing, and soft deletes.

## Feature Overview

The Snippet feature allows users to:
- Create, read, update, and delete code snippets
- Organize snippets by technology and category
- Share snippets with other users
- Maintain version history with rollback capability
- Track views and likes
- Soft delete snippets (preserve data for recovery)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer                                 │
│  SnippetForm | SnippetCard | SnippetViewer | CodeEditor    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              API Client Layer                               │
│  snippet-api.factory.ts (serverless/rest/graphql)          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│           Server Actions / REST Routes                      │
│  snippet.actions.ts (auth + ownership checks)              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Service Layer                                  │
│  SnippetService (orchestrator)                             │
│  ├─ SnippetReadService (queries)                           │
│  ├─ SnippetVersionService (versioning)                     │
│  └─ SnippetSharingService (sharing)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Port Layer                                     │
│  SnippetPort (write operations)                            │
│  SnippetRepository (read operations)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│           Repository Implementation                         │
│  FirebaseSnippetRepository                                 │
│  ├─ Read operations (queries, pagination)                  │
│  ├─ Write operations (create, update, delete)              │
│  ├─ Batch operations (bulk updates)                        │
│  └─ Mapper (Firestore ↔ Domain)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Firestore Database                             │
│  collections: snippets, users                              │
└─────────────────────────────────────────────────────────────┘
```

## Service Composition Pattern

The Snippet feature uses a **service composition pattern** where the main `SnippetService` orchestrates specialized sub-services:

### SnippetService (Orchestrator)

```typescript
export class SnippetService {
  private readService: SnippetReadService;
  private versionService: SnippetVersionService;
  private sharingService: SnippetSharingService;

  constructor(
    private readonly snippetPort: SnippetPort,
    private readonly snippetRepository: SnippetRepository,
  ) {
    this.readService = new SnippetReadService(snippetRepository);
    this.versionService = new SnippetVersionService(snippetRepository);
    this.sharingService = new SnippetSharingService(snippetRepository);
  }

  // Delegates to sub-services
  async createSnippet(...) { /* ... */ }
  getById(id) { return this.readService.getById(id); }
  listPublic() { return this.readService.listPublic(); }
  restoreVersion(...) { return this.versionService.restoreVersion(...); }
  shareWithUsers(...) { return this.sharingService.shareWithUsers(...); }
}
```

**Benefits:**
- Each service has single responsibility
- Easy to test sub-services independently
- Clear separation of concerns
- Easier to maintain and extend

## Versioning System

Snippets maintain a complete version history, allowing users to view and restore previous versions.

### Version Structure

```typescript
interface SnippetVersion {
  version: number;           // Sequential version number (1, 2, 3...)
  code: string;              // Code content at this version
  createdAt: number;         // Timestamp when version was created
  createdBy: string;         // User ID who created this version
}

interface Snippet {
  // ... other fields
  versions: SnippetVersion[];  // Array of all versions
}
```

### Version Creation Flow

When a snippet is created:
```typescript
const createInput: CreateSnippetInput = {
  // ... snippet data
  versions: [
    {
      version: 1,
      code: input.code,
      createdAt: now,
      createdBy: userId,
    },
  ],
};
```

When code is updated:
```typescript
// In SnippetService.updateSnippet()
if (input.code && input.code !== snippet.code) {
  const newVersion = createNextVersion(snippet, input.code, userId);
  updateInput.versions = [...snippet.versions, newVersion];
}
```

### Version Restoration

```typescript
// In SnippetVersionService.restoreVersion()
async restoreVersion(
  snippetId: string,
  versionNumber: number,
  userId: string,
): Promise<void> {
  const snippet = await this.repository.getById(snippetId);
  
  // Verify ownership
  if (snippet.ownerId !== userId) {
    throw new Error('Unauthorized');
  }
  
  // Find target version
  const targetVersion = snippet.versions.find(v => v.version === versionNumber);
  if (!targetVersion) {
    throw new Error('Version not found');
  }
  
  // Create new version from target
  const newVersion = createNextVersion(
    snippet,
    targetVersion.code,
    userId,
  );
  
  // Update snippet with new version
  await this.repository.update(snippetId, {
    code: targetVersion.code,
    versions: [...snippet.versions, newVersion],
    updatedAt: Date.now(),
  });
}
```

## Sharing System

Snippets can be shared with specific users, allowing collaborative access.

### Sharing Data Structure

```typescript
interface Snippet {
  // ... other fields
  sharedWith?: string[];  // Array of user IDs with access
}
```

### Share Operations

```typescript
// In SnippetSharingService

async shareWithUsers(
  snippetId: string,
  userIds: string[],
  requestingUserId: string,
): Promise<void> {
  const snippet = await this.repository.getById(snippetId);
  
  // Verify ownership
  if (snippet.ownerId !== requestingUserId) {
    throw new Error('Unauthorized');
  }
  
  // Add new users to sharedWith
  const currentSharedWith = snippet.sharedWith || [];
  const updatedSharedWith = Array.from(
    new Set([...currentSharedWith, ...userIds]),
  );
  
  await this.repository.update(snippetId, {
    sharedWith: updatedSharedWith,
    updatedAt: Date.now(),
  });
}

async unshareWithUsers(
  snippetId: string,
  userIds: string[],
  requestingUserId: string,
): Promise<void> {
  const snippet = await this.repository.getById(snippetId);
  
  // Verify ownership
  if (snippet.ownerId !== requestingUserId) {
    throw new Error('Unauthorized');
  }
  
  // Remove users from sharedWith
  const updatedSharedWith = (snippet.sharedWith || []).filter(
    id => !userIds.includes(id),
  );
  
  await this.repository.update(snippetId, {
    sharedWith: updatedSharedWith,
    updatedAt: Date.now(),
  });
}
```

## Soft Delete Pattern

Snippets use soft deletes to preserve data for recovery and analytics.

### Soft Delete Implementation

```typescript
interface Snippet {
  // ... other fields
  isDeleted: boolean;  // Soft delete flag
}
```

### Delete Operation

```typescript
// In SnippetService.deleteSnippet()
async deleteSnippet(snippetId: string, userId: string): Promise<void> {
  const snippet = await this.snippetRepository.getById(snippetId);
  
  if (!snippet) {
    throw new Error('Snippet not found');
  }
  
  if (snippet.ownerId !== userId) {
    throw new Error('Unauthorized');
  }
  
  // Soft delete: mark as deleted instead of removing
  await this.snippetRepository.delete(snippetId);
}

// In FirebaseSnippetRepository.delete()
async delete(snippetId: string): Promise<void> {
  await db.collection('snippets').doc(snippetId).update({
    isDeleted: true,
    updatedAt: Date.now(),
  });
}
```

### Query Filtering

All read queries automatically exclude soft-deleted snippets:

```typescript
// In FirebaseSnippetRepository.listPublic()
async listPublic(): Promise<Snippet[]> {
  const snapshot = await db
    .collection('snippets')
    .where('visibility', '==', 'public')
    .where('isDeleted', '==', false)  // Exclude deleted
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => doc.data() as Snippet);
}
```

## Pagination Pattern

The repository implements cursor-based pagination for efficient data loading.

### Pagination Implementation

```typescript
interface PaginationCursor {
  lastDocId: string;
  lastValue: any;  // Last sort value
}

async listPublicPaginated(
  sortBy?: string,
  limit: number = 20,
  cursor?: PaginationCursor,
  technologies?: string[],
): Promise<{ snippets: Snippet[]; nextCursor?: PaginationCursor }> {
  let query = db
    .collection('snippets')
    .where('visibility', '==', 'public')
    .where('isDeleted', '==', false);
  
  // Apply technology filter if provided
  if (technologies?.length) {
    query = query.where('technology', 'in', technologies);
  }
  
  // Apply sorting
  const orderBy = sortBy === 'views' ? 'viewsCount' : 'createdAt';
  query = query.orderBy(orderBy, 'desc');
  
  // Apply cursor for pagination
  if (cursor) {
    const lastDoc = await db
      .collection('snippets')
      .doc(cursor.lastDocId)
      .get();
    query = query.startAfter(lastDoc);
  }
  
  // Fetch limit + 1 to determine if more results exist
  const snapshot = await query.limit(limit + 1).get();
  const docs = snapshot.docs;
  
  const snippets = docs.slice(0, limit).map(doc => doc.data() as Snippet);
  
  // Determine next cursor
  let nextCursor: PaginationCursor | undefined;
  if (docs.length > limit) {
    const lastDoc = docs[limit - 1];
    nextCursor = {
      lastDocId: lastDoc.id,
      lastValue: lastDoc.get(orderBy),
    };
  }
  
  return { snippets, nextCursor };
}
```

## Engagement Tracking

Snippets track views and likes for analytics and discovery.

### Views Tracking

```typescript
// In SnippetService.incrementViews()
async incrementViews(snippetId: string): Promise<void> {
  try {
    await this.snippetRepository.incrementViews(snippetId);
  } catch (error) {
    logger.error(`Failed to increment views for snippet ${snippetId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Fail silently - don't break user experience
  }
}

// In FirebaseSnippetRepository.incrementViews()
async incrementViews(snippetId: string): Promise<void> {
  await db
    .collection('snippets')
    .doc(snippetId)
    .update({
      viewsCount: FieldValue.increment(1),
    });
}
```

### Likes Tracking

```typescript
// In SnippetService.toggleLike()
async toggleLike(snippetId: string, userId: string): Promise<boolean> {
  return this.snippetRepository.toggleLike(snippetId, userId);
}

// In FirebaseSnippetRepository.toggleLike()
async toggleLike(snippetId: string, userId: string): Promise<boolean> {
  const likeRef = db
    .collection('snippets')
    .doc(snippetId)
    .collection('likes')
    .doc(userId);
  
  const likeDoc = await likeRef.get();
  
  if (likeDoc.exists) {
    // Unlike
    await likeRef.delete();
    await db
      .collection('snippets')
      .doc(snippetId)
      .update({
        likesCount: FieldValue.increment(-1),
      });
    return false;
  } else {
    // Like
    await likeRef.set({ createdAt: Date.now() });
    await db
      .collection('snippets')
      .doc(snippetId)
      .update({
        likesCount: FieldValue.increment(1),
      });
    return true;
  }
}
```

## Repository Modularization

The Firebase repository is split into focused modules:

- `firebase-snippet.repository.ts` - Main entry point
- `firebase-snippet.repository.read.ts` - Read operations
- `firebase-snippet.repository.read-paginated.ts` - Pagination
- `firebase-snippet.repository.write.ts` - Write operations
- `firebase-snippet.repository.meta.ts` - Metadata operations
- `firebase-snippet.batch.ts` - Batch operations
- `firebase-snippet.mapper.ts` - Firestore ↔ Domain mapping
- `firebase-snippet.sort.ts` - Sorting utilities

This modularization keeps each file focused and maintainable.

## Adapter Pattern

The `SnippetPortAdapter` routes operations to appropriate layers:

```typescript
export class SnippetPortAdapter implements SnippetPort {
  constructor(
    private readonly apiClient: SnippetAPIClient,
    private readonly repository: SnippetRepository,
  ) {}

  // Write operations go through API client (server actions)
  async create(input: CreateSnippetInput): Promise<Snippet> {
    return this.apiClient.create(input);
  }

  // Read operations go directly to repository
  async getById(id: string): Promise<Snippet | null> {
    return this.repository.getById(id);
  }
}
```

This pattern ensures:
- Writes are authenticated via server actions
- Reads are fast (direct repository access)
- Clear separation of concerns

## Testing the Snippet Feature

```bash
# Run snippet tests
pnpm test:snippet

# Run snippet script directly
pnpm tools:snippet

# Run all tests
pnpm test:all
```

## Future Enhancements

1. **Collaborative Editing**: Real-time code editing with multiple users
2. **Comments**: Add comments to specific lines or versions
3. **Tags**: User-defined tags for better organization
4. **Forking**: Allow users to fork snippets and create variants
5. **Search**: Full-text search across snippet content
6. **Analytics**: Detailed usage analytics per snippet
7. **Webhooks**: Notify external services on snippet changes
