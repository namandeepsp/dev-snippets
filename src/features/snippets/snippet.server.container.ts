import 'server-only'

import { SnippetService } from './core/snippet.service'
import { FirebaseSnippetRepository } from './infra/repositories/firebase-snippet.repository'

/**
 * Server-side snippet dependency container.
 * This module must only be imported from server code.
 */
const snippetRepository = new FirebaseSnippetRepository()

export const snippetService = new SnippetService(
	snippetRepository,
	snippetRepository,
)
