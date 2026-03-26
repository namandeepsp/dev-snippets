'use client'

import Link from 'next/link'

interface Author {
	id: string
	username: string
	name: string
	avatarUrl: string | null
}

interface AuthorCardProps {
	author: Author
}

export function AuthorCard({ author }: AuthorCardProps) {
	return (
		<Link
			href={`/profile/${author.username}`}
			className="flex min-w-0 items-center gap-3 transition hover:opacity-80"
		>
			{author.avatarUrl ? (
				<img
					src={author.avatarUrl}
					alt={author.name}
					className="w-10 h-10 rounded-full"
				/>
			) : (
				<div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
					<span className="text-sm font-medium">
						{author.name.charAt(0).toUpperCase()}
					</span>
				</div>
			)}
			<div className="min-w-0">
				<p className="truncate font-medium leading-tight">
					{author.name}
				</p>
				<p className="truncate text-xs text-gray-500">
					@{author.username}
				</p>
			</div>
		</Link>
	)
}
