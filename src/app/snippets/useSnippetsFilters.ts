import type { SnippetSortBy } from '@/features/snippets/core/repositories/snippet.repository'
import type { SnippetTechnology } from '@/features/snippets/core/snippet.types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function useSnippetsFilters() {
	const router = useRouter()
	const searchParams = useSearchParams()

	const sortBy = (searchParams.get('sort') as SnippetSortBy) || 'latest'
	const showLikedOnly = searchParams.get('liked') === 'true'
	const technologiesParam = searchParams.get('technologies')
	const selectedTechnologies = technologiesParam
		? (technologiesParam.split(',') as SnippetTechnology[])
		: []

	const updateURL = useCallback(
		(
			newSort?: SnippetSortBy,
			newLiked?: boolean,
			newTechnologies?: SnippetTechnology[],
		) => {
			const params = new URLSearchParams()
			const sort = newSort ?? sortBy
			const liked = newLiked ?? showLikedOnly
			const techs = newTechnologies ?? selectedTechnologies

			if (sort !== 'latest') params.set('sort', sort)
			if (liked) params.set('liked', 'true')
			if (techs.length > 0) params.set('technologies', techs.join(','))

			const query = params.toString()
			router.push(`/snippets${query ? `?${query}` : ''}`, { scroll: false })
		},
		[router, sortBy, showLikedOnly, selectedTechnologies],
	)

	const toggleTechnology = (tech: SnippetTechnology) => {
		const newTechs = selectedTechnologies.includes(tech)
			? selectedTechnologies.filter((t) => t !== tech)
			: [...selectedTechnologies, tech]
		updateURL(undefined, undefined, newTechs)
	}

	const clearTechnologies = () => {
		updateURL(undefined, undefined, [])
	}

	return {
		sortBy,
		showLikedOnly,
		selectedTechnologies,
		updateURL,
		toggleTechnology,
		clearTechnologies,
	}
}
