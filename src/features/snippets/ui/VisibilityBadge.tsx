'use client'

interface VisibilityBadgeProps {
	visibility: 'public' | 'private' | 'shared'
}

export function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
	const styles = {
		public: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		private: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
		shared: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
	}

	return (
		<span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[visibility]}`}>
			{visibility}
		</span>
	)
}
