'use client'

import { Button } from '@/shared/ui/design-system'
import { formatDate } from '@/shared/utils/date'
import { useState } from 'react'
import { LuX } from 'react-icons/lu'
import type { SnippetVersion } from '../core/snippet.types'
import { CodeBlock } from './code/CodeBlock'

interface VersionHistoryModalProps {
	isOpen: boolean
	onClose: () => void
	versions: SnippetVersion[]
	authorName: string
	ownerId: string
	snippetId: string
	snippetTitle: string
	snippetDescription?: string
	visibility: 'public' | 'private' | 'shared'
	onRestore?: (versionNumber: number) => Promise<void>
}

export function VersionHistoryModal({
	isOpen,
	onClose,
	versions,
	authorName,
	ownerId,
	snippetId,
	snippetTitle,
	snippetDescription,
	visibility,
	onRestore,
}: VersionHistoryModalProps) {
	const [selectedVersion, setSelectedVersion] = useState<number>(
		versions[versions.length - 1]?.version || 1,
	)
	const [isRestoring, setIsRestoring] = useState(false)

	if (!isOpen) return null

	const currentVersion = versions.find((v) => v.version === selectedVersion)
	if (!currentVersion) return null

	const handleRestore = async () => {
		if (!onRestore) return

		setIsRestoring(true)
		try {
			await onRestore(selectedVersion)
			onClose()
		} finally {
			setIsRestoring(false)
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-4xl h-[90vh] rounded-lg bg-white dark:bg-gray-900 shadow-lg flex flex-col">
				{/* Fixed Header */}
				<div className="flex items-center justify-between border-b border-default bg-white dark:bg-gray-900 px-6 py-4 shrink-0">
					<h2 className="text-lg font-semibold">Version History</h2>
					<Button
						variant="ghost"
						onClick={onClose}
						className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
						aria-label="Close"
					>
						<LuX className="h-5 w-5" />
					</Button>
				</div>

				{/* Scrollable Content */}
				<div className="p-6 space-y-6 overflow-y-auto flex-1">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Select Version
						</label>
						<select
							value={selectedVersion}
							onChange={(e) => setSelectedVersion(Number(e.target.value))}
							className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
						>
							{versions
								.slice()
								.reverse()
								.map((version) => (
									<option key={version.version} value={version.version}>
										v{version.version} - {formatDate(version.createdAt)} by{' '}
										{version.createdBy === ownerId ? authorName : 'User'}
									</option>
								))}
						</select>
					</div>

					<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Version {currentVersion.version}
							</span>
							<span className="text-xs text-gray-500">
								{formatDate(currentVersion.createdAt)}
							</span>
						</div>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Created by{' '}
							{currentVersion.createdBy === ownerId ? authorName : 'User'}
						</p>
					</div>

					<div className="space-y-3">
						<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Code
						</h3>
						{!currentVersion.files || currentVersion.files.length === 0 ? (
							<div className="flex items-center justify-center py-8 text-gray-500">
								No files in this version
							</div>
						) : currentVersion.files && currentVersion.files.length > 0 ? (
							<div className="space-y-4">
								{currentVersion.files.map((file, index) => (
									<div key={file.id} className="space-y-2">
										{currentVersion.files.length > 1 && (
											<div className="flex items-center justify-between px-1">
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
														{file.filename}
													</span>
													<span className="text-xs font-medium text-gray-400">
														{file.language}
													</span>
												</div>
												<span className="text-xs text-gray-400">
													{index + 1} of {currentVersion.files.length}
												</span>
											</div>
										)}
										<CodeBlock
											code={file.code}
											language={file.language}
											filename={file.filename}
											showLineNumbers
											snippetId={snippetId}
											snippetTitle={snippetTitle}
											snippetDescription={snippetDescription}
											visibility={visibility}
										/>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-gray-500">
								No code available for this version
							</div>
						)}
					</div>
				</div>

				{/* Fixed Footer */}
				<div className="flex items-center justify-end gap-3 border-t border-default px-6 py-4 bg-white dark:bg-gray-900 shrink-0">
					<Button
						type="button"
						variant="ghost"
						onClick={onClose}
						disabled={isRestoring}
					>
						Close
					</Button>
					{selectedVersion !== versions[versions.length - 1]?.version && (
						<Button
							type="button"
							onClick={handleRestore}
							disabled={isRestoring}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							{isRestoring ? 'Restoring...' : 'Restore This Version'}
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
