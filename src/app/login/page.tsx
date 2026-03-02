'use client'

import {
	signInWithEmailAndPassword,
	signInWithGoogle,
	signUpWithEmailAndPassword,
	useAuth,
} from '@/features/auth/auth.client.container'
import { PageLoader } from '@/shared/ui/PageLoader'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { Button, Card, CardBody, Input, toast } from '@/shared/ui/design-system'
import { logger } from '@/shared/utils/logger'
import { cn } from '@/shared/utils/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function MailIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="h-5 w-5"
			fill="none"
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
				d="M4 7.5A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v9a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-9z"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
				d="M4.8 7.8l6.1 5.3a1.7 1.7 0 002.2 0l6.1-5.3"
			/>
		</svg>
	)
}

function LockIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="h-5 w-5"
			fill="none"
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
				d="M8 10V7a4 4 0 118 0v3"
			/>
			<rect x="5" y="10" width="14" height="10" rx="2" strokeWidth={1.8} />
		</svg>
	)
}

function UserIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="h-5 w-5"
			fill="none"
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
				d="M12 12a4 4 0 100-8 4 4 0 000 8z"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
				d="M5 20a7 7 0 0114 0"
			/>
		</svg>
	)
}

export default function LoginPage() {
	return (
		<div className="relative overflow-hidden px-4 py-8 sm:py-12">
			<div className="fixed right-4 top-4 z-50">
				<ThemeToggle />
			</div>
			<div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-cyan-300/35 blur-3xl dark:bg-cyan-800/30" />
			<div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-900/30" />
			<Suspense fallback={<PageLoader fullScreen />}>
				<LoginContent />
			</Suspense>
		</div>
	)
}

