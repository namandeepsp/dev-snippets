import { UserService } from './core/user.service'
import { FirebaseUserPort } from './infra/repositories/firebase-user.repository'

// Re-export types only - no implementations
export type {
	User,
	PublicUser,
	CreateUserDTO,
	UpdateUserDTO,
} from './core/user.types'

export type {
	UserDomainError,
	DomainErrorCode,
} from './core/user.service'

/**
 * ============================================================================
 * DEPENDENCY INJECTION CONTAINER
 * ============================================================================
 *
 * Wires up the user feature dependencies.
 *
 * Key principles:
 * 1. Repository is internal - never exported directly
 * 2. Service is the public API
 * 3. Types are re-exported for convenience
 * 4. Single instance (singleton) for the entire app
 *
 * Why no port/adapter?
 * - UserPort IS the port. The interface defines the contract.
 * - Adapter pattern was redundant - we just implement the interface.
 * - Less indirection = more maintainable.
 */

/* ----------------------------------------------------------------------- */
/* INTERNAL DEPENDENCIES - NOT EXPORTED                                   */
/* ----------------------------------------------------------------------- */

/**
 * Port implementation.
 *
 * This is an INTERNAL detail of the user feature.
 * No other feature should import this directly.
 * Always go through the service.
 */
const userPort = new FirebaseUserPort()

/* ----------------------------------------------------------------------- */
/* PUBLIC API - EXPORTED                                                  */
/* ----------------------------------------------------------------------- */

/**
 * User service instance.
 *
 * This is the PUBLIC API of the user feature.
 * All user operations should go through this service.
 *
 * Usage:
 * ```ts
 * import { userService } from '@/features/user/user.container'
 *
 * const user = await userService.getUserById('123')
 * ```
 */
export const userService = new UserService(userPort)
