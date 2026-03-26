import { toast } from '@/shared/ui/design-system'

export function validateSignInForm(email: string, password: string): boolean {
	const normalizedEmail = email.trim().toLowerCase()
	if (!normalizedEmail || !password) {
		toast.error('Email and password are required')
		return false
	}
	return true
}

export function validateSignUpForm(
	email: string,
	password: string,
	confirmPassword: string,
	name: string,
): boolean {
	const normalizedEmail = email.trim().toLowerCase()
	if (!normalizedEmail || !password) {
		toast.error('Email and password are required')
		return false
	}
	if (!name.trim()) {
		toast.error('Name is required')
		return false
	}
	if (password.length < 6) {
		toast.error('Password should be at least 6 characters')
		return false
	}
	if (password !== confirmPassword) {
		toast.error('Password and confirm password do not match')
		return false
	}
	return true
}
