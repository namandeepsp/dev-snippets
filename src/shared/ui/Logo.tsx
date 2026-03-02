import Link from 'next/link'
import LogoIcon from './LogoIcon'

const Logo = () => {
	return (
		<Link
			href="/"
			className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition"
		>
			<LogoIcon />
			DevSnippets
		</Link>
	)
}

export default Logo
