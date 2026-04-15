# Documentation Index

This document provides an overview of all DevSnippets documentation and guides you to the right resource.

## Quick Navigation

### Getting Started
- **[README.md](../README.md)** - Project overview, quick start, and architecture summary
- **[FIREBASE_CONFIG.md](./FIREBASE_CONFIG.md)** - Firebase setup and environment variables

### Architecture & Design
- **[ARCHITECTURE_PATTERN.md](./ARCHITECTURE_PATTERN.md)** - Hexagonal architecture patterns and layer responsibilities
- **[FEATURE_GUIDE.md](./FEATURE_GUIDE.md)** - Step-by-step guide for creating new features
- **[SNIPPET_FEATURE.md](./SNIPPET_FEATURE.md)** - Deep dive into the Snippet feature (versioning, sharing, soft delete)
- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** - Error handling patterns and standardization

### Testing & Scripts
- **[scripts/README.md](../scripts/README.md)** - Script architecture and test execution model

---

## Documentation by Topic

### For New Developers

1. Start with [README.md](../README.md) for project overview
2. Read [ARCHITECTURE_PATTERN.md](./ARCHITECTURE_PATTERN.md) to understand the architecture
3. Review [FIREBASE_CONFIG.md](./FIREBASE_CONFIG.md) to set up your environment
4. Check [scripts/README.md](../scripts/README.md) to understand testing

### For Creating New Features

1. Read [FEATURE_GUIDE.md](./FEATURE_GUIDE.md) for step-by-step instructions
2. Reference [ARCHITECTURE_PATTERN.md](./ARCHITECTURE_PATTERN.md) for patterns
3. Review [ERROR_HANDLING.md](./ERROR_HANDLING.md) for error patterns
4. Check [scripts/README.md](../scripts/README.md) for testing your feature

### For Working with Snippets

1. Read [SNIPPET_FEATURE.md](./SNIPPET_FEATURE.md) for feature overview
2. Review [ARCHITECTURE_PATTERN.md](./ARCHITECTURE_PATTERN.md) for the Snippets section
3. Check [ERROR_HANDLING.md](./ERROR_HANDLING.md) for error patterns

### For Error Handling

1. Read [ERROR_HANDLING.md](./ERROR_HANDLING.md) for patterns and best practices
2. Review feature-specific error handling in [FEATURE_GUIDE.md](./FEATURE_GUIDE.md)
3. Check [SNIPPET_FEATURE.md](./SNIPPET_FEATURE.md) for real-world examples

### For Firebase Setup

1. Read [FIREBASE_CONFIG.md](./FIREBASE_CONFIG.md) for configuration
2. Review data model expectations
3. Check troubleshooting section for common issues

### For Testing

1. Read [scripts/README.md](../scripts/README.md) for script architecture
2. Review [FEATURE_GUIDE.md](./FEATURE_GUIDE.md) for testing examples
3. Check [SNIPPET_FEATURE.md](./SNIPPET_FEATURE.md) for real-world test patterns

---

## Architecture Overview

### Hexagonal Architecture Layers

```
┌─────────────────────────────────────────┐
│         UI Components (React)           │
├─────────────────────────────────────────┤
│    API Client / Server Actions          │
├─────────────────────────────────────────┤
│      Service Layer (Business Logic)     │
├─────────────────────────────────────────┤
│    Port Interface / Adapter Pattern     │
├─────────────────────────────────────────┤
│   Repository Implementation (Firebase)  │
├─────────────────────────────────────────┤
│         Firestore Database              │
└─────────────────────────────────────────┘
```

### Features

1. **Auth** - User authentication and session management
2. **User** - User profile management
3. **Snippets** - Code snippet management with versioning and sharing
4. **Editor** - Code editor with syntax highlighting and formatting
5. **Contact** - Contact form for user inquiries

---

## Key Concepts

### Ports & Adapters (Hexagonal Architecture)

- **Port**: Interface defining a contract (e.g., `SnippetPort`)
- **Adapter**: Implementation of a port (e.g., `SnippetPortAdapter`)
- **Repository**: Data access interface and implementation
- **Service**: Business logic orchestrator

### Dependency Injection

- **Container**: Wires dependencies for a feature
- **Client Container**: Client-side DI
- **Server Container**: Server-side DI
- **Backward-compatible Alias**: Exports for convenience

### Error Handling

- **Domain Errors**: Feature-specific error classes
- **Validation Errors**: Input validation failures
- **Authorization Errors**: Permission denied errors
- **Not Found Errors**: Resource not found errors

### Testing

- **Feature Scripts**: Class-based test scripts
- **Vitest Suites**: Integration test suites
- **Test Data Templates**: Reusable test data
- **Safety Guards**: Prevent destructive operations in production

