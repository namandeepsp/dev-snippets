'use client'

import { LuHeart } from 'react-icons/lu'

interface SnippetStatsProps {
	viewsCount: number
	likesCount: number
	isLiked: boolean
	onLikeClick: () => void
}

export function SnippetStats({
	viewsCount,
	likesCount,
	isLiked,
	onLikeClick,
}: SnippetStatsProps) {
	return (
		<div className="flex shrink-0 items-center gap-4 text-sm text-gray-500">
			<span
				className="flex items-center gap-1"
				aria-label={`${viewsCount + 1} views`}
			>
				👁 {viewsCount + 1}
			</span>
			<button
				onClick={onLikeClick}
				className="flex items-center gap-1 transition-colors hover:text-red-500"
				aria-label={`${likesCount} likes`}
			>
				<LuHeart
					className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
				/>
				{likesCount}
			</button>
		</div>
	)
}
