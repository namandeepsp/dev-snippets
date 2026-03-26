'use client'

import { Button, Input } from '@/shared/ui/design-system'
import { cn } from '@/shared/utils/utils'
import { LockIcon, MailIcon, UserIcon } from './login-icons'

interface LoginFormProps {
	mode: 'signin' | 'signup'
	name: string
	email: string
	password: string
	confirmPassword: string
	submitting: boolean
	onNameChange: (value: string) => void
	onEmailChange: (value: string) => void
	onPasswordChange: (value: string) => void
	onConfirmPasswordChange: (value: string) => void
	onModeChange: (mode: 'signin' | 'signup') => void
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
	onGoogleClick: () => void
}

export function LoginForm({
	mode,
	name,
	email,
	password,
	confirmPassword,
	submitting,
	onNameChange,
	onEmailChange,
	onPasswordChange,
	onConfirmPasswordChange,
	onModeChange,
	onSubmit,
	onGoogleClick,
}: LoginFormProps) {
	return (
		<div className="space-y-5">
			<Button
				onClick={onGoogleClick}
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
						onClick={() => onModeChange('signin')}
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
						onClick={() => onModeChange('signup')}
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

			<form onSubmit={onSubmit} className="space-y-3">
				{mode === 'signup' && (
					<Input
						type="text"
						value={name}
						onChange={(e) => onNameChange(e.target.value)}
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
					onChange={(e) => onEmailChange(e.target.value)}
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
					onChange={(e) => onPasswordChange(e.target.value)}
					placeholder="Password"
					autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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
						onChange={(e) => onConfirmPasswordChange(e.target.value)}
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
	)
}
