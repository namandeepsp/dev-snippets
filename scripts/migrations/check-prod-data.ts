#!/usr/bin/env tsx
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin with prod credentials from .env.prod
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
	console.error('❌ Missing Firebase credentials in .env.prod')
	process.exit(1)
}

initializeApp({
	credential: cert(firebaseConfig as any),
})

const db = getFirestore()

async function checkData() {
	console.log(`\n🔍 Checking production Firebase database...\n`)
	console.log(`Project: ${firebaseConfig.projectId}\n`)

	try {
		// Check snippets collection
		const snippetsRef = db.collection('snippets')
		const snippetsSnapshot = await snippetsRef.limit(1).get()
		const totalSnippets = (await snippetsRef.count().get()).data().count

		console.log(`📊 Snippets Collection:`)
		console.log(`   Total documents: ${totalSnippets}`)

		if (totalSnippets > 0) {
			const firstSnippet = snippetsSnapshot.docs[0]?.data()
			console.log(`   ✅ Sample snippet found:`)
			console.log(`      ID: ${snippetsSnapshot.docs[0]?.id}`)
			console.log(`      Title: ${firstSnippet?.title || 'N/A'}`)
			console.log(`      Owner: ${firstSnippet?.ownerName || 'N/A'}`)
			console.log(`      Has files field: ${'files' in (firstSnippet || {})}`)
			console.log(`      Has code field: ${'code' in (firstSnippet || {})}`)
		} else {
			console.log(`   ⚠️  No snippets found`)
		}

		// Check users collection
		const usersRef = db.collection('users')
		const totalUsers = (await usersRef.count().get()).data().count

		console.log(`\n👥 Users Collection:`)
		console.log(`   Total documents: ${totalUsers}`)

		// Summary
		console.log(`\n${'='.repeat(50)}`)
		if (totalSnippets > 0) {
			console.log(`✅ Your production Firebase has data ready for migration!`)
			console.log(
				`   You have ${totalSnippets} snippet(s) to migrate to multi-file format.`,
			)
		} else {
			console.log(`⚠️  No snippets found in production Firebase.`)
			console.log(`   Migration script is ready but no data to migrate yet.`)
		}
		console.log(`${'='.repeat(50)}\n`)
	} catch (error) {
		console.error('❌ Error checking data:', error)
		process.exit(1)
	}
}

checkData()
