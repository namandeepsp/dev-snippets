import Link from 'next/link'
import { HiOutlineHome } from 'react-icons/hi'
import { LuFileQuestion, LuSearch } from 'react-icons/lu'

export default function NotFound() {
	return (
		<div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-16">
			<div className="mx-auto max-w-md text-center">
				{/* Icon */}
				<div className="mb-6 flex justify-center">
					<div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6">
						<LuFileQuestion className="h-16 w-16 text-gray-400 dark:text-gray-600" />
					</div>
				</div>

				{/* Title */}
				<h1 className="mb-2 text-4xl font-bold">404</h1>
				<h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
					Page Not Found
				</h2>

				{/* Description */}
				<p className="mb-8 text-gray-600 dark:text-gray-400">
					The page you're looking for doesn't exist or you don't have permission
					to access it.
				</p>

				{/* Actions */}
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Link
						href="/"
						className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
					>
						<HiOutlineHome className="h-4 w-4" />
						Go Home
					</Link>
					<Link
						href="/snippets"
						className="inline-flex items-center justify-center gap-2 rounded-md border border-default px-6 py-3 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
					>
						<LuSearch className="h-4 w-4" />
						Browse Snippets
					</Link>
				</div>
			</div>
		</div>
	)
}
