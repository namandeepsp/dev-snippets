import { adminDb } from '../../src/services/firebase/firebase.server'
import type { IScript } from './script.interface'

export abstract class BaseScript implements IScript {
	abstract name: string
	private static firestoreConnectivityCheck: Promise<void> | null = null

	protected ensureDevEnvironment(): void {
		const projectId = process.env.FIREBASE_PROJECT_ID
		const allowNonDev = process.env.ALLOW_NON_DEV_SCRIPTS === 'true'

		if (projectId !== 'dev-snippets-dev' && !allowNonDev) {
			throw new Error(
				`❌ This script can only run on dev-snippets-dev by default.\n   Current: ${projectId}\n   Set ALLOW_NON_DEV_SCRIPTS=true to override intentionally.`,
			)
		}
	}

	protected log(message: string): void {
		console.log(`[${this.name}] ${message}`)
	}

	protected logSuccess(message: string): void {
		console.log(`[${this.name}] ✅ ${message}`)
	}

	protected logError(message: string): void {
		console.error(`[${this.name}] ❌ ${message}`)
	}

	protected async ensureReady(): Promise<void> {
		this.ensureDevEnvironment()
		await this.ensureFirestoreConnectivity()
	}

	protected async ensureFirestoreConnectivity(timeoutMs = 8000): Promise<void> {
		if (!BaseScript.firestoreConnectivityCheck) {
			BaseScript.firestoreConnectivityCheck = (async () => {
				let lastError: unknown

				for (let attempt = 1; attempt <= 2; attempt += 1) {
					try {
						const op = adminDb.listCollections()
						const timed = new Promise<never>((_, reject) =>
							setTimeout(() => reject(new Error('timed out')), timeoutMs),
						)
						await Promise.race([op, timed])
						return
					} catch (error) {
						lastError = error
						if (attempt === 2) {
							break
						}
						await new Promise((resolve) => setTimeout(resolve, 1000))
					}
				}

				throw new Error(
					`❌ Firestore unreachable. Check internet/DNS and Firebase credentials. (${lastError instanceof Error ? lastError.message : String(lastError)})`,
				)
			})()
		}

		return BaseScript.firestoreConnectivityCheck
	}

	abstract run(): Promise<void>
}
