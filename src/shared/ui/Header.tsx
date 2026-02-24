'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'

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

	if (pathname === '/login') return null

	// Don't render anything while loading to prevent flash
	if (loading) {
		return (
			<header className="border-b bg-background">
				<div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
					<Link href="/" className="text-xl font-bold">
						DevSnippets
					</Link>
					<div className="w-10 h-10" /> {/* Placeholder for theme toggle */}
				</div>
			</header>
		)
	}

	return (
		<header className="border-b bg-background">
			<div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
				{/* Logo */}
				<Link
					href="/"
					className="text-xl font-bold hover:opacity-80 transition"
				>
					DevSnippets
				</Link>

				{/* Navigation */}
				<nav className="flex items-center gap-6">
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
			</div>
		</header>
	)
}
