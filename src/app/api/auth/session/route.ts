import type { Session } from '@/features/auth/core/auth.types'
import { userService } from '@/features/user/user.container'
import { getServerFirebaseAuth } from '@/services/firebase/firebase.server'
import { logger } from '@/shared/utils/logger'
import { getAuthProvider } from '@/shared/utils/utils'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * ============================================================================
 * SESSION API ROUTE
 * ============================================================================
 *
 * Manages authentication sessions via HTTP-only cookies.
 *
 * Endpoints:
 * - POST: Create a new session (after successful authentication)
 * - GET: Get current session information
 * - DELETE: Clear session (logout)
 *
 * These routes are called by the AuthPort implementations,
 * NEVER directly by UI components.
 */

/* ----------------------------------------------------------------------- */
/* POST - Create Session
/* ----------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
	try {
		const { idToken, name } = await request.json()

		if (!idToken) {
			return NextResponse.json({ error: 'ID token required' }, { status: 400 })
		}

		const auth = getServerFirebaseAuth()

		// 1. Verify the ID token and get user info
		const decodedToken = await auth.verifyIdToken(idToken)

		// 2. Create session cookie (5 days)
		const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days in milliseconds
		const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })

		// 3. Get or create user profile
		const user = await userService.syncUserFromAuth(
			decodedToken.uid,
			decodedToken.email || '',
			decodedToken.name ||
				name?.trim() ||
				decodedToken.email?.split('@')[0] ||
				'User',
			decodedToken.picture,
		)

		// 4. Create session object
		const session: Session = {
			uid: user.id,
			createdAt: Date.now(),
			expiresAt: Date.now() + expiresIn,
			provider: getAuthProvider(decodedToken),
		}

		// 5. Set HTTP-only cookie
		const cookieStore = await cookies()
		cookieStore.set('__session', sessionCookie, {
			maxAge: expiresIn / 1000, // Convert to seconds
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		})

		// 6. Return success with user and session
		return NextResponse.json({
			success: true,
			user,
			session,
			isNewUser: decodedToken.auth_time === decodedToken.iat, // First sign-in
		})
	} catch (error: any) {
		logger.error('Session creation failed', error)

		// Handle specific Firebase errors
		if (error.code === 'auth/id-token-expired') {
			return NextResponse.json({ error: 'ID token expired' }, { status: 401 })
		}

		if (error.code === 'auth/id-token-revoked') {
			return NextResponse.json({ error: 'ID token revoked' }, { status: 401 })
		}

		if (error.code === 'auth/argument-error') {
			return NextResponse.json({ error: 'Invalid ID token' }, { status: 400 })
		}

		return NextResponse.json(
			{ error: 'Authentication failed' },
			{ status: 401 },
		)
	}
}

/* ----------------------------------------------------------------------- */
/* GET - Get Session
/* ----------------------------------------------------------------------- */

export async function GET() {
	try {
		const cookieStore = await cookies()
		const sessionCookie = cookieStore.get('__session')?.value

		if (!sessionCookie) {
			return NextResponse.json({ session: null, user: null }, { status: 200 })
		}

		const auth = getServerFirebaseAuth()

		// Verify session cookie
		const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

		// Get user profile
		const user = await userService.getUserById(decodedClaims.uid)

		if (!user) {
			// User exists in auth but not in Firestore - this shouldn't happen
			// But let's handle it gracefully by clearing the session
			cookieStore.delete('__session')
			return NextResponse.json({ session: null, user: null }, { status: 200 })
		}

		// Reconstruct session object
		const session: Session = {
			uid: user.id,
			createdAt: decodedClaims.auth_time * 1000,
			expiresAt: decodedClaims.exp * 1000,
			provider: getAuthProvider(decodedClaims),
		}

		return NextResponse.json({
			success: true,
			session,
			user,
		})
	} catch (_error: any) {
		// Session is invalid - clear it
		const cookieStore = await cookies()
		cookieStore.delete('__session')

		return NextResponse.json({ session: null, user: null }, { status: 200 })
	}
}

/* ----------------------------------------------------------------------- */
/* DELETE - Clear Session (Logout)
/* ----------------------------------------------------------------------- */

export async function DELETE() {
	const cookieStore = await cookies()
	cookieStore.delete('__session')

	return NextResponse.json({
		success: true,
		message: 'Session cleared',
	})
}
