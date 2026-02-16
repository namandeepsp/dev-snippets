# DevSnippets

A Next.js application for storing, organizing, and sharing reusable code snippets across technologies.

## Stack

- Next.js 16
- React 19
- TypeScript
- Firebase Auth + Firestore
- Vitest for script-driven integration tests

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Architecture Summary

The project follows a feature-first hexagonal architecture.

```text
UI -> API Client/Action -> Service -> Repository -> Firestore
```

Key design points:

- Business rules live in feature services.
- Persistence logic lives in repository implementations.
- Environment-specific wiring lives in client/server containers.
- API factories enable migration from `serverless` to `rest`/`graphql` modes.

## Test and Script Commands

```bash
pnpm test
pnpm test:auth
pnpm test:user
pnpm test:snippet
pnpm test:database
pnpm test:all
```

```bash
pnpm tools:clear
pnpm tools:seed
pnpm tools:auth
pnpm tools:user
pnpm tools:snippet
```

## Documentation

- `docs/ARCHITECTURE_PATTERN.md`
- `docs/API_MIGRATION.md`
- `docs/FIREBASE_CONFIG.md`
- `scripts/README.md`

## Notes

- Package manager: `pnpm`
- Script safety guard requires `FIREBASE_PROJECT_ID=dev-snippets-dev` for destructive script operations
