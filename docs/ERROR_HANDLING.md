# Error Handling Guide

This guide documents error handling patterns and standardization across DevSnippets.

## Error Handling Philosophy

1. **Fail Fast**: Validate inputs early and throw meaningful errors
2. **Preserve Context**: Include relevant information in error messages
3. **Centralize Types**: Define error types in shared locations
4. **Feature-Specific Utils**: Use feature-specific error utilities for domain errors
5. **Graceful Degradation**: Non-critical operations should fail silently
6. **Logging**: Log errors with context for debugging

## Error Types

### Domain Errors

Domain-specific errors thrown by services and repositories.

```typescript
// src/shared/errors/domain.errors.ts

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}
```

### Firebase-Specific Errors

Firebase errors are caught and mapped to domain errors.

```typescript
// src/features/auth/infra/client/firebase-auth-errors.utils.ts

import { FirebaseError } from 'firebase/app';
import { ValidationError, UnauthorizedError, ConflictError } from '@/shared/errors/domain.errors';

export function mapFirebaseAuthError(error: unknown): Error {
  if (!(error instanceof FirebaseError)) {
    return new Error('Unknown authentication error');
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return new ValidationError('Invalid email address');
    
    case 'auth/weak-password':
      return new ValidationError('Password must be at least 6 characters');
    
    case 'auth/email-already-in-use':
      return new ConflictError('Email already registered');
    
    case 'auth/user-not-found':
      return new UnauthorizedError('User not found');
    
    case 'auth/wrong-password':
      return new UnauthorizedError('Invalid password');
    
    case 'auth/too-many-requests':
      return new Error('Too many login attempts. Please try again later.');
    
    default:
      return new Error(`Authentication error: ${error.message}`);
  }
}

export function mapFirebaseFirestoreError(error: unknown): Error {
  if (!(error instanceof FirebaseError)) {
    return new Error('Unknown database error');
  }

  switch (error.code) {
    case 'permission-denied':
      return new UnauthorizedError('Permission denied');
    
    case 'not-found':
      return new NotFoundError('Document', 'unknown');
    
    case 'already-exists':
      return new ConflictError('Document already exists');
    
    case 'unavailable':
      return new Error('Database temporarily unavailable');
    
    default:
      return new Error(`Database error: ${error.message}`);
  }
}
```

## Feature-Specific Error Handling

Each feature can define domain-specific errors.

### Auth Feature

```typescript
// src/features/auth/core/auth.errors.ts

import { UnauthorizedError, ValidationError } from '@/shared/errors/domain.errors';

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Invalid email or password');
  }
}

export class SessionExpiredError extends UnauthorizedError {
  constructor() {
    super('Session expired. Please log in again.');
  }
}

export class ProviderNotConfiguredError extends ValidationError {
  constructor(provider: string) {
    super(`OAuth provider not configured: ${provider}`);
  }
}
```

### User Feature

```typescript
// src/features/user/core/user.errors.ts

import { ValidationError, ConflictError } from '@/shared/errors/domain.errors';

export class InvalidUsernameError extends ValidationError {
  constructor(username: string) {
    super(`Invalid username: ${username}. Must be 3-20 alphanumeric characters.`);
  }
}

export class UsernameAlreadyTakenError extends ConflictError {
  constructor(username: string) {
    super(`Username already taken: ${username}`);
  }
}

export class InvalidProfileError extends ValidationError {
  constructor(field: string, reason: string) {
    super(`Invalid profile ${field}: ${reason}`);
  }
}
```

### Snippet Feature

```typescript
// src/features/snippets/core/snippet.errors.ts

import { ValidationError, NotFoundError, ForbiddenError } from '@/shared/errors/domain.errors';

export class InvalidSnippetError extends ValidationError {
  constructor(field: string, reason: string) {
    super(`Invalid snippet ${field}: ${reason}`);
  }
}

export class SnippetNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Snippet', id);
  }
}

export class SnippetAccessDeniedError extends ForbiddenError {
  constructor() {
    super('You do not have permission to access this snippet');
  }
}

export class VersionNotFoundError extends NotFoundError {
  constructor(snippetId: string, version: number) {
    super(`Version ${version} of snippet`, snippetId);
  }
}
```

## Error Handling in Services

Services should validate inputs and throw meaningful errors.

```typescript
// src/features/snippet/core/snippet.service.ts

import { SnippetValidator } from './snippet.validator';
import { SnippetNotFoundError, SnippetAccessDeniedError } from './snippet.errors';

export class SnippetService {
  async createSnippet(
    input: CreateSnippetServiceInput,
    userId: string,
    userName: string,
  ): Promise<Snippet> {
    // Validate input early
    SnippetValidator.validateCreateInput(input);
    
    const now = Date.now();
    const createInput: CreateSnippetInput = {
      ...input,
      ownerId: userId,
      ownerName: userName,
      likesCount: 0,
      viewsCount: 0,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      versions: [
        {
          version: 1,
          code: input.code,
          createdAt: now,
          createdBy: userId,
        },
      ],
    };

    return this.snippetPort.create(createInput);
  }

  async updateSnippet(
    snippetId: string,
    input: UpdateSnippetServiceInput,
    userId: string,
  ): Promise<void> {
    // Validate input
    SnippetValidator.validateUpdateInput(input);
    
    // Check existence
    const snippet = await this.snippetRepository.getById(snippetId);
    if (!snippet) {
      throw new SnippetNotFoundError(snippetId);
    }

    // Check authorization
    if (snippet.ownerId !== userId) {
      throw new SnippetAccessDeniedError();
    }

    // Proceed with update
    const updateInput: any = {
      ...input,
      updatedAt: Date.now(),
    };

    if (input.code && input.code !== snippet.code) {
      const { createNextVersion } = await import('./snippet.model');
      const newVersion = createNextVersion(snippet, input.code, userId);
      updateInput.versions = [...snippet.versions, newVersion];
    }

    await this.snippetRepository.update(snippetId, updateInput);
  }
}
```

