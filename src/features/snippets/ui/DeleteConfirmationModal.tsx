'use client'

import { Button } from '@/shared/ui/design-system'

interface DeleteConfirmationModalProps {
	isOpen: boolean
	snippetTitle: string
	isDeleting: boolean
	onConfirm: () => void
	onCancel: () => void
}

export function DeleteConfirmationModal({
	isOpen,
	snippetTitle,
	isDeleting,
	onConfirm,
	onCancel,
}: DeleteConfirmationModalProps) {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
				<h3 className="text-lg font-semibold mb-2">Delete Snippet</h3>
				<p className="text-gray-600 dark:text-gray-400 mb-6">
					Are you sure you want to delete "{snippetTitle}"? This action cannot
					be undone.
				</p>
				<div className="flex justify-end gap-3">
					<Button
						onClick={onCancel}
						variant="ghost"
						className="rounded-md border border-default px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
					>
						Cancel
					</Button>
					<Button
						onClick={onConfirm}
						disabled={isDeleting}
						variant="ghost"
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
					>
						{isDeleting ? 'Deleting...' : 'Delete'}
					</Button>
				</div>
			</div>
		</div>
	)
}
