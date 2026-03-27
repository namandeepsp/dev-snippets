'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import { cn } from '@/shared/utils/utils'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { LuSearch } from 'react-icons/lu'
import Logo from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { Button, Skeleton } from './design-system'

export function Header() {
	const { user, loading } = useAuth()
	const pathname = usePathname()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)
	const mobileMenuRef = useRef<HTMLDivElement>(null)
	const burgerButtonRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		setMobileMenuOpen(false)
	}, [pathname])

	useEffect(() => {
		if (mobileMenuOpen && mobileMenuRef.current) {
			mobileMenuRef.current.focus()
		}
	}, [mobileMenuOpen])

	useEffect(() => {
		function handleSearchShortcut(event: KeyboardEvent) {
			if (
				!(event.metaKey || event.ctrlKey) ||
				event.key.toLowerCase() !== 'k'
			) {
				return
			}

			const target = event.target as HTMLElement | null
			const isTypingTarget =
				target?.tagName === 'INPUT' ||
				target?.tagName === 'TEXTAREA' ||
				target?.tagName === 'SELECT' ||
				target?.isContentEditable

			if (isTypingTarget) {
				return
			}

			event.preventDefault()
			setSearchOpen(true)
		}

		globalThis.addEventListener('keydown', handleSearchShortcut)
		return () => globalThis.removeEventListener('keydown', handleSearchShortcut)
	}, [])

	if (pathname === '/login') return null

	function handleMobileNavClick(event: React.MouseEvent<HTMLElement>) {
		const target = event.target as HTMLElement
		if (target.closest('a')) {
			setMobileMenuOpen(false)
		}
	}

	return (
		<header className="fixed top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
				<Logo />

				{loading ? (
					<>
						<div className="flex items-center gap-6 max-[1100px]:hidden">
							<Skeleton className="h-9 w-40 rounded-full" />
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-5 w-24" />
							<div className="flex items-center gap-3">
								<Skeleton className="h-10 w-10 rounded-full" />
								<Skeleton className="h-5 w-30" />
							</div>
							<Skeleton className="h-8 w-32 rounded-full" />
						</div>
						<div className="hidden items-center gap-2 max-[1100px]:flex">
							<Skeleton className="h-10 w-10 rounded-full" />
							<ThemeToggle />
							<Skeleton className="h-10 w-10 rounded-xl" />
						</div>
					</>
				) : (
					<>
						<nav className="flex items-center gap-6 max-[1100px]:hidden">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-9 rounded-full border-default px-3"
								onClick={() => setSearchOpen(true)}
							>
								<LuSearch className="h-4 w-4" />
								Search (Ctrl/Cmd + K)
							</Button>

							<Link
								href="/snippets"
								className="text-sm font-medium hover:text-foreground/80 transition"
							>
								Snippets
							</Link>
							<Link
								href="/about"
								className="text-sm font-medium hover:text-foreground/80 transition"
							>
								About
							</Link>

							{user ? (
								<>
									<Link
										href="/snippets/new"
										className="text-sm font-medium hover:text-foreground/80 transition"
									>
										Create
									</Link>

									<Link
										href="/settings"
										className="text-sm font-medium hover:text-foreground/80 transition"
									>
										Settings
									</Link>

									<div className="flex items-center gap-3">
										<Link
											href={`/profile/${user.username}`}
											className="flex items-center gap-2 text-sm hover:opacity-80 transition"
										>
											{user.avatarUrl ? (
												<img
													src={user.avatarUrl}
													alt={user.name}
													className="w-8 h-8 rounded-full"
												/>
											) : (
												<div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
													<span className="text-xs font-medium">
														{user.name.charAt(0).toUpperCase()}
													</span>
												</div>
											)}
											<span className="hidden sm:inline font-medium">
												{user.name}
											</span>
										</Link>
									</div>
								</>
							) : (
								<Link
									href="/login"
									className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition"
								>
									Sign In
								</Link>
							)}

							<ThemeToggle />
						</nav>

						<div className="hidden items-center gap-2 max-[1100px]:flex">
							<Button
								type="button"
								variant="glass"
								size="sm"
								className="h-10 w-10 rounded-full p-0 shadow-sm backdrop-blur-xl"
								onClick={() => setSearchOpen(true)}
								aria-label="Open snippet search"
								data-tooltip-id="app-tooltip"
								data-tooltip-content="Open search (Ctrl/Cmd + K)"
							>
								<LuSearch className="h-5 w-5" />
							</Button>
							<ThemeToggle />
							<Button
								ref={burgerButtonRef}
								type="button"
								aria-label="Toggle navigation menu"
								aria-expanded={mobileMenuOpen}
								onClick={() => setMobileMenuOpen((prev) => !prev)}
								variant="glass"
								size="sm"
								className="h-10 w-10 rounded-xl p-0 text-slate-700 backdrop-blur-md dark:text-slate-200"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									className="h-5 w-5"
								>
									{mobileMenuOpen ? (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									) : (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6h16M4 12h16M4 18h16"
										/>
									)}
								</svg>
							</Button>
						</div>
					</>
				)}
			</div>

			{!loading && (
				<div
					ref={mobileMenuRef}
					tabIndex={-1}
					onBlur={(e) => {
						if (
							!e.currentTarget.contains(e.relatedTarget) &&
							e.relatedTarget !== burgerButtonRef.current
						) {
							setMobileMenuOpen(false)
						}
					}}
					aria-hidden={!mobileMenuOpen}
					className={cn(
						'absolute left-0 right-0 top-full z-50 hidden border-t border-white/20 bg-background/95 px-4 py-4 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 ease-out max-[1100px]:block',
						mobileMenuOpen
							? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
							: 'pointer-events-none -translate-y-2 scale-95 opacity-0',
					)}
				>
					<nav
						className="mx-auto flex max-w-6xl flex-col gap-2"
						onClick={handleMobileNavClick}
					>
						<Link
							href="/snippets"
							className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/90 transition hover:bg-white/45 dark:hover:bg-slate-800/60"
						>
							Snippets
						</Link>
						<Link
							href="/about"
							className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/90 transition hover:bg-white/45 dark:hover:bg-slate-800/60"
						>
							About
						</Link>
						{user && (
							<Link
								href="/snippets/new"
								className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/90 transition hover:bg-white/45 dark:hover:bg-slate-800/60"
							>
								Create
							</Link>
						)}
						{user ? (
							<>
								<Link
									href="/settings"
									className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/90 transition hover:bg-white/45 dark:hover:bg-slate-800/60"
								>
									Settings
								</Link>
								<Link
									href={`/profile/${user.username}`}
									className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground/90 transition hover:bg-white/45 dark:hover:bg-slate-800/60"
								>
									{user.avatarUrl ? (
										<img
											src={user.avatarUrl}
											alt={user.name}
											className="h-7 w-7 rounded-full"
										/>
									) : (
										<div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
											<span className="text-[11px] font-medium">
												{user.name.charAt(0).toUpperCase()}
											</span>
										</div>
									)}
									Profile
								</Link>
							</>
						) : (
							<Link
								href="/login"
								className="rounded-xl bg-foreground px-3 py-2 text-sm font-medium text-background transition hover:opacity-90"
							>
								Sign In
							</Link>
						)}
					</nav>
				</div>
			)}

			{searchOpen && (
				<HeaderSearchModal
					open={searchOpen}
					onClose={() => setSearchOpen(false)}
				/>
			)}
		</header>
	)
}

const HeaderSearchModal = dynamic(
	() =>
		import('./HeaderSearchModal').then((mod) => ({
			default: mod.HeaderSearchModal,
		})),
	{
		ssr: false,
	},
)
