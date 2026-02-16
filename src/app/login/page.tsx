'use client'

import {
	signInWithEmailAndPassword,
	signInWithGoogle,
	signUpWithEmailAndPassword,
	useAuth,
} from '@/features/auth/auth.client.container'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
	const { user, loading } = useAuth()
	const router = useRouter()
	const searchParams = useSearchParams()
	const redirectTo = searchParams.get('redirect') || '/snippets'
	const [mode, setMode] = useState<'signin' | 'signup'>('signin')
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!loading && user) {
			router.replace(redirectTo)
		}
	}, [user, loading, redirectTo, router])

	async function handleGoogleLogin() {
		setSubmitting(true)
		setError(null)
		try {
			const result = await signInWithGoogle()
			// Check if this is a new user to show onboarding
			if (result.isNewUser) {
				// You could redirect to onboarding flow here
				console.log('New user! Show onboarding')
			}
			router.replace(redirectTo)
		} catch (error) {
			console.error('Login failed:', error)
			setError(error instanceof Error ? error.message : 'Google sign-in failed')
		} finally {
			setSubmitting(false)
		}
	}

	async function handleEmailAuth(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)

		const normalizedEmail = email.trim().toLowerCase()
		if (!normalizedEmail || !password) {
			setError('Email and password are required')
			return
		}

		if (mode === 'signup') {
			if (!name.trim()) {
				setError('Name is required')
				return
			}
			if (password.length < 6) {
				setError('Password should be at least 6 characters')
				return
			}
			if (password !== confirmPassword) {
				setError('Password and confirm password do not match')
				return
			}
		}

		setSubmitting(true)
		try {
			if (mode === 'signup') {
				await signUpWithEmailAndPassword(normalizedEmail, password, name.trim())
			} else {
				await signInWithEmailAndPassword(normalizedEmail, password)
			}
			router.replace(redirectTo)
		} catch (error) {
			console.error('Email auth failed:', error)
			setError(error instanceof Error ? error.message : 'Authentication failed')
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">Loading...</div>
			</div>
		)
	}

	if (user) {
		return null // Will redirect via useEffect
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div
				className="w-full max-w-sm rounded-xl border border-default bg-card p-8 shadow-sm"
				style={{ maxWidth: '24rem', width: '100%' }}
			>
				<div className="text-center">
					<h1 className="text-2xl font-bold tracking-tight">
						Welcome to DevSnippets
					</h1>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Sign in to create, manage, and share code snippets
					</p>
				</div>

				<div className="mt-8">
					{error && (
						<div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/40 dark:text-red-300">
							{error}
						</div>
					)}

					<button
						onClick={handleGoogleLogin}
						disabled={submitting}
						className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-white dark:text-gray-800"
						style={{ width: '100%', maxWidth: '100%', minHeight: '44px' }}
					>
						<svg
							className="shrink-0"
							viewBox="0 0 24 24"
							width="20"
							height="20"
							style={{ width: '20px', height: '20px', display: 'block' }}
						>
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
						Sign in with Google
					</button>

					<div className="my-5 flex items-center gap-3">
						<div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
						<span className="text-xs text-gray-500">or with email</span>
						<div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
					</div>

					<div className="mb-3 flex rounded-md border border-default p-1">
						<button
							type="button"
							onClick={() => setMode('signin')}
							className={`flex-1 rounded-sm px-3 py-1.5 text-sm ${mode === 'signin' ? 'bg-foreground text-background' : 'text-gray-600 dark:text-gray-300'}`}
						>
							Sign In
						</button>
						<button
							type="button"
							onClick={() => setMode('signup')}
							className={`flex-1 rounded-sm px-3 py-1.5 text-sm ${mode === 'signup' ? 'bg-foreground text-background' : 'text-gray-600 dark:text-gray-300'}`}
						>
							Sign Up
						</button>
					</div>

					<form onSubmit={handleEmailAuth} className="space-y-3">
						{mode === 'signup' && (
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Full Name"
								autoComplete="name"
								className="w-full rounded-md border border-default bg-background px-3 py-2 text-sm"
								disabled={submitting}
								required
							/>
						)}
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Email"
							autoComplete="email"
							className="w-full rounded-md border border-default bg-background px-3 py-2 text-sm"
							disabled={submitting}
							required
						/>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Password"
							autoComplete={
								mode === 'signup' ? 'new-password' : 'current-password'
							}
							className="w-full rounded-md border border-default bg-background px-3 py-2 text-sm"
							disabled={submitting}
							required
						/>
						{mode === 'signup' && (
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Confirm Password"
								autoComplete="new-password"
								className="w-full rounded-md border border-default bg-background px-3 py-2 text-sm"
								disabled={submitting}
								required
							/>
						)}
						<button
							type="submit"
							disabled={submitting}
							className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
						>
							{submitting
								? 'Please wait...'
								: mode === 'signup'
									? 'Create Account'
									: 'Sign In with Email'}
						</button>
					</form>

					<p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
						By signing in, you agree to our{' '}
						<a
							href="/terms"
							className="underline hover:text-gray-700 dark:hover:text-gray-300"
						>
							Terms
						</a>{' '}
						and{' '}
						<a
							href="/privacy"
							className="underline hover:text-gray-700 dark:hover:text-gray-300"
						>
							Privacy Policy
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}