## Error Handling in Validators

Validators should throw specific validation errors.

```typescript
// src/features/snippet/core/snippet.validator.ts

import { InvalidSnippetError } from './snippet.errors';

export class SnippetValidator {
  static validateCreateInput(input: CreateSnippetServiceInput): void {
    if (!input.title || input.title.trim().length === 0) {
      throw new InvalidSnippetError('title', 'Title is required');
    }

    if (input.title.length > 200) {
      throw new InvalidSnippetError('title', 'Title must be less than 200 characters');
    }

    if (!input.code || input.code.trim().length === 0) {
      throw new InvalidSnippetError('code', 'Code is required');
    }

    if (!input.technology) {
      throw new InvalidSnippetError('technology', 'Technology is required');
    }

    if (input.description && input.description.length > 500) {
      throw new InvalidSnippetError('description', 'Description must be less than 500 characters');
    }
  }

  static validateUpdateInput(input: UpdateSnippetServiceInput): void {
    if (input.title !== undefined) {
      if (input.title.length === 0) {
        throw new InvalidSnippetError('title', 'Title cannot be empty');
      }
      if (input.title.length > 200) {
        throw new InvalidSnippetError('title', 'Title must be less than 200 characters');
      }
    }

    if (input.code !== undefined && input.code.length === 0) {
      throw new InvalidSnippetError('code', 'Code cannot be empty');
    }
  }
}
```

## Error Handling in Server Actions

Server actions should catch errors and return meaningful responses.

```typescript
// src/features/snippet/snippet.actions.ts

'use server';

import { auth } from '@/services/auth';
import { snippetService } from './snippet.server.container';
import { DomainError } from '@/shared/errors/domain.errors';
import { logger } from '@/shared/utils/logger';

export async function createSnippetAction(
  input: CreateSnippetServiceInput,
): Promise<{ success: boolean; data?: Snippet; error?: string }> {
  try {
    const user = await auth.getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to create a snippet',
      };
    }

    const snippet = await snippetService.createSnippet(
      input,
      user.id,
      user.name,
    );

    return { success: true, data: snippet };
  } catch (error) {
    if (error instanceof DomainError) {
      logger.warn(`Domain error in createSnippetAction: ${error.message}`);
      return { success: false, error: error.message };
    }

    logger.error('Unexpected error in createSnippetAction', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: 'Failed to create snippet. Please try again.',
    };
  }
}

export async function updateSnippetAction(
  snippetId: string,
  input: UpdateSnippetServiceInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await auth.getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to update a snippet',
      };
    }

    await snippetService.updateSnippet(snippetId, input, user.id);

    return { success: true };
  } catch (error) {
    if (error instanceof DomainError) {
      logger.warn(`Domain error in updateSnippetAction: ${error.message}`);
      return { success: false, error: error.message };
    }

    logger.error('Unexpected error in updateSnippetAction', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: 'Failed to update snippet. Please try again.',
    };
  }
}
```

## Error Handling in UI Components

UI components should handle errors gracefully and display user-friendly messages.

```typescript
// src/features/snippet/ui/SnippetForm.tsx

'use client';

import { useState } from 'react';
import { snippetApiClient } from '../snippet.client.container';
import { toast } from 'sonner';

export function SnippetForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateSnippetServiceInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await snippetApiClient.create(data);
      
      if (!result.success) {
        setError(result.error || 'Failed to create snippet');
        toast.error(result.error || 'Failed to create snippet');
        return;
      }

      toast.success('Snippet created successfully');
      // Navigate or reset form
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(/* form data */);
    }}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      {/* Form fields */}
    </form>
  );
}
```

## Logging Errors

Use the logger utility to track errors with context.

```typescript
// src/shared/utils/logger.ts

export const logger = {
  error(message: string, context?: Record<string, any>) {
    console.error(`[ERROR] ${message}`, context);
    // Send to error tracking service (e.g., Sentry)
  },

  warn(message: string, context?: Record<string, any>) {
    console.warn(`[WARN] ${message}`, context);
  },

  info(message: string, context?: Record<string, any>) {
    console.info(`[INFO] ${message}`, context);
  },

  debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context);
    }
  },
};
```

## Error Handling Best Practices

1. **Validate Early**: Check inputs at service boundaries
2. **Throw Specific Errors**: Use domain-specific error classes
3. **Include Context**: Add relevant information to error messages
4. **Log Appropriately**: Use different log levels (error, warn, info, debug)
5. **Handle Gracefully**: Fail silently for non-critical operations
6. **User-Friendly Messages**: Show helpful messages in UI
7. **Preserve Stack Traces**: Don't lose error context
8. **Test Error Paths**: Include error scenarios in tests

## Error Handling Checklist

When implementing a new feature:

- [ ] Define domain-specific error classes
- [ ] Add error mapping for external services (Firebase, APIs)
- [ ] Validate inputs in validators
- [ ] Check authorization in services
- [ ] Handle errors in server actions
- [ ] Display user-friendly messages in UI
- [ ] Log errors with context
- [ ] Test error scenarios
- [ ] Document error codes and meanings
