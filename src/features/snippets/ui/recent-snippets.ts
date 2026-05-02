export type RecentSnippet = {
	id: string
	title: string
	primaryLanguage: string
	ownerName: string
	viewedAt: number
}

const RECENT_SNIPPETS_KEY = 'devsnippets:recent-snippets'
const MAX_RECENT_SNIPPETS = 6

function readRecentSnippets(): RecentSnippet[] {
	if (!globalThis.localStorage) return []

	try {
		const raw = globalThis.localStorage.getItem(RECENT_SNIPPETS_KEY)
		if (!raw) return []

		const parsed = JSON.parse(raw)
		if (!Array.isArray(parsed)) return []

		return parsed.filter(
			(item): item is RecentSnippet =>
				typeof item?.id === 'string' &&
				typeof item?.title === 'string' &&
				typeof item?.primaryLanguage === 'string' &&
				typeof item?.ownerName === 'string' &&
				typeof item?.viewedAt === 'number',
		)
	} catch {
		return []
	}
}

export function getRecentSnippets(): RecentSnippet[] {
	return readRecentSnippets()
}

export function removeRecentSnippet(snippetId: string): void {
	if (!globalThis.localStorage) return

	const next = readRecentSnippets().filter((item) => item.id !== snippetId)
	globalThis.localStorage.setItem(RECENT_SNIPPETS_KEY, JSON.stringify(next))
}

export function clearRecentSnippets(): void {
	if (!globalThis.localStorage) return
	globalThis.localStorage.removeItem(RECENT_SNIPPETS_KEY)
}

export function saveRecentSnippet(
	snippet: Omit<RecentSnippet, 'viewedAt'>,
): void {
	if (!globalThis.localStorage) return

	const existing = readRecentSnippets().filter((item) => item.id !== snippet.id)
	const next: RecentSnippet[] = [
		{
			...snippet,
			viewedAt: Date.now(),
		},
		...existing,
	].slice(0, MAX_RECENT_SNIPPETS)

	globalThis.localStorage.setItem(RECENT_SNIPPETS_KEY, JSON.stringify(next))
}
