import { fileURLToPath } from 'node:url'
import type { FirestoreSnippet } from '../../src/features/snippets/core/snippet.types'
import { adminDb } from '../../src/services/firebase/firebase.server'
import { BaseScript } from '../core/base.script'
import { ensureFixtureUsers } from '../core/test-users'
import { BROWSER_EXTENSION_SNIPPET_TEMPLATES } from '../data/browserExtensionSnippets.templates'
import { CSS_SNIPPET_TEMPLATES } from '../data/cssSnippets.templates'
import { expressSnippets } from '../data/expressSnippets.templates'
import { GO_SNIPPET_TEMPLATES } from '../data/goSnippets.templates'
import { HTML_SNIPPET_TEMPLATES } from '../data/htmlSnippets.templates'
import { JAVA_SNIPPET_TEMPLATES } from '../data/javaSnippets.templates'
import { JS_SNIPPET_TEMPLATES } from '../data/jsSnippets.templates'
import { PYTHON_SNIPPET_TEMPLATES } from '../data/pythonSnippets.templates'
import { REACT_SNIPPET_TEMPLATES } from '../data/reactSnippets.templates'
import { SQL_SNIPPET_TEMPLATES } from '../data/sqlSnippets.templates'
import { TS_SNIPPET_TEMPLATES } from '../data/tsSnippets.templates'

const DEFAULT_SEED_SNIPPET_COUNT = -1

type SeedOwner = {
	id: string
	name: string
}

type SnippetTemplate = Pick<
	FirestoreSnippet,
	| 'title'
	| 'description'
	| 'files'
	| 'primaryLanguage'
	| 'technologies'
	| 'categories'
>

const ALL_SNIPPET_TEMPLATES: SnippetTemplate[] = [
	...JS_SNIPPET_TEMPLATES,
	...TS_SNIPPET_TEMPLATES,
	...GO_SNIPPET_TEMPLATES,
	...PYTHON_SNIPPET_TEMPLATES,
	...JAVA_SNIPPET_TEMPLATES,
	...HTML_SNIPPET_TEMPLATES,
	...CSS_SNIPPET_TEMPLATES,
	...SQL_SNIPPET_TEMPLATES,
	...BROWSER_EXTENSION_SNIPPET_TEMPLATES,
	...expressSnippets,
	...REACT_SNIPPET_TEMPLATES,
]

const USEFUL_SNIPPET_TEMPLATES: SnippetTemplate[] = ALL_SNIPPET_TEMPLATES
const FIRESTORE_BATCH_LIMIT = 400

export class SeedScript extends BaseScript {
	name = 'Seed Data'
	constructor(private readonly seedCountOverride?: number) {
		super()
	}

	async run(): Promise<void> {
		await this.ensureReady()
		this.log('Seeding snippets...')

		const users = await ensureFixtureUsers()
		const owners: SeedOwner[] = users.map((user) => ({
			id: user.id,
			name: user.name,
		}))

		this.log(
			`Found ${owners.length} users: ${owners.map((o) => o.name).join(', ')}`,
		)

		const snippets = this.getSampleSnippets(this.getSeedCount(), owners)

		const shuffledSnippets = this.shuffleArray(snippets)
		await this.writeSnippetsInBatches(shuffledSnippets)

		this.logSuccess(
			`Seeded ${shuffledSnippets.length} snippets across ${owners.length} users`,
		)
	}

	private getSeedCount(): number {
		if (
			Number.isInteger(this.seedCountOverride) &&
			(this.seedCountOverride as number) > 0
		) {
			return this.seedCountOverride as number
		}

		const parsed = Number(process.env.SEED_SNIPPET_COUNT)
		if (Number.isInteger(parsed) && parsed > 0) {
			return parsed
		}
		return DEFAULT_SEED_SNIPPET_COUNT
	}

	private shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array]
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
		}
		return shuffled
	}

	private async writeSnippetsInBatches(
		snippets: Omit<FirestoreSnippet, 'id'>[],
	): Promise<void> {
		for (
			let index = 0;
			index < snippets.length;
			index += FIRESTORE_BATCH_LIMIT
		) {
			const batch = adminDb.batch()
			const chunk = snippets.slice(index, index + FIRESTORE_BATCH_LIMIT)

			for (const snippet of chunk) {
				const ref = adminDb.collection('snippets').doc()
				batch.set(ref, snippet)
			}

			await batch.commit()
		}
	}

	private getSampleSnippets(
		count: number,
		owners: SeedOwner[],
	): Omit<FirestoreSnippet, 'id'>[] {
		const now = Date.now()
		const totalTemplates = USEFUL_SNIPPET_TEMPLATES.length
		const snippets: Omit<FirestoreSnippet, 'id'>[] = []

		const actualCount =
			count === -1 ? totalTemplates : Math.min(count, totalTemplates)

		for (let index = 0; index < actualCount; index++) {
			const template = USEFUL_SNIPPET_TEMPLATES[index]
			const owner = owners[index % owners.length]
			const createdAt = now - index * 60_000

			const cyclePosition = index % 20
			const privateCount = Math.floor(Math.random() * 4) + 2
			const isPrivate = cyclePosition >= 20 - privateCount
			const visibility = isPrivate ? 'private' : 'public'

			snippets.push({
				title: template.title,
				description: template.description,
				files: template.files,
				primaryLanguage: template.primaryLanguage,
				technologies: template.technologies,
				categories: template.categories,
				visibility,
				ownerId: owner.id,
				ownerName: owner.name,
				likesCount: 0,
				viewsCount: 0,
				isDeleted: false,
				versions: [
					{
						version: 1,
						files: template.files,
						createdAt,
						createdBy: owner.id,
					},
				],
				createdAt,
				updatedAt: createdAt,
			})
		}

		return snippets
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	new SeedScript().run().catch((error) => {
		console.error(error)
		process.exit(1)
	})
}