---

## Common Tasks

### Create a New Feature

See [FEATURE_GUIDE.md](./FEATURE_GUIDE.md) for complete step-by-step instructions.

### Add Error Handling

See [ERROR_HANDLING.md](./ERROR_HANDLING.md) for patterns and examples.

### Set Up Firebase

See [FIREBASE_CONFIG.md](./FIREBASE_CONFIG.md) for configuration and troubleshooting.

### Write Tests

See [scripts/README.md](../scripts/README.md) for script architecture and examples.

### Understand Snippet Feature

See [SNIPPET_FEATURE.md](./SNIPPET_FEATURE.md) for versioning, sharing, and soft delete patterns.

---

## File Structure

```
dev-snippets/
├── docs/
│   ├── ARCHITECTURE_PATTERN.md    # Architecture patterns
│   ├── FEATURE_GUIDE.md           # Feature creation guide
│   ├── SNIPPET_FEATURE.md         # Snippet feature deep dive
│   ├── ERROR_HANDLING.md          # Error handling patterns
│   ├── FIREBASE_CONFIG.md         # Firebase setup
│   └── DOCUMENTATION_INDEX.md     # This file
├── scripts/
│   ├── README.md                  # Script architecture
│   ├── core/                      # Base classes and interfaces
│   ├── data/                      # Test data templates
│   ├── features/                  # Feature scripts
│   └── tests/                     # Vitest suites
├── src/
│   ├── app/                       # Next.js app directory
│   ├── features/                  # Feature modules
│   │   ├── auth/                  # Auth feature
│   │   ├── user/                  # User feature
│   │   ├── snippets/              # Snippet feature
│   │   ├── editor/                # Editor feature
│   │   └── contact/               # Contact feature
│   ├── services/                  # Shared services
│   ├── shared/                    # Shared utilities
│   └── styles/                    # Global styles
├── firebase-config/               # Firebase configuration
├── public/                        # Static assets
├── README.md                      # Project README
└── package.json                   # Dependencies
```

---

## Environment Setup

### Required Environment Variables

**Firebase Admin (Server):**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

**Firebase Web SDK (Client):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Optional:**
- `NEXT_PUBLIC_API_MODE` (serverless | rest | graphql)
- `FORMATTER_SERVICE_URL`
- `FORMATTER_SERVICE_API_KEY`

See [FIREBASE_CONFIG.md](./FIREBASE_CONFIG.md) for detailed setup instructions.

---

## Development Workflow

### 1. Local Development

```bash
pnpm install
pnpm dev
```

### 2. Run Tests

```bash
pnpm test:all
pnpm test:snippet
pnpm test:user
```

### 3. Run Scripts

```bash
pnpm tools:seed
pnpm tools:clear
pnpm tools:snippet
```

### 4. Code Quality

```bash
pnpm lint
pnpm format
pnpm typecheck
```

### 5. Build for Production

```bash
pnpm build
pnpm start
```

---

## Best Practices

### Code Organization

- Keep business logic in services
- Keep persistence logic in repositories
- Keep UI logic in components
- Use ports for abstraction
- Use containers for DI

### Error Handling

- Validate inputs early
- Throw specific errors
- Include context in messages
- Log errors appropriately
- Handle gracefully in UI

### Testing

- Test through feature APIs
- Use test data templates
- Keep tests deterministic
- Isolate test data
- Clean up after tests

### Type Safety

- Use strict TypeScript
- Define types at boundaries
- Avoid type duplication
- Use utility types
- Document complex types

---

## Troubleshooting

### Common Issues

**Firestore unreachable:**
- Check network connectivity
- Verify Firebase credentials
- Check project ID

**Permission denied:**
- Review Firestore security rules
- Check user authentication
- Verify document exists

**Tests failing:**
- Check environment variables
- Verify Firebase connectivity
- Review test data
- Check error logs

See [FIREBASE_CONFIG.md](./FIREBASE_CONFIG.md) for detailed troubleshooting.

---

## Contributing

When contributing to DevSnippets:

1. Follow the architecture patterns in [ARCHITECTURE_PATTERN.md](./ARCHITECTURE_PATTERN.md)
2. Use error handling patterns from [ERROR_HANDLING.md](./ERROR_HANDLING.md)
3. Create tests following [scripts/README.md](../scripts/README.md)
4. Document new features in appropriate docs
5. Update this index if adding new documentation

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Vitest Documentation](https://vitest.dev)

---

## Questions?

- Check the relevant documentation file
- Review examples in the codebase
- Check error messages and logs
- Ask in team discussions

---

**Last Updated:** 2024
**Version:** 1.0
