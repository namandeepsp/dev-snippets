'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import Link from 'next/link'
import { useState } from 'react'
import { FeatureModal } from './FeatureModal'
import { FeaturesList } from './FeaturesList'
import type { Feature } from './features-data'

export function HomePageClient() {
	const { user, loading } = useAuth()
	const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)

	const handleFeatureClick = (feature: Feature) => {
		setSelectedFeature(feature)
	}

	const handleFeatureAction = (_feature: Feature) => {
		setSelectedFeature(null)
	}

	return (
		<main className="mx-auto max-w-6xl px-4 py-12">
			{/* Hero Section */}
			<section className="mb-16 space-y-6 text-center">
				<h1 className="text-4xl font-bold tracking-tight md:text-5xl">
					DevSnippets
				</h1>

				<p className="text-lg text-foreground/60 md:text-xl">
					Store, organize, and share reusable code snippets across technologies.
				</p>

				<div className="flex flex-wrap justify-center gap-4">
					{!loading && !user && (
						<Link
							href="/login"
							className="rounded-lg bg-foreground px-6 py-2 text-background font-medium hover:bg-foreground/90 transition-colors"
						>
							Get Started
						</Link>
					)}

					<Link
						href="/snippets"
						className="rounded-lg border border-default px-6 py-2 hover:bg-foreground/5 transition-colors"
					>
						Explore Snippets
					</Link>
				</div>
			</section>

			{/* Features Section */}
			<section className="mb-12">
				<FeaturesList onFeatureClick={handleFeatureClick} />
			</section>

			{/* Feature Modal */}
			<FeatureModal
				feature={selectedFeature}
				onClose={() => setSelectedFeature(null)}
				onAction={handleFeatureAction}
				isAuthenticated={!loading && !!user}
			/>
		</main>
	)
}
