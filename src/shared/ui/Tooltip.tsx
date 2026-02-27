'use client'

import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

export { Tooltip } from 'react-tooltip'

export function TooltipProvider() {
	return (
		<ReactTooltip
			id="app-tooltip"
			place="bottom"
			className="!bg-gray-600 !text-white !text-xs !px-2 !py-1 !rounded-lg !opacity-100 dark:!bg-slate-700"
			style={{ zIndex: 9999 }}
		/>
	)
}
