'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import { cn } from '@/shared/utils/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { Button, Skeleton } from './design-system'

/**
 * ============================================================================
 * HEADER
 * ============================================================================
 *
 * Main navigation header for the application.
 *
 * Features:
 * - Logo/home link
 * - Navigation links
 * - User menu (when authenticated)
 * - Login button (when not authenticated)
 * - Theme toggle
 *
 * Uses the auth container directly - no props needed.
 */

export function Header() {
	const { user, loading } = useAuth()
	const pathname = usePathname()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	useEffect(() => {
		setMobileMenuOpen(false)
	}, [pathname])

	if (pathname === '/login') return null

	function handleMobileNavClick(event: React.MouseEvent<HTMLElement>) {
		const target = event.target as HTMLElement
		if (target.closest('a')) {
			setMobileMenuOpen(false)
		}
	}

	// Don't render anything while loading to prevent flash
	if (loading) {
		return <HeaderSkeleton />
	}

	return (
		<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
				{/* Logo */}
				<Link
					href="/"
					className="text-xl font-bold hover:opacity-80 transition"
				>
					DevSnippets
				</Link>

				{/* Desktop Navigation */}
				<nav className="flex items-center gap-6 max-[850px]:hidden">
					<Link
						href="/snippets"
						className="text-sm font-medium hover:text-foreground/80 transition"
					>
						Snippets
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

							{/* User Menu */}
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

				{/* Mobile Actions */}
				<div className="hidden items-center gap-2 max-[850px]:flex">
					<ThemeToggle />
					{!user && (
						<Link
							href="/login"
							className="rounded-xl bg-foreground px-3 py-2 text-sm font-medium text-background transition hover:opacity-90"
						>
							Sign In
						</Link>
					)}
					<Button
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
			</div>

			<div
				aria-hidden={!mobileMenuOpen}
				className={cn(
					'absolute left-0 right-0 top-full z-50 hidden border-t border-white/20 bg-background/95 px-4 py-4 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 ease-out max-[850px]:block',
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

					{user ? (
						<>
							<Link
								href="/snippets/new"
								className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/90 transition hover:bg-white/45 dark:hover:bg-slate-800/60"
							>
								Create
							</Link>
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
					) : null}
				</nav>
			</div>
		</header>
	)
}

function HeaderSkeleton() {
	return (
		<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
				<Link href="/" className="text-xl font-bold">
					DevSnippets
				</Link>

				<div className="flex items-center gap-6 max-[850px]:hidden">
					<Skeleton className="h-6 w-16" />
					<Skeleton className="h-6 w-14" />
					<Skeleton className="h-6 w-16" />
					<div className="flex gap-2 items-center">
						<Skeleton className="h-9 w-9 rounded-full" />
						<Skeleton className="h-6 w-28" />
					</div>
					<Skeleton className="h-9 w-28 rounded-full" />
				</div>

				<div className="hidden items-center gap-2 max-[850px]:flex">
					<ThemeToggle />
					<Skeleton className="h-10 w-10 rounded-xl" />
				</div>
			</div>
		</header>
	)
}
