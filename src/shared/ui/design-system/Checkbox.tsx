import type { InputHTMLAttributes } from 'react'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
	label?: string
}

export function Checkbox({
	label,
	className = '',
	checked,
	...props
}: CheckboxProps) {
	if (label) {
		return (
			<label className="flex items-center gap-2 cursor-pointer group">
				<div className="relative">
					<input
						type="checkbox"
						checked={checked}
						className="sr-only peer"
						{...props}
					/>
					<div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500/20 transition-all duration-200 flex items-center justify-center">
						{checked && (
							<svg
								className="w-3 h-3 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={3}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						)}
					</div>
				</div>
				<span className="text-sm text-gray-700 dark:text-gray-300 leading-none select-none">
					{label}
				</span>
			</label>
		)
	}

	return (
		<div className="relative">
			<input
				type="checkbox"
				checked={checked}
				className="sr-only peer"
				{...props}
			/>
			<div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500/20 transition-all duration-200 flex items-center justify-center cursor-pointer">
				{checked && (
					<svg
						className="w-3 h-3 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={3}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				)}
			</div>
		</div>
	)
}
