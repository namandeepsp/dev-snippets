import dynamic from 'next/dynamic'

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
	ssr: false,
	loading: () => {
		return (
			<div className="space-y-3 p-4">
				{Array.from({ length: 12 }).map((_, idx) => {
					const lineWidths = [
						'w-[94%]',
						'w-[82%]',
						'w-[88%]',
						'w-[76%]',
						'w-[90%]',
					]
					return (
						<div
							key={idx}
							className={`h-3 ${lineWidths[idx % lineWidths.length]} rounded-sm ${
								idx === 0 ? 'w-full h-4 bg-white/10' : 'bg-white/8'
							}`}
						/>
					)
				})}
			</div>
		)
	},
})

export default CodeMirror
