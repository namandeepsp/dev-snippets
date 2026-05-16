#!/usr/bin/env tsx
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

interface OldSnippet {
	id: string
	code: string
	language: string
	title: string
	description?: string
	technologies: string[]
	categories: string[]
	visibility: string
	ownerId: string
	ownerName: string
	likesCount: number
	viewsCount: number
	createdAt: number
	updatedAt: number
	isDeleted?: boolean
	sharedWith?: string[]
	versions: Array<{
		version: number
		code: string
		createdAt: number
		createdBy: string
	}>
}

interface SnippetFile {
	id: string
	filename: string
	language: string
	code: string
	order: number
	createdAt: number
	updatedAt: number
}

interface NewSnippet {
	id: string
	files: SnippetFile[]
	primaryLanguage: string
	title: string
	description?: string
	technologies: string[]
	categories: string[]
	visibility: string
	ownerId: string
	ownerName: string
	likesCount: number
	viewsCount: number
	createdAt: number
	updatedAt: number
	isDeleted?: boolean
	sharedWith?: string[]
	versions: Array<{
		version: number
		files: SnippetFile[]
		createdAt: number
		createdBy: string
	}>
}

// Initialize Firebase Admin
function initializeFirebase() {
	const firebaseConfig = {
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
	}

	if (
		!firebaseConfig.projectId ||
		!firebaseConfig.clientEmail ||
		!firebaseConfig.privateKey
	) {
		throw new Error(
			'Missing Firebase credentials. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in environment.',
		)
	}

	initializeApp({
		credential: cert(firebaseConfig as any),
	})

	return getFirestore()
}

// Convert old snippet to new format
function convertSnippet(oldSnippet: OldSnippet): NewSnippet {
	// Create file from old code
	const file: SnippetFile = {
		id: 'file-1',
		filename: `index.${getFileExtension(oldSnippet.language)}`,
		language: oldSnippet.language,
		code: oldSnippet.code,
		order: 1,
		createdAt: oldSnippet.createdAt,
		updatedAt: oldSnippet.updatedAt,
	}

	// Convert versions
	const newVersions = oldSnippet.versions.map((version) => ({
		version: version.version,
		files: [
			{
				id: 'file-1',
				filename: `index.${getFileExtension(oldSnippet.language)}`,
				language: oldSnippet.language,
				code: version.code,
				order: 1,
				createdAt: version.createdAt,
				updatedAt: version.createdAt,
			},
		],
		createdAt: version.createdAt,
		createdBy: version.createdBy,
	}))

	const newSnippet: NewSnippet = {
		id: oldSnippet.id,
		files: [file],
		primaryLanguage: oldSnippet.language,
		title: oldSnippet.title,
		description: oldSnippet.description,
		technologies: oldSnippet.technologies,
		categories: oldSnippet.categories,
		visibility: oldSnippet.visibility,
		ownerId: oldSnippet.ownerId,
		ownerName: oldSnippet.ownerName,
		likesCount: oldSnippet.likesCount,
		viewsCount: oldSnippet.viewsCount,
		createdAt: oldSnippet.createdAt,
		updatedAt: oldSnippet.updatedAt,
		isDeleted: oldSnippet.isDeleted,
		sharedWith: oldSnippet.sharedWith,
		versions: newVersions,
	}

	// Remove undefined fields to avoid Firestore errors
	Object.keys(newSnippet).forEach(
		(key) =>
			newSnippet[key as keyof NewSnippet] === undefined &&
			delete newSnippet[key as keyof NewSnippet],
	)

	return newSnippet
}

// Get file extension based on language
function getFileExtension(language: string): string {
	const extensions: Record<string, string> = {
		javascript: 'js',
		typescript: 'ts',
		jsx: 'jsx',
		tsx: 'tsx',
		python: 'py',
		java: 'java',
		csharp: 'cs',
		cpp: 'cpp',
		c: 'c',
		go: 'go',
		rust: 'rs',
		ruby: 'rb',
		php: 'php',
		sql: 'sql',
		html: 'html',
		css: 'css',
		json: 'json',
		yaml: 'yaml',
		markdown: 'md',
		bash: 'sh',
		shell: 'sh',
	}

	return extensions[language] || 'txt'
}

// Main migration function
async function migrate() {
	console.log('🚀 Starting snippet migration to multi-file format...\n')

	const db = initializeFirebase()
	const snippetsRef = db.collection('snippets')

	try {
		// Get all snippets
		const snapshot = await snippetsRef.get()
		const totalSnippets = snapshot.size

		if (totalSnippets === 0) {
			console.log('✅ No snippets to migrate. Database is empty.')
			return
		}

		console.log(`📊 Found ${totalSnippets} snippets to migrate\n`)

		let migratedCount = 0
		let errorCount = 0
		const errors: Array<{ id: string; error: string }> = []

		// Migrate each snippet
		for (const doc of snapshot.docs) {
			try {
				const oldSnippet = { id: doc.id, ...doc.data() } as OldSnippet
				const newSnippet = convertSnippet(oldSnippet)

				// Update document
				await snippetsRef.doc(doc.id).set(newSnippet)

				migratedCount++
				console.log(`✅ Migrated: ${oldSnippet.title} (${doc.id})`)
			} catch (error) {
				errorCount++
				const errorMessage =
					error instanceof Error ? error.message : String(error)
				errors.push({ id: doc.id, error: errorMessage })
				console.error(`❌ Error migrating ${doc.id}: ${errorMessage}`)
			}
		}

		// Summary
		console.log('\n' + '='.repeat(60))
		console.log('📈 Migration Summary')
		console.log('='.repeat(60))
		console.log(`Total snippets: ${totalSnippets}`)
		console.log(`✅ Successfully migrated: ${migratedCount}`)
		console.log(`❌ Failed: ${errorCount}`)

		if (errors.length > 0) {
			console.log('\n⚠️  Errors:')
			errors.forEach(({ id, error }) => {
				console.log(`  - ${id}: ${error}`)
			})
		}

		if (errorCount === 0) {
			console.log('\n🎉 Migration completed successfully!')
		} else {
			console.log(
				`\n⚠️  Migration completed with ${errorCount} error(s). Please review above.`,
			)
			process.exit(1)
		}
	} catch (error) {
		console.error('❌ Migration failed:', error)
		process.exit(1)
	}
}

// Run migration
migrate()
