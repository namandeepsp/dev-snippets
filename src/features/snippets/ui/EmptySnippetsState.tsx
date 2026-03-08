'use client'

import { useRequireAuth } from '@/shared/ui/AuthRequired'
import LogoIcon from '@/shared/ui/LogoIcon'
import { Button } from '@/shared/ui/design-system'
import Link from 'next/link'
import { LuPlus } from 'react-icons/lu'

type EmptySnippetsStateProps =
	| { variant: 'community' }
	| { variant: 'own-profile' }
	| { variant: 'other-profile' }

export function EmptySnippetsState(props: EmptySnippetsStateProps) {
	const { requireAuth, modal } = useRequireAuth()

	if (props.variant === 'community') {
		return (
			<>
				<div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 p-16 text-center">
					<div className="mb-6">
						<LogoIcon className="h-14 w-14" />
					</div>
					<h3 className="text-xl font-semibold mb-2">No snippets yet</h3>
					<p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
						Be the first to share a code snippet with the community!
					</p>
					<Button
						onClick={() =>
							requireAuth(() => {
								globalThis.location.href = '/snippets/new'
							})
						}
						size="md"
						leftIcon={<LuPlus className="h-4 w-4" />}
					>
						Create Snippet
					</Button>
				</div>
				{modal}
			</>
		)
	}

	if (props.variant === 'own-profile') {
		return (
			<div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 p-16 text-center">
				<div className="mb-6">
					<LogoIcon className="h-14 w-14" />
				</div>
				<h3 className="text-xl font-semibold mb-2">No snippets yet</h3>
				<p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
					Start building your code library by creating your first snippet!
				</p>
				<Link href="/snippets/new">
					<Button size="md">Create Your First Snippet</Button>
				</Link>
			</div>
		)
	}

	return (
		<div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
			<p className="text-gray-600 dark:text-gray-400">
				No public snippets yet.
			</p>
		</div>
	)
}
