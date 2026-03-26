import Link from 'next/link'
import type { SearchResult } from '../types'

type Props = {
	results: SearchResult[]
	onClose: () => void
}

const SearchResults = ({ results, onClose }: Props) => {
	return (
		<div className="space-y-2">
			{results.map((snippet) => (
				<Link
					key={snippet.id}
					href={`/snippets/${snippet.id}`}
					onClick={onClose}
					className="block rounded-lg border border-default px-3 py-2 transition hover:bg-foreground/5"
				>
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<p className="truncate text-sm font-medium">{snippet.title}</p>
							<p className="truncate text-xs text-foreground/60">
								@{snippet.author.username} • {snippet.language}
							</p>
						</div>
						<span className="text-xs text-foreground/60">
							{snippet.viewsCount} views
						</span>
					</div>
				</Link>
			))}
		</div>
	)
}

export default SearchResults
