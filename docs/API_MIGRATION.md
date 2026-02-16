# API Migration Guide

This guide documents migration from Next.js Server Actions to REST/GraphQL while preserving current feature contracts.

## Current State

`NEXT_PUBLIC_API_MODE` is already wired in feature API factories:

- `src/features/snippets/infra/client/snippet-api.factory.ts`
- `src/features/user/infra/client/user-api.factory.ts`

Supported modes in code:

- `serverless` (implemented, default)
- `rest` (placeholder)
- `graphql` (placeholder)

## Current Serverless Flow

### Snippets

1. UI calls `snippetApiClient` from `snippet.client.container.ts`.
2. Factory resolves `ServerActionSnippetClient`.
3. Client calls `snippet.actions.ts`.
4. Actions call `snippetService` from `snippet.server.container.ts`.

### User

1. UI calls `userApiClient`.
2. Factory resolves `ServerActionUserClient`.
3. Client calls `user.actions.ts`.
4. Actions call `userService` from `user.container.ts`.

## Migration Strategy

### 1) Keep API interfaces stable

- Keep `SnippetAPIClient` and `UserApiClient` method signatures unchanged.
- Implement `rest` clients in `infra/client/` without changing UI code.

### 2) Add REST implementations

Create files:

- `src/features/snippets/infra/client/rest.client.ts`
- `src/features/user/infra/client/rest.client.ts`

Each class must implement the existing interface and use `fetch` against `NEXT_PUBLIC_API_URL`.

### 3) Add backend controllers

Expose endpoints that map 1:1 to current action methods:

- `POST /snippets`, `GET /snippets/:id`, `PATCH /snippets/:id`, `DELETE /snippets/:id`
- `GET /users/:username`, `PATCH /users/me`, `DELETE /users/me`

### 4) Preserve service layer contracts

Controllers should call:

- `snippetService` (from server container)
- `userService` (from container)

No business rules should move into controllers.

### 5) Switch mode

Set:

```env
NEXT_PUBLIC_API_MODE=rest
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Auth Migration Note

Auth is already split by environment:

- Client: `FirebaseAuthClient` via `auth.client.container.ts`
- Server: `FirebaseAdminAuthClient` via `auth.server.container.ts`

If moving to external auth/JWT, replace `AuthPort` implementations and keep container exports stable.

## Validation Checklist

- `pnpm test:auth`
- `pnpm test:user`
- `pnpm test:snippet`
- `pnpm test:all`

These tests are script-driven and verify feature behavior at service/port boundaries.
