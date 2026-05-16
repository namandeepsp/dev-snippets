import {
	LuCode,
	LuDownload,
	LuFileText,
	LuGitBranch,
	LuHistory,
	LuLock,
	LuSearch,
	LuShare2,
	LuStar,
	LuTag,
	LuUsers,
	LuZap,
} from 'react-icons/lu'

export type Feature = {
	id: string
	title: string
	description: string
	icon: typeof LuCode
	category: 'existing' | 'upcoming'
	requiresAuth: boolean
	details: string
	usageSteps: string[]
	actionLabel: string
	actionHref?: string
}

export const FEATURES: Feature[] = [
	// Existing Features
	{
		id: 'create-snippets',
		title: 'Create & Store Snippets',
		description:
			'Save your code snippets with syntax highlighting across multiple languages',
		icon: LuCode,
		category: 'existing',
		requiresAuth: true,
		details:
			'Create and store reusable code snippets with full syntax highlighting support. Organize your code by technology, category, and custom tags for easy retrieval.',
		usageSteps: [
			'Click "New Snippet" from the navigation',
			'Select your programming language',
			'Add title, description, and code',
			'Choose visibility (Private, Public, or Shared)',
			'Click "Create" to save',
		],
		actionLabel: 'Create Snippet',
		actionHref: '/snippets/new',
	},
	{
		id: 'share-snippets',
		title: 'Share with Team',
		description:
			'Share snippets with specific users or make them public for the community',
		icon: LuShare2,
		category: 'upcoming',
		requiresAuth: true,
		details:
			'Control who can access your snippets. Share privately with team members, make them public for the community, or keep them private for personal use.',
		usageSteps: [
			'Open a snippet you own',
			'Click the "Share" button',
			'Select sharing mode (Private, Public, or Shared)',
			'For shared mode, add user emails',
			'Save your sharing preferences',
		],
		actionLabel: 'View Snippets',
		actionHref: '/snippets',
	},
	{
		id: 'version-control',
		title: 'Version History',
		description:
			'Track changes with automatic versioning and restore previous versions',
		icon: LuHistory,
		category: 'existing',
		requiresAuth: true,
		details:
			'Every change to your snippet is automatically versioned. View the complete history of modifications and restore any previous version with a single click.',
		usageSteps: [
			'Open a snippet you own',
			'Click the "History" tab',
			'Browse through all versions',
			'Click "View" to see a specific version',
			'Click "Restore" to revert to that version',
		],
		actionLabel: 'Explore Snippets',
		actionHref: '/snippets',
	},
	{
		id: 'access-control',
		title: 'Access Control',
		description:
			'Fine-grained permissions for private, public, and shared snippets',
		icon: LuLock,
		category: 'existing',
		requiresAuth: true,
		details:
			'Manage access levels for your snippets. Keep sensitive code private, share with trusted team members, or contribute to the public library.',
		usageSteps: [
			'Create or edit a snippet',
			'Set visibility level during creation',
			'Modify permissions anytime from snippet details',
			'Add specific users for shared access',
			'Changes take effect immediately',
		],
		actionLabel: 'Create Snippet',
		actionHref: '/snippets/new',
	},
	{
		id: 'search-filter',
		title: 'Search & Filter',
		description:
			'Quickly find snippets by language, category, tags, or keywords',
		icon: LuSearch,
		category: 'existing',
		requiresAuth: false,
		details:
			'Powerful search and filtering capabilities help you find exactly what you need. Filter by programming language, category, tags, or search by keywords.',
		usageSteps: [
			'Go to the Snippets page',
			'Use the search bar to find by keyword',
			'Filter by programming language',
			'Filter by category or tags',
			'Combine multiple filters for precise results',
		],
		actionLabel: 'Browse Snippets',
		actionHref: '/snippets',
	},
	{
		id: 'organize-tags',
		title: 'Tags & Categories',
		description: 'Organize snippets with custom tags and predefined categories',
		icon: LuTag,
		category: 'existing',
		requiresAuth: true,
		details:
			'Use tags and categories to organize your snippets logically. Create custom tags for your workflow and use predefined categories for consistency.',
		usageSteps: [
			'When creating a snippet, add relevant tags',
			'Select a category that matches your code',
			'Use existing tags for consistency',
			'Create new tags as needed',
			'Filter snippets by tags later',
		],
		actionLabel: 'Create Snippet',
		actionHref: '/snippets/new',
	},
	{
		id: 'user-profiles',
		title: 'User Profiles',
		description:
			'View public profiles and discover snippets from other developers',
		icon: LuUsers,
		category: 'existing',
		requiresAuth: false,
		details:
			'Explore public profiles of other developers and discover their shared snippets. Build your reputation by sharing quality code with the community.',
		usageSteps: [
			'Click on any username in the app',
			'View their public profile',
			'Browse their shared snippets',
			'Follow their contributions',
			'Learn from community code',
		],
		actionLabel: 'Explore Community',
		actionHref: '/snippets',
	},
	{
		id: 'syntax-highlighting',
		title: 'Syntax Highlighting',
		description: 'Beautiful syntax highlighting for 20+ programming languages',
		icon: LuCode,
		category: 'existing',
		requiresAuth: false,
		details:
			'Enjoy beautiful, readable code with syntax highlighting for all major programming languages including Python, JavaScript, Java, Go, Rust, and more.',
		usageSteps: [
			'Browse any snippet',
			'Code is automatically highlighted',
			'Select language during creation',
			'Highlighting updates in real-time',
			'Copy highlighted code easily',
		],
		actionLabel: 'View Snippets',
		actionHref: '/snippets',
	},
	{
		id: 'dark-mode',
		title: 'Dark Mode',
		description: 'Comfortable dark theme for late-night coding sessions',
		icon: LuZap,
		category: 'existing',
		requiresAuth: false,
		details:
			'Switch between light and dark themes for comfortable viewing in any lighting condition. Your preference is saved automatically.',
		usageSteps: [
			'Click the theme toggle in the header',
			'Choose between light and dark mode',
			'Your preference is saved',
			'Applies across the entire app',
			'Switch anytime you want',
		],
		actionLabel: 'Get Started',
		actionHref: '/snippets',
	},

	{
		id: 'code-formatting',
		title: 'Auto Code Formatting',
		description: 'Automatically format code to match your preferred style',
		icon: LuFileText,
		category: 'existing',
		requiresAuth: true,
		details:
			'Automatically format your code snippets according to language-specific standards or your custom preferences. Supports multiple formatting styles.',
		usageSteps: [
			'Open a snippet',
			'Click "Format Code"',
			'Choose formatting style',
			'Review the formatted code',
			'Save if satisfied',
		],
		actionLabel: 'Create Snippet',
		actionHref: '/snippets/create',
	},
	{
		id: 'export-snippets',
		title: 'Export & Download',
		description:
			'Export snippets as files or copy to clipboard in various formats',
		icon: LuDownload,
		category: 'existing',
		requiresAuth: true,
		details:
			'Export your snippets in multiple formats (raw code, markdown, JSON) or download as individual files. Perfect for sharing and backup.',
		usageSteps: [
			'Open a snippet',
			'Click "Export"',
			'Choose export format',
			'Download or copy to clipboard',
			'Use in your projects',
		],
		actionLabel: 'Explore Snippets',
		actionHref: '/snippets',
	},
	{
		id: 'collections',
		title: 'Collections',
		description: 'Group related snippets into organized collections',
		icon: LuGitBranch,
		category: 'upcoming',
		requiresAuth: true,
		details:
			'Create collections to group related snippets together. Perfect for organizing snippets by project, topic, or technology stack.',
		usageSteps: [
			'Create a new collection',
			'Add snippets to the collection',
			'Organize by project or topic',
			'Share entire collections',
			'Reuse collections across projects',
		],
		actionLabel: 'Coming Soon',
	},
	{
		id: 'favorites',
		title: 'Favorites & Bookmarks',
		description: 'Save your favorite snippets for quick access',
		icon: LuStar,
		category: 'existing',
		requiresAuth: true,
		details:
			'Bookmark your favorite snippets from the community or your own collection. Access them instantly from your favorites list.',
		usageSteps: [
			'Click the star icon on any snippet',
			'View all favorites in your dashboard',
			'Quick access to frequently used code',
			'Organize favorites by category',
			'Share favorite collections',
		],
		actionLabel: 'Explore Snippets',
		actionHref: '/snippets',
	},
]
