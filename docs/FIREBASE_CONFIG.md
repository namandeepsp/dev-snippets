# Firebase Configuration

This project uses Firebase Auth + Firestore in both runtime and script-based tests.

## Config Files

- `firebase.json` - Firebase CLI configuration
- `firebase-config/firestore.rules` - Firestore security rules
- `firebase-config/firestore.indexes.json` - Firestore composite indexes
- `.firebaserc` - Firebase project aliases

## Firebase Projects

The project uses two Firebase projects:

- **dev-snippets-dev** - Development environment (used for testing and local development)
- **dev-snippets-prod** - Production environment

Switch between projects using:

```bash
firebase use dev
firebase use prod
```

## Required Runtime Variables

Scripts and server code require valid Firebase Admin credentials plus:

### Server (Firebase Admin)

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Client (Firebase Web SDK)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Optional (Feature Flags / Services)

- `NEXT_PUBLIC_API_MODE` (`serverless` | `rest` | `graphql`, default `serverless`)
- `FORMATTER_SERVICE_URL` (enables external formatter routes)
- `FORMATTER_SERVICE_API_KEY` (optional auth for formatter service)

- `FIREBASE_PROJECT_ID=dev-snippets-dev` for test scripts

`scripts/core/base.script.ts` enforces:

- project guard (`dev-snippets-dev`)
- Firestore connectivity check before each feature script

## Firebase CLI Commands

Use package scripts from `package.json`:

```bash
pnpm firebase:login
pnpm firebase:list
pnpm firebase:deploy:rules
pnpm firebase:deploy:indexes
pnpm firebase:deploy:firestore
pnpm firebase:deploy:dev
pnpm firebase:deploy:prod
```

## Data Model Expectations

Core collections used by current features:

### Users Collection

```typescript
interface User {
  uid: string;              // Firebase Auth UID (document ID)
  email: string;            // User email
  username: string;         // Unique username (3-20 alphanumeric)
  displayName?: string;     // Display name
  photoURL?: string;        // Profile picture URL
  bio?: string;             // User bio
  createdAt: number;        // Timestamp
  updatedAt: number;        // Timestamp
}
```

**Validation Rules:**
- Username: `^[a-zA-Z0-9_]{3,20}$`
- Email: Valid email format
- Username must be unique

### Snippets Collection

```typescript
interface Snippet {
  id: string;               // Document ID
  title: string;            // Snippet title
  description?: string;     // Optional description
  code: string;             // Code content
  language: string;         // Programming language
  technology: string;       // Technology category
  ownerId: string;          // User ID of creator
  ownerName: string;        // Username of creator
  visibility: 'public' | 'private' | 'shared';  // Visibility level
  sharedWith?: string[];    // Array of user IDs with access
  categories?: string[];    // Optional categories
  tags?: string[];          // Optional tags
  versions: SnippetVersion[];  // Version history
  likesCount: number;       // Number of likes
  viewsCount: number;       // Number of views
  isDeleted: boolean;       // Soft delete flag
  createdAt: number;        // Timestamp
  updatedAt: number;        // Timestamp
}

interface SnippetVersion {
  version: number;          // Sequential version number
  code: string;             // Code at this version
  createdAt: number;        // Timestamp
  createdBy: string;        // User ID who created version
}
```

**Indexes Required:**
- `snippets: (visibility, isDeleted, createdAt)`
- `snippets: (ownerId, isDeleted, createdAt)`
- `snippets: (visibility, isDeleted, viewsCount)`
- `snippets: (technology, visibility, isDeleted)`

### Likes Sub-collection

Each snippet has a `likes` sub-collection:

```typescript
interface Like {
  userId: string;           // Document ID (user ID)
  createdAt: number;        // Timestamp
}
```

## Script and Test Commands

Run feature-level tests:

```bash
pnpm test:auth
pnpm test:user
pnpm test:snippet
pnpm test:database
pnpm test:all
```

Run script tools directly:

```bash
pnpm tools:clear
pnpm tools:seed
pnpm tools:auth
pnpm tools:user
pnpm tools:snippet
```

## Troubleshooting

### Firestore unreachable

If you see:

`Firestore unreachable. Check internet/DNS and Firebase credentials. (timed out)`

check:

1. Network connectivity from the machine running tests.
2. Firebase Admin credentials in environment.
3. `FIREBASE_PROJECT_ID` points to the expected project.
4. Firestore is enabled in Firebase Console.
5. Firestore location is set correctly.

### Project guard failure

If scripts fail with:

`This script can only run on dev-snippets-dev`

set:

```bash
export FIREBASE_PROJECT_ID=dev-snippets-dev
```

### Authentication errors

**Invalid credentials:**
- Verify `FIREBASE_PRIVATE_KEY` is properly formatted (with escaped newlines)
- Check `FIREBASE_CLIENT_EMAIL` matches the service account
- Ensure service account has Firestore read/write permissions

**Permission denied:**
- Check Firestore security rules allow the operation
- Verify user has appropriate permissions
- Check if document exists before updating

### Firestore Rules Issues

If you see permission errors:

1. Review `firebase-config/firestore.rules`
2. Test rules in Firebase Console
3. Deploy updated rules: `pnpm firebase:deploy:rules`
4. Check user authentication status

### Index Creation

If you see index creation errors:

1. Check `firebase-config/firestore.indexes.json`
2. Deploy indexes: `pnpm firebase:deploy:indexes`
3. Wait for index creation (can take several minutes)
4. Verify index status in Firebase Console

## Security Rules

The project uses Firestore security rules to enforce:

- Users can only read/write their own documents
- Public snippets are readable by all authenticated users
- Private snippets are only accessible to owner
- Shared snippets are accessible to owner and shared users
- Soft-deleted snippets are hidden from queries

Review and update rules in `firebase-config/firestore.rules` as needed.
