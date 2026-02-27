'use client'

import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

export { Tooltip } from 'react-tooltip'

export function TooltipProvider() {
	return (
		<ReactTooltip
			id="app-tooltip"
			place="bottom"
			className="!bg-slate-200/75 !text-slate-900 !text-xs !px-2 !py-1 !rounded-lg !opacity-100 !backdrop-blur-md !border !border-slate-300/60 dark:!bg-slate-900/60 dark:!text-slate-100 dark:!border-white/20"
			style={{ zIndex: 9999 }}
		/>
	)
}
