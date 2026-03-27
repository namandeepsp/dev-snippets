import { getCurrentServerUser } from '@/features/auth/auth.server.container'
import { snippetService } from '@/features/snippets/snippet.server.container'
import { userService } from '@/features/user/user.container'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProfileSnippetsSection } from './ProfileSnippetsSection'

type Props = {
	params: Promise<{
		username: string
	}>
}

const PROFILE_PAGE_SIZE = 6

/**
 * ============================================================================
 * PROFILE PAGE
 * ============================================================================
 *
 * Server Component that displays a user's public profile and their snippets.
 *
 * Why Server Component?
 * - Public data - No client state needed
 * - SEO - Profile pages should be indexable
 * - Performance - Direct database access, no API round trip
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { username } = await params
	const user = await userService.getPublicProfile(username)

	if (!user) {
		return {
			title: 'User Not Found - DevSnippets',
		}
	}

	return {
		title: `${user.name} (@${user.username}) - DevSnippets`,
		description: user.bio || `View ${user.name}'s code snippets on DevSnippets`,
		alternates: {
			canonical: `/profile/${user.username}`,
		},
		openGraph: {
			title: `${user.name} (@${user.username})`,
			description: user.bio || `Code snippets by ${user.name}`,
			...(user.avatarUrl && {
				images: [{ url: user.avatarUrl }],
			}),
		},
	}
}

export default async function ProfilePage({ params }: Props) {
	const { username } = await params

	let currentUser = null
	try {
		currentUser = await getCurrentServerUser()
	} catch {
		// Continue as guest when session is invalid/missing
		console.warn('No valid session found, rendering profile as guest')
	}

	const user = await userService.getPublicProfile(username)
	if (!user) {
		notFound()
	}

	const isOwnProfile = currentUser?.id === user.id
	const initialPage = await snippetService.listByUserPaginated(
		user.id,
		isOwnProfile ? undefined : 'public',
		PROFILE_PAGE_SIZE,
		null,
	)
	const joinDate = new Date(user.createdAt).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'long',
	})

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			{/* Profile Header */}
			<div className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
				{/* Avatar */}
				<div className="shrink-0">
					{user.avatarUrl ? (
						<img
							src={user.avatarUrl}
							alt={user.name}
							className="h-24 w-24 rounded-full border-2 border-default object-cover"
						/>
					) : (
						<div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-default flex items-center justify-center">
							<span className="text-3xl font-medium text-gray-600 dark:text-gray-400">
								{user.name.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
				</div>

				{/* Profile Info */}
				<div className="flex-1">
					<div className="flex flex-col gap-2">
						<h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
						<p className="text-lg text-gray-600 dark:text-gray-400">
							@{user.username}
						</p>
						{user.bio && (
							<p className="mt-2 max-w-2xl text-gray-700 dark:text-gray-300">
								{user.bio}
							</p>
						)}
					</div>

					{/* Stats */}
					<div className="mt-4 flex gap-6">
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Joined
							</span>
							<span className="text-sm">{joinDate}</span>
						</div>
					</div>
				</div>
			</div>

			{/* User's Snippets */}
			<div>
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-2xl font-bold tracking-tight">Snippets</h2>
				</div>

				<ProfileSnippetsSection
					username={username}
					isOwnProfile={isOwnProfile}
					initialSnippets={initialPage.items}
					initialCursor={initialPage.nextCursor}
					pageSize={PROFILE_PAGE_SIZE}
				/>
			</div>
		</div>
	)
}
