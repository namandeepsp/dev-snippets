'use client'

import { useRequireAuth } from '@/shared/ui/AuthRequired'
import { Button } from '@/shared/ui/design-system'
import { useRouter } from 'next/navigation'

export function AboutPageClient() {
	const router = useRouter()
	const { requireAuth, modal } = useRequireAuth()

	return (
		<main className="mx-auto max-w-5xl px-4 py-12">
			<section className="space-y-6">
				<div className="space-y-3">
					<p className="text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400">
						About Us
					</p>
					<h1 className="text-4xl font-bold tracking-tight">
						A focused workspace for reusable code.
					</h1>
					<p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
						DevSnippets helps developers capture practical snippets, organize
						them by technology, and share solutions quickly with teammates.
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="rounded-xl border border-default/70 p-5">
						<h2 className="text-lg font-semibold">What You Can Do</h2>
						<ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
							<li>Create and edit snippets in a structured format.</li>
							<li>Tag snippets by language and tech stack.</li>
							<li>Browse, discover, and reuse community snippets.</li>
							<li>Keep your profile of saved coding patterns.</li>
						</ul>
					</div>

					<div className="rounded-xl border border-default/70 p-5">
						<h2 className="text-lg font-semibold">Who It Is For</h2>
						<p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
							Developers, students, and teams who want a reliable place to
							collect working code examples and avoid rewriting common logic
							from scratch.
						</p>
					</div>
				</div>

				<div className="rounded-xl border border-default/70 p-5">
					<h2 className="text-lg font-semibold">Contact Us</h2>
					<p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
						Have feedback, partnership ideas, or a feature request? We would
						love to hear from you.
					</p>
					<Button
						type="button"
						size="sm"
						variant="outline"
						className="mt-4"
						onClick={() => router.push('/contact')}
					>
						Email Us
					</Button>
				</div>

				<div className="flex flex-wrap gap-3">
					<Button
						type="button"
						size="sm"
						variant="primary"
						onClick={() => router.push('/snippets')}
					>
						Explore Snippets
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() =>
							requireAuth(() => {
								router.push('/snippets/new')
							})
						}
					>
						Create Snippet
					</Button>
				</div>
				{modal}
			</section>
		</main>
	)
}
