'use client'

import { logout } from '@/features/auth/auth.client.container'
import { RequireAuth } from '@/features/auth/ui/RequireAuth'
import { useAuth } from '@/features/auth/ui/store/auth.store'
import { userApiClient } from '@/features/user/infra/client/user-api.factory'
import { Button, Skeleton } from '@/shared/ui/design-system'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function SettingsContent() {
	const { user } = useAuth()
	const router = useRouter()

	const [name, setName] = useState(user?.name || '')
	const [bio, setBio] = useState(user?.bio || '')
	const [initialName, setInitialName] = useState(user?.name || '')
	const [initialBio, setInitialBio] = useState(user?.bio || '')
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	useEffect(() => {
		if (!user) return

		const nextName = user.name || ''
		const nextBio = user.bio || ''
		setName(nextName)
		setBio(nextBio)
		setInitialName(nextName)
		setInitialBio(nextBio)
	}, [user?.id, user?.name, user?.bio])

	const normalizedName = name.trim()
	const normalizedBio = bio.trim()
	const hasProfileChanges =
		normalizedName !== initialName.trim() || normalizedBio !== initialBio.trim()

	async function handleSave() {
		if (!user || saving || !hasProfileChanges) return

		setSaving(true)
		setError(null)
		setSuccess(false)

		try {
			await userApiClient.updateProfile({
				name: normalizedName,
				bio: normalizedBio,
			})

			setName(normalizedName)
			setBio(normalizedBio)
			setInitialName(normalizedName)
			setInitialBio(normalizedBio)

			setSuccess(true)
			// Reset success message after 3 seconds
			setTimeout(() => setSuccess(false), 3000)
		} catch (error) {
			setError(
				error instanceof Error ? error.message : 'Failed to update profile',
			)
		} finally {
			setSaving(false)
		}
	}

	async function handleDeleteAccount() {
		if (
			!globalThis.confirm(
				'Are you sure you want to delete your account? This action cannot be undone.',
			)
		) {
			return
		}

		setSaving(true)
		setError(null)

		try {
			await userApiClient.deleteAccount()
			try {
				await logout()
			} catch {
				// Best effort: account is already deleted server-side.
			}
			router.replace('/')
		} catch (error) {
			setError(
				error instanceof Error ? error.message : 'Failed to delete account',
			)
			setSaving(false)
		}
	}

	async function handleLogout() {
		if (saving) return
		setSaving(true)
		setError(null)

		try {
			await logout()
			router.replace('/')
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Failed to logout')
			setSaving(false)
		}
	}

	return (
		<div className="mx-auto max-w-2xl px-4 py-8">
			<h1 className="mb-6 text-3xl font-bold">Settings</h1>

			{error && (
				<div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-400">
					{error}
				</div>
			)}

			{success && (
				<div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/50 dark:text-green-400">
					Profile updated successfully!
				</div>
			)}

			<div className="space-y-6">
				{/* Profile Information */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">Profile Information</h2>

					<div>
						<label htmlFor="name" className="block mb-1 font-medium">
							Display Name
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full rounded-md border border-default bg-background px-3 py-2"
							placeholder="Your name"
							disabled={saving}
						/>
					</div>

					<div>
						<label htmlFor="bio" className="block mb-1 font-medium">
							Bio
						</label>
						<textarea
							id="bio"
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							className="w-full rounded-md border border-default bg-background px-3 py-2"
							rows={4}
							placeholder="Tell us about yourself"
							disabled={saving}
						/>
					</div>

					<Button
						onClick={handleSave}
						disabled={saving || !hasProfileChanges}
						variant="ghost"
						className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 disabled:opacity-50"
					>
						{saving ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>

				{/* Account Information */}
				<div className="space-y-4 border-t pt-6">
					<h2 className="text-xl font-semibold">Account Information</h2>

					<div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900">
						<dl className="space-y-2">
							<div className="flex justify-between">
								<dt className="font-medium text-gray-600 dark:text-gray-400">
									Email
								</dt>
								<dd>{user?.email}</dd>
							</div>
							<div className="flex justify-between">
								<dt className="font-medium text-gray-600 dark:text-gray-400">
									Username
								</dt>
								<dd>@{user?.email?.split('@')[0]}</dd>
							</div>
							<div className="flex justify-between">
								<dt className="font-medium text-gray-600 dark:text-gray-400">
									Member since
								</dt>
								<dd>
									{user?.createdAt
										? new Date(user.createdAt).toLocaleDateString()
										: 'N/A'}
								</dd>
							</div>
						</dl>
					</div>

					<div className="flex items-center justify-between rounded-md border border-default p-4">
						<div>
							<h3 className="font-medium">Session</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Sign out from your current device
							</p>
						</div>
						<Button
							onClick={handleLogout}
							disabled={saving}
							variant="ghost"
							className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
						>
							Logout
						</Button>
					</div>
				</div>

				{/* Danger Zone */}
				<div className="space-y-4 border-t pt-6">
					<h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
						Danger Zone
					</h2>

					<div className="rounded-md border border-red-200 p-4 dark:border-red-900">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="font-medium">Delete Account</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Permanently delete your account and all your snippets
								</p>
							</div>
							<Button
								onClick={handleDeleteAccount}
								disabled={saving}
								variant="ghost"
								className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
							>
								Delete Account
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function SettingsPageSkeleton() {
	return (
		<div className="mx-auto max-w-2xl px-4 py-8">
			<Skeleton className="mb-6 h-10 w-36" />

			<div className="space-y-6">
				<div className="space-y-4">
					<Skeleton className="h-7 w-44" />
					<div>
						<Skeleton className="mb-2 h-4 w-28" />
						<Skeleton className="h-10 w-full rounded-md" />
					</div>
					<div>
						<Skeleton className="mb-2 h-4 w-14" />
						<Skeleton className="h-28 w-full rounded-md" />
					</div>
					<Skeleton className="h-10 w-36 rounded-md" />
				</div>

				<div className="space-y-4 border-t pt-6">
					<Skeleton className="h-7 w-48" />
					<Skeleton className="h-32 w-full rounded-md" />
					<div className="flex items-center justify-between rounded-md border border-default p-4">
						<div className="space-y-2">
							<Skeleton className="h-5 w-20" />
							<Skeleton className="h-4 w-52" />
						</div>
						<Skeleton className="h-10 w-24 rounded-md" />
					</div>
				</div>

				<div className="space-y-4 border-t pt-6">
					<Skeleton className="h-7 w-28" />
					<div className="rounded-md border border-red-200 p-4 dark:border-red-900">
						<div className="flex items-center justify-between">
							<div className="space-y-2">
								<Skeleton className="h-5 w-30" />
								<Skeleton className="h-4 w-64 max-w-full" />
							</div>
							<Skeleton className="h-10 w-32 rounded-md" />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default function SettingsPage() {
	return (
		<RequireAuth fallback={<SettingsPageSkeleton />}>
			<SettingsContent />
		</RequireAuth>
	)
}
