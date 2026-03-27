'use client'

import { useAuth } from '@/features/auth/auth.client.container'
import LogoIcon from '@/shared/ui/LogoIcon'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { Card, CardBody } from '@/shared/ui/design-system'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { LoginForm } from './LoginForm'
import {
	handleEmailSignIn,
	handleEmailSignUp,
	handleGoogleLogin,
} from './login-handlers'
import { validateSignInForm, validateSignUpForm } from './login-validation'

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

	async function handleGoogleClick() {
		setSubmitting(true)
		try {
			await handleGoogleLogin(
				async () => {
					await refresh()
					router.replace(redirectTo)
				},
				() => setSubmitting(false),
			)
		} finally {
			setSubmitting(false)
		}
	}

	async function handleEmailAuth(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		const isValid =
			mode === 'signup'
				? validateSignUpForm(email, password, confirmPassword, name)
				: validateSignInForm(email, password)

		if (!isValid) return

		setSubmitting(true)
		try {
			if (mode === 'signup') {
				await handleEmailSignUp(
					email,
					password,
					name,
					async () => {
						await refresh()
						router.replace(redirectTo)
					},
					() => {},
				)
			} else {
				await handleEmailSignIn(
					email,
					password,
					async () => {
						await refresh()
						router.replace(redirectTo)
					},
					() => {},
				)
			}
		} finally {
			setSubmitting(false)
		}
	}

	if (loading || user) {
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
						<div className="mx-auto mb-4 flex justify-center">
							<LogoIcon className="h-14 w-14" />
						</div>
						<h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
							Welcome to DevSnippets
						</h2>
						<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
							Your code, organized and accessible
						</p>
					</div>

					<LoginForm
						mode={mode}
						name={name}
						email={email}
						password={password}
						confirmPassword={confirmPassword}
						submitting={submitting}
						onNameChange={setName}
						onEmailChange={setEmail}
						onPasswordChange={setPassword}
						onConfirmPasswordChange={setConfirmPassword}
						onModeChange={setMode}
						onSubmit={handleEmailAuth}
						onGoogleClick={handleGoogleClick}
					/>
				</CardBody>
			</Card>
		</div>
	)
}

export function LoginPageClient() {
	return (
		<div className="relative overflow-hidden px-4 py-8 sm:py-12">
			<div className="fixed right-4 top-4 z-50">
				<ThemeToggle />
			</div>
			<div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-cyan-300/35 blur-3xl dark:bg-cyan-800/30" />
			<div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-900/30" />
			<Suspense fallback={null}>
				<LoginContent />
			</Suspense>
		</div>
	)
}