function LoginContent() {
	const { user, loading, refresh } = useAuth()
	const router = useRouter()
	const searchParams = useSearchParams()
	const redirectTo = searchParams.get('redirect') || '/snippets'
	const [mode, setMode] = useState<'signin' | 'signup'>('signin')
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		if (!loading && user) {
			router.replace(redirectTo)
		}
	}, [user, loading, redirectTo, router])

	async function handleGoogleLogin() {
		setSubmitting(true)
		try {
			const result = await signInWithGoogle()
			if (result.isNewUser) {
				toast.success('Welcome to DevSnippets!')
			} else {
				toast.success('Welcome back!')
			}
			await refresh()
			router.replace(redirectTo)
		} catch (error) {
			logger.error('Login failed', error)
			const message =
				error instanceof Error ? error.message : 'Google sign-in failed'
			toast.error(message)
		} finally {
			setSubmitting(false)
		}
	}

	async function handleEmailAuth(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		const normalizedEmail = email.trim().toLowerCase()
		if (!normalizedEmail || !password) {
			toast.error('Email and password are required')
			return
		}

		if (mode === 'signup') {
			if (!name.trim()) {
				toast.error('Name is required')
				return
			}
			if (password.length < 6) {
				toast.error('Password should be at least 6 characters')
				return
			}
			if (password !== confirmPassword) {
				toast.error('Password and confirm password do not match')
				return
			}
		}

		setSubmitting(true)
		try {
			if (mode === 'signup') {
				await signUpWithEmailAndPassword(normalizedEmail, password, name.trim())
				toast.success('Account created successfully!')
			} else {
				await signInWithEmailAndPassword(normalizedEmail, password)
				toast.success('Welcome back!')
			}
			await refresh()
			router.replace(redirectTo)
		} catch (error) {
			logger.error('Email auth failed', error)
			const message =
				error instanceof Error ? error.message : 'Authentication failed'
			toast.error(message)
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return <PageLoader fullScreen />
	}

	if (user) {
		return null
	}

	return (
		<div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_440px]">
			<div className="hidden rounded-4xl border border-white/35 bg-white/40 p-10 shadow-xl shadow-cyan-900/10 backdrop-blur-xl lg:flex lg:flex-col lg:justify-between dark:border-white/10 dark:bg-slate-950/35">
				<div>
					<h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
						Welcome to
						<br />
						DevSnippets
					</h1>
					<p className="mt-5 max-w-md text-base text-slate-600 dark:text-slate-300">
						Store, organize, and share your code snippets across technologies.
						Built for developers who value simplicity and speed.
					</p>
				</div>
				<div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
					<p>✓ Organize snippets by technology and category</p>
					<p>✓ Syntax highlighting for 20+ languages</p>
					<p>✓ Share publicly or keep private</p>
					<p>✓ Version history and code search</p>
				</div>
			</div>

			<Card variant="glass" className="w-full rounded-4xl">
				<CardBody className="p-6 sm:p-8">
					<div className="mb-6 text-center">
						<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 via-blue-500 to-cyan-400 shadow-lg shadow-blue-600/30"></div>
						<h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
							Welcome to DevSnippets
						</h2>
						<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
							Your code, organized and accessible
						</p>
					</div>

					<div className="space-y-5">
						<Button
							onClick={handleGoogleLogin}
							disabled={submitting}
							variant="glass"
							size="lg"
							className="h-12 w-full border-slate-300/50 bg-white/90 hover:bg-white dark:border-white/15 dark:bg-slate-900/45"
							leftIcon={
								<svg viewBox="0 0 24 24" width="20" height="20">
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
							}
						>
							Continue with Google
						</Button>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-slate-300/60 dark:border-slate-700/70" />
							</div>
							<div className="relative flex justify-center text-xs uppercase tracking-widest">
								<span className="rounded-full bg-white/70 px-3 py-1 text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
									or continue with email
								</span>
							</div>
						</div>

						<div className="rounded-2xl border border-white/55 bg-white/65 p-0 backdrop-blur-xl dark:border-white/15 dark:bg-slate-950/40">
							<div className="grid h-12 grid-cols-2 gap-1">
								<Button
									type="button"
									onClick={() => setMode('signin')}
									variant="ghost"
									size="sm"
									className={cn(
										'h-full text-sm font-semibold transition-all duration-200',
										mode === 'signin'
											? 'bg-linear-to-r from-sky-500 to-blue-500 text-white shadow-md shadow-sky-500/35'
											: 'text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-800/60',
									)}
								>
									Sign In
								</Button>
								<Button
									type="button"
									onClick={() => setMode('signup')}
									variant="ghost"
									size="sm"
									className={cn(
										'h-full text-sm font-semibold transition-all duration-200',
										mode === 'signup'
											? 'bg-linear-to-r from-sky-500 to-blue-500 text-white shadow-md shadow-sky-500/35'
											: 'text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-800/60',
									)}
								>
									Create Account
								</Button>
							</div>
						</div>

						<form onSubmit={handleEmailAuth} className="space-y-3">
							{mode === 'signup' && (
								<Input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Full name"
									autoComplete="name"
									disabled={submitting}
									required
									variant="glass"
									className="h-12 py-0"
									leftIcon={<UserIcon />}
									name="name"
								/>
							)}
							<Input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Email address"
								autoComplete="email"
								disabled={submitting}
								required
								variant="glass"
								className="h-12 py-0"
								leftIcon={<MailIcon />}
								name="email"
							/>
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Password"
								autoComplete={
									mode === 'signup' ? 'new-password' : 'current-password'
								}
								disabled={submitting}
								required
								variant="glass"
								className="h-12 py-0"
								leftIcon={<LockIcon />}
								name="password"
							/>
							{mode === 'signup' && (
								<Input
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Confirm password"
									autoComplete="new-password"
									disabled={submitting}
									required
									variant="glass"
									className="h-12 py-0"
									leftIcon={<LockIcon />}
									name="confirmPassword"
								/>
							)}

							<Button
								type="submit"
								disabled={submitting}
								isLoading={submitting}
								size="lg"
								className="mt-2 h-12 w-full bg-linear-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-blue-600/40 hover:from-sky-600 hover:to-blue-600"
							>
								{mode === 'signup' ? 'Create Account' : 'Sign In'}
							</Button>
						</form>

						<p className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400">
							By continuing, you agree to our{' '}
							<a
								href="/terms"
								className="font-semibold text-sky-600 dark:text-sky-400"
							>
								Terms
							</a>{' '}
							and{' '}
							<a
								href="/privacy"
								className="font-semibold text-sky-600 dark:text-sky-400"
							>
								Privacy Policy
							</a>
						</p>
					</div>
				</CardBody>
			</Card>
		</div>
	)
}
