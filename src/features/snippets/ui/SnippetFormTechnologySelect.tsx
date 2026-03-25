'use client'

import { TECHNOLOGY_OPTIONS } from '@/features/technologies/technologies.config'
import { TechnologyIcon } from '@/features/technologies/technology-icons'
import { CustomSelect } from '@/shared/ui/design-system'
import type { SnippetTechnology } from '../core/snippet.types'

type SnippetFormTechnologySelectProps = {
	techToAdd: string
	onTechAdd: (value: string) => void
	technologies: SnippetTechnology[]
	isSaving: boolean
}

export function SnippetFormTechnologySelect({
	techToAdd,
	onTechAdd,
	technologies,
	isSaving,
}: SnippetFormTechnologySelectProps) {
	return (
		<div>
			<label className="block mb-2 font-medium">Additional Technologies</label>
			<div className="space-y-3">
				<CustomSelect
					value={techToAdd}
					onChange={onTechAdd}
					placeholder="Add technology"
					searchable
					searchPlaceholder="Filter technologies..."
					disabled={isSaving}
					options={TECHNOLOGY_OPTIONS.filter(
						(tech) => !technologies.includes(tech.value),
					).map((tech) => ({
						value: tech.value,
						label: tech.label,
						icon: <TechnologyIcon technology={tech.iconKey} />,
					}))}
				/>
			</div>
		</div>
	)
}
