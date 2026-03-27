import { snippetService } from '@/features/snippets/snippet.server.container'
import type { MetadataRoute } from 'next'

const BASE_URL = 'https://dev-snippets-chi.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: `${BASE_URL}/`,
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: `${BASE_URL}/snippets`,
			changeFrequency: 'daily',
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/about`,
			changeFrequency: 'monthly',
			priority: 0.6,
		},
		{
			url: `${BASE_URL}/contact`,
			changeFrequency: 'monthly',
			priority: 0.5,
		},
	]

	const snippets = await snippetService.listPublic('latest')
	const snippetRoutes: MetadataRoute.Sitemap = snippets.map((snippet) => ({
		url: `${BASE_URL}/snippets/${snippet.id}`,
		lastModified: new Date(snippet.updatedAt ?? snippet.createdAt),
		changeFrequency: 'weekly',
		priority: 0.7,
	}))

	return [...staticRoutes, ...snippetRoutes]
}
