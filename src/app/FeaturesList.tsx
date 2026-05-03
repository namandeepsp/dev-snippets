'use client'

import { FEATURES, type Feature } from './features-data'

type FeaturesListProps = {
	onFeatureClick: (feature: Feature) => void
}

export function FeaturesList({ onFeatureClick }: FeaturesListProps) {
	const existingFeatures = FEATURES.filter((f) => f.category === 'existing')
	const upcomingFeatures = FEATURES.filter((f) => f.category === 'upcoming')

	const FeatureCard = ({ feature }: { feature: Feature }) => {
		const Icon = feature.icon
		const isUpcoming = feature.category === 'upcoming'

		return (
			<button
				onClick={() => onFeatureClick(feature)}
				className="group relative overflow-hidden rounded-xl border border-default bg-background/50 p-6 text-left transition-all hover:border-foreground/30 hover:bg-background/80 hover:shadow-lg dark:hover:shadow-slate-900/20"
			>
				{/* Background gradient on hover */}
				<div className="absolute inset-0 bg-linear-to-br from-foreground/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

				{/* Content */}
				<div className="relative z-10">
					{/* Icon */}
					<div className="mb-4 inline-flex rounded-lg bg-foreground/10 p-3 transition-colors group-hover:bg-foreground/15">
						<Icon className="h-6 w-6 text-foreground" />
					</div>

					{/* Title */}
					<h3 className="mb-2 font-semibold text-foreground group-hover:text-foreground transition-colors">
						{feature.title}
					</h3>

					{/* Description */}
					<p className="mb-4 text-sm text-foreground/60 line-clamp-2">
						{feature.description}
					</p>

					{/* Status Badge */}
					<div className="flex items-center justify-between">
						{isUpcoming ? (
							<span className="inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
								Coming Soon
							</span>
						) : (
							<span className="inline-block rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-900 dark:bg-green-900/30 dark:text-green-200">
								Available
							</span>
						)}

						{/* Arrow indicator */}
						<div className="text-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-foreground/60">
							→
						</div>
					</div>
				</div>
			</button>
		)
	}

	return (
		<div className="space-y-12">
			{/* Existing Features */}
			<section>
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-foreground">
						Available Features
					</h2>
					<p className="mt-1 text-foreground/60">
						Everything you need to manage and share code snippets
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{existingFeatures.map((feature) => (
						<FeatureCard key={feature.id} feature={feature} />
					))}
				</div>
			</section>

			{/* Upcoming Features */}
			<section>
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
					<p className="mt-1 text-foreground/60">
						Exciting new features we're working on
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{upcomingFeatures.map((feature) => (
						<FeatureCard key={feature.id} feature={feature} />
					))}
				</div>
			</section>
		</div>
	)
}
