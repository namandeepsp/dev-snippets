# Firebase Configuration

This project uses Firebase Auth + Firestore in both runtime and script-based tests.

## Config Files

- `firebase.json`
- `firebase-config/firestore.rules`
- `firebase-config/firestore.indexes.json`

## Required Runtime Variables

Scripts and server code require valid Firebase Admin credentials plus:

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

- `users`
- `snippets`

### Users

- Created/updated by `FirebaseUserRepository`
- Uses auth `uid` as Firestore document ID
- Username must satisfy service validation: `^[a-zA-Z0-9_]{3,20}$`

### Snippets

- Created/updated by `FirebaseSnippetRepository`
- Supports `visibility`, `isDeleted`, and `updatedAt`-based queries
- Uses soft delete via `isDeleted: true`

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

### Project guard failure

If scripts fail with:

`This script can only run on dev-snippets-dev`

set:

```bash
export FIREBASE_PROJECT_ID=dev-snippets-dev
```
