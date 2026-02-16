# Scripts Architecture

The `scripts/` folder provides a feature-aligned test harness on top of Vitest.  
It is designed to validate behavior through feature boundaries (auth, user, snippets), not low-level utility functions.

## Structure

```text
scripts/
├── core/
│   ├── script.interface.ts
│   ├── base.script.ts
│   └── main.runner.ts
├── features/
│   ├── auth.script.ts
│   ├── user.script.ts
│   ├── snippet.script.ts
│   ├── clear.script.ts
│   └── seed.script.ts
└── tests/
    ├── auth.test.ts
    ├── user.test.ts
    ├── snippet.test.ts
    ├── database.test.ts
    └── all.test.ts
```

## Layering Model

- `core/` defines the reusable execution contract and runtime guards.
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
- active Firestore connectivity before executing feature logic

## Design Principles

- Feature-oriented scripts, not utility-driven scripts.
- Validate business behavior through public feature APIs.
- Keep each script deterministic and isolated.
- Keep orchestration in `scripts/tests/*` and domain calls in `scripts/features/*`.
