import type {
	CreateSnippetServiceInput,
	UpdateSnippetServiceInput,
} from './repositories/snippet.repository'
import { SNIPPET_TITLE_MAX_LENGTH } from './snippet.types'

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

		if (!input.files || input.files.length === 0) {
			throw new Error('At least one file is required')
		}

		for (const file of input.files) {
			if (!file.code.trim()) {
				throw new Error(`Code in file "${file.filename}" is required`)
			}
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
