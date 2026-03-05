import { cn } from '@/shared/utils/utils'

interface LogoIconProps {
	className?: string
}

const LogoIcon = ({ className }: LogoIconProps) => {
	return (
		<div
			className={cn(
				'relative flex h-9 w-9 items-center justify-center rounded-[22%] bg-linear-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-500/40',
				className,
			)}
		>
			<div className="absolute inset-0 rounded-[inherit] bg-linear-to-t from-black/10 to-transparent" />
			<svg
				className="relative h-[60%] w-[60%] text-white drop-shadow-sm"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2.5}
					d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
				/>
			</svg>
		</div>
	)
}

export default LogoIcon
