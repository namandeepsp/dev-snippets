import type { RecentSnippet } from '@/features/snippets/ui/recent-snippets'
import { formatDate } from '@/shared/utils/date'
import Link from 'next/link'
import { LuX } from 'react-icons/lu'
import { Button } from '../design-system'

type Props = {
	displayedRecent: RecentSnippet[]
	onClose: () => void
	handleDeleteRecent: (id: string) => void
	handleClearRecent: () => void
}

const RecentlyOpenedSnippets = ({
	displayedRecent,
	onClose,
	handleDeleteRecent,
	handleClearRecent,
}: Props) => {
	return (
		<div>
			<div className="mb-2 flex items-center justify-between gap-2">
				<p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
					Recent snippets
				</p>
				<Button
					type="button"
					onClick={handleClearRecent}
					variant="ghost"
					className="text-xs font-medium text-foreground/60 transition hover:text-foreground hover:bg-transparent!"
				>
					Clear all
				</Button>
			</div>
			<div className="space-y-2">
				{displayedRecent.map((item) => (
					<div key={item.id} className="group relative">
						<Link
							href={`/snippets/${item.id}`}
							onClick={onClose}
							className="block rounded-lg border border-default px-3 py-2 pr-10 transition hover:bg-foreground/5"
						>
							<p className="text-sm font-medium">{item.title}</p>
							<p className="text-xs text-foreground/60">
								{item.ownerName} • {item.primaryLanguage} •{' '}
								{formatDate(item.viewedAt)}
							</p>
						</Link>
						<Button
							type="button"
							onClick={(event) => {
								event.stopPropagation()
								event.preventDefault()
								handleDeleteRecent(item.id)
							}}
							variant="ghost"
							className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md! p-1! text-foreground/50! opacity-100! transition! hover:bg-transparent! hover:text-foreground! sm:opacity-0! sm:group-hover:opacity-100! sm:group-focus-within:opacity-100!"
							aria-label={`Delete ${item.title} from recent`}
						>
							<LuX className="h-4 w-4" />
						</Button>
					</div>
				))}
			</div>
		</div>
	)
}

export default RecentlyOpenedSnippets
