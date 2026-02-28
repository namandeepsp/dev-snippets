import { cn } from '@/shared/utils/utils'

interface PageLoaderProps {
	fullScreen?: boolean
}

export function PageLoader({ fullScreen = true }: PageLoaderProps) {
	return (
		<div
			className={cn(
				'relative isolate flex w-full items-center justify-center overflow-hidden',
				fullScreen
					? 'fixed inset-0 z-9999 min-h-screen'
					: 'min-h-[70vh] rounded-3xl',
			)}
		>
			<div className="absolute inset-0 bg-white/20 backdrop-blur-sm dark:bg-slate-950/38" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.16),transparent_36%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,0.14),transparent_40%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(14,116,144,0.28),transparent_36%),radial-gradient(circle_at_85%_80%,rgba(30,64,175,0.26),transparent_40%)]" />
			<div className="relative z-10 flex h-full w-full items-center justify-center">
				<div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300/70 border-t-sky-600 shadow-[0_0_24px_rgba(14,165,233,0.28)] dark:border-slate-700/80 dark:border-t-sky-300 dark:shadow-[0_0_28px_rgba(56,189,248,0.36)]" />
			</div>
		</div>
	)
}
