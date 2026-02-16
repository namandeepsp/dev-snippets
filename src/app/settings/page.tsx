'use client'

import { RequireAuth } from '@/features/auth/ui/RequireAuth'
import { useAuth } from '@/features/auth/ui/store/auth.store'
import { userApiClient } from '@/features/user/infra/client/user-api.factory'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function SettingsContent() {
	const { user } = useAuth()
	const router = useRouter()

	const [name, setName] = useState(user?.name || '')
	const [bio, setBio] = useState(user?.bio || '')
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	async function handleSave() {
		if (!user || saving) return

		setSaving(true)
		setError(null)
		setSuccess(false)

		try {
			await userApiClient.updateProfile({
				name: name.trim(),
				bio: bio.trim(),
			})

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
			!confirm(
				'Are you sure you want to delete your account? This action cannot be undone.',
			)
		) {
			return
		}

		setSaving(true)
		setError(null)

		try {
			await userApiClient.deleteAccount()
			router.push('/')
		} catch (error) {
			setError(
				error instanceof Error ? error.message : 'Failed to delete account',
			)
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

					<button
						onClick={handleSave}
						disabled={saving || (!name.trim() && !bio.trim())}
						className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
					>
						{saving ? 'Saving...' : 'Save Changes'}
					</button>
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
							<button
								onClick={handleDeleteAccount}
								disabled={saving}
								className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
							>
								Delete Account
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default function SettingsPage() {
	return (
		<RequireAuth>
			<SettingsContent />
		</RequireAuth>
	)
}
