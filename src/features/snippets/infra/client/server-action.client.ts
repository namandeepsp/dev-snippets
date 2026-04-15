import type {
	CreateSnippetServiceInput,
	UpdateSnippetServiceInput,
} from '../../core/repositories/snippet.repository'
import type { Snippet } from '../../core/snippet.types'
import type { SnippetAPIClient } from './snippet-api.client'

import {
	createSnippetAction,
	deleteSnippetAction,
	incrementViewsAction,
	updateSnippetAction,
} from '../../snippet.actions'

export class ServerActionSnippetClient implements SnippetAPIClient {
	async create(input: CreateSnippetServiceInput): Promise<Snippet> {
		const response = await createSnippetAction(input)
		if (!response.success) {
			throw new Error(response.error || 'Failed to create snippet')
		}
		return response.data!
	}

	async update(
		id: string,
		input: Partial<CreateSnippetServiceInput>,
	): Promise<void> {
		const response = await updateSnippetAction(
			id,
			input as UpdateSnippetServiceInput,
		)
		if (!response.success) {
			throw new Error(response.error || 'Failed to update snippet')
		}
	}

	async delete(id: string): Promise<void> {
		const response = await deleteSnippetAction(id)
		if (!response.success) {
			throw new Error(response.error || 'Failed to delete snippet')
		}
	}

	async incrementViews(id: string): Promise<void> {
		const response = await incrementViewsAction(id)
		if (!response.success) {
			throw new Error(response.error || 'Failed to increment views')
		}
	}

	async getById(_id: string): Promise<Snippet | null> {
		throw new Error(
			'❌ snippetApiClient.getById() cannot be used in client components.\n\n' +
				'Instead, fetch the snippet in a Server Component:\n\n' +
				'```tsx\n' +
				'// app/snippets/[id]/page.tsx (Server Component)\n' +
				"import { snippetService } from '@/features/snippets/snippet.server.container'\n\n" +
				'export default async function Page({ params }) {\n' +
				'  const snippet = await snippetService.getById(params.id)\n' +
				'  return <ClientComponent snippet={snippet} />\n' +
				'}\n' +
				'```',
		)
	}

	async listPublic(): Promise<Snippet[]> {
		throw new Error(
			'❌ snippetApiClient.listPublic() cannot be used in client components.\n\n' +
				'Instead, fetch snippets in a Server Component:\n\n' +
				'```tsx\n' +
				'// app/snippets/page.tsx (Server Component)\n' +
				"import { snippetService } from '@/features/snippets/snippet.server.container'\n\n" +
				'export default async function Page() {\n' +
				'  const snippets = await snippetService.listPublic()\n' +
				'  return <SnippetsGrid snippets={snippets} />\n' +
				'}\n' +
				'```',
		)
	}

	async listByUser(_userId: string): Promise<Snippet[]> {
		throw new Error(
			'❌ snippetApiClient.listByUser() cannot be used in client components.\n\n' +
				'Instead, fetch snippets in a Server Component:\n\n' +
				'```tsx\n' +
				'// app/profile/[username]/page.tsx (Server Component)\n' +
				"import { snippetService } from '@/features/snippets/snippet.server.container'\n\n" +
				'export default async function Page({ params }) {\n' +
				'  const snippets = await snippetService.listByUsername(params.username)\n' +
				'  return <ProfileSnippets snippets={snippets} />\n' +
				'}\n' +
				'```',
		)
	}
}
