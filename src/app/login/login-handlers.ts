import {
	signInWithEmailAndPassword,
	signInWithGoogle,
	signUpWithEmailAndPassword,
} from '@/features/auth/auth.client.container'
import { logger } from '@/shared/utils/logger'
import { toast } from '@/shared/ui/design-system'

export async function handleGoogleLogin(
	onSuccess: () => Promise<void>,
	onError: () => void,
): Promise<void> {
	try {
		const result = await signInWithGoogle()
		if (result.isNewUser) {
			toast.success('Welcome to DevSnippets!')
		} else {
			toast.success('Welcome back!')
		}
		await onSuccess()
	} catch (error) {
		logger.error('Login failed', error)
		const message =
			error instanceof Error ? error.message : 'Google sign-in failed'
		toast.error(message)
		onError()
	}
}

export async function handleEmailSignIn(
	email: string,
	password: string,
	onSuccess: () => Promise<void>,
	onError: () => void,
): Promise<void> {
	try {
		await signInWithEmailAndPassword(email.trim().toLowerCase(), password)
		toast.success('Welcome back!')
		await onSuccess()
	} catch (error) {
		logger.error('Email auth failed', error)
		const message =
			error instanceof Error ? error.message : 'Authentication failed'
		toast.error(message)
		onError()
	}
}

export async function handleEmailSignUp(
	email: string,
	password: string,
	name: string,
	onSuccess: () => Promise<void>,
	onError: () => void,
): Promise<void> {
	try {
		await signUpWithEmailAndPassword(
			email.trim().toLowerCase(),
			password,
			name.trim(),
		)
		toast.success('Account created successfully!')
		await onSuccess()
	} catch (error) {
		logger.error('Email auth failed', error)
		const message =
			error instanceof Error ? error.message : 'Authentication failed'
		toast.error(message)
		onError()
	}
}
