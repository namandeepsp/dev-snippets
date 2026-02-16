export default function HomePage() {
	return (
		<main className="mx-auto max-w-5xl px-4 py-12">
			<section className="space-y-6 text-center">
				<h1 className="text-4xl font-bold tracking-tight">DevSnippets</h1>

				<p className="text-lg text-gray-600 dark:text-gray-400">
					Store, organize, and share reusable code snippets across technologies.
				</p>

				<div className="flex justify-center gap-4">
					<a
						href="/login"
						className="rounded-lg bg-foreground px-6 py-2 text-background font-medium"
					>
						Get Started
					</a>

					<a
						href="/snippets"
						className="rounded-lg border border-default px-6 py-2"
					>
						Explore Snippets
					</a>
				</div>
			</section>
		</main>
	)
}
