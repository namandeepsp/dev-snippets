import 'server-only'

import { SnippetService } from './core/snippet.service'
import { FirebaseSnippetRepository } from './infra/repositories/firebase-snippet.repository'

const snippetRepository = new FirebaseSnippetRepository()

export const snippetService = new SnippetService(
	snippetRepository,
	snippetRepository,
)
