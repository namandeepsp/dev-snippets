const LogoIcon = () => {
	return (
		<div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-500/40">
			<div className="absolute inset-0 rounded-xl bg-linear-to-t from-black/10 to-transparent" />
			<svg
				className="relative h-5 w-5 text-white drop-shadow-sm"
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
