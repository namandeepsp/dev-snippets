import type {
	CreateSnippetServiceInput,
	UpdateSnippetServiceInput,
} from './repositories/snippet.repository'
import { SNIPPET_TITLE_MAX_LENGTH } from './snippet.types'

/**
 * ============================================================================
 * SNIPPET VALIDATOR
 * ============================================================================
 *
 * Validates snippet input data against business rules.
 */

export class SnippetValidator {
	static validateCreateInput(input: CreateSnippetServiceInput): void {
		if (!input.title.trim()) {
			throw new Error('Title is required')
		}

		if (input.title.trim().length > SNIPPET_TITLE_MAX_LENGTH) {
			throw new Error(
				`Title must be ${SNIPPET_TITLE_MAX_LENGTH} characters or fewer`,
			)
		}

		if (!input.code.trim()) {
			throw new Error('Code is required')
		}
	}

	static validateUpdateInput(input: UpdateSnippetServiceInput): void {
		if (input.title === undefined) {
			return
		}

		if (!input.title.trim()) {
			throw new Error('Title is required')
		}

		if (input.title.trim().length > SNIPPET_TITLE_MAX_LENGTH) {
			throw new Error(
				`Title must be ${SNIPPET_TITLE_MAX_LENGTH} characters or fewer`,
			)
		}
	}
}
