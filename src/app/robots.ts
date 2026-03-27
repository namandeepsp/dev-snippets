import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: [
					'/',
					'/about',
					'/contact',
					'/snippets',
					'/snippets/*',
					'/profile/*',
				],
				disallow: ['/login', '/settings', '/snippets/new'],
			},
		],
		sitemap: 'https://dev-snippets-chi.vercel.app/sitemap.xml',
	}
}
