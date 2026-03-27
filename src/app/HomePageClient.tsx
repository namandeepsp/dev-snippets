'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import Link from 'next/link'

export function HomePageClient() {
	const { user, loading } = useAuth()

	return (
		<main className="mx-auto max-w-5xl px-4 py-12">
			<section className="space-y-6 text-center">
				<h1 className="text-4xl font-bold tracking-tight">DevSnippets</h1>

				<p className="text-lg text-gray-600 dark:text-gray-400">
					Store, organize, and share reusable code snippets across technologies.
				</p>

				<div className="flex justify-center gap-4">
					{!loading && !user && (
						<Link
							href="/login"
							className="rounded-lg bg-foreground px-6 py-2 text-background font-medium"
						>
							Get Started
						</Link>
					)}

					<Link
						href="/snippets"
						className="rounded-lg border border-default px-6 py-2"
					>
						Explore Snippets
					</Link>
				</div>
			</section>
		</main>
	)
}
