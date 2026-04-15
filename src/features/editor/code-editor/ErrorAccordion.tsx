import React from 'react'
import { MdErrorOutline } from 'react-icons/md'

interface ErrorAccordionProps {
	errors: string[]
	isOpen: boolean
	onToggle: () => void
	ref?: React.RefObject<HTMLDivElement>
}

export const ErrorAccordion = React.forwardRef<
	HTMLDivElement,
	ErrorAccordionProps
>(function ErrorAccordion({ errors, isOpen, onToggle }, ref) {
	if (errors.length === 0) return null

	return (
		<div ref={ref} className="w-full">
			<div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 shadow-lg">
				<button
					onClick={onToggle}
					className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
				>
					<div className="flex items-center gap-2">
						<MdErrorOutline className="h-5 w-5 text-red-600 dark:text-red-400" />
						<span className="font-medium text-red-800 dark:text-red-200">
							Formatting Errors ({errors.length})
						</span>
					</div>
					<svg
						className={`h-5 w-5 text-red-600 dark:text-red-400 transition-transform ${
							isOpen ? 'rotate-180' : ''
						}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{isOpen && (
					<div className="border-t border-red-200 dark:border-red-800">
						<div className="max-h-60 overflow-y-auto px-4 py-3">
							<div className="space-y-3">
								{errors.map((error, index) => (
									<div
										key={index}
										className="rounded-md bg-red-100 dark:bg-red-900/20 p-3"
									>
										<div className="flex items-start gap-2">
											<MdErrorOutline className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
											<div className="text-sm text-red-800 dark:text-red-200">
												<pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
													{error}
												</pre>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
})
