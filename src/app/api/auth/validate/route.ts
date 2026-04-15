import type { Session } from '@/features/auth/core/auth.types'
import { userService } from '@/features/user/user.container'
import { getServerFirebaseAuth } from '@/services/firebase/firebase.server'
import { logger } from '@/shared/utils/logger'
import { getAuthProvider } from '@/shared/utils/utils'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const { idToken } = await request.json()

		if (!idToken) {
			return NextResponse.json({ error: 'ID token required' }, { status: 400 })
		}

		const auth = getServerFirebaseAuth()

		const decodedToken = await auth.verifyIdToken(idToken)

		const expiresIn = 60 * 60 * 24 * 5 * 1000
		const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })

		const user = await userService.syncUserFromAuth(
			decodedToken.uid,
			decodedToken.email || '',
			decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
			decodedToken.picture,
		)

		const session: Session = {
			uid: user.id,
			createdAt: Date.now(),
			expiresAt: Date.now() + expiresIn,
			provider: getAuthProvider(decodedToken),
		}

		const cookieStore = await cookies()
		cookieStore.set('__session', sessionCookie, {
			maxAge: expiresIn / 1000,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		})

		return NextResponse.json({
			success: true,
			user,
			session,
			isNewUser: decodedToken.auth_time === decodedToken.iat,
		})
	} catch (error: any) {
		logger.error('Session creation failed', error)

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

export async function GET() {
	try {
		const cookieStore = await cookies()
		const sessionCookie = cookieStore.get('__session')?.value

		if (!sessionCookie) {
			return NextResponse.json({ session: null, user: null }, { status: 200 })
		}

		const auth = getServerFirebaseAuth()

		const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

		const user = await userService.getUserById(decodedClaims.uid)

		if (!user) {
			cookieStore.delete('__session')
			return NextResponse.json({ session: null, user: null }, { status: 200 })
		}

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
		const cookieStore = await cookies()
		cookieStore.delete('__session')

		return NextResponse.json({ session: null, user: null }, { status: 200 })
	}
}

export async function DELETE() {
	const cookieStore = await cookies()
	cookieStore.delete('__session')

	return NextResponse.json({
		success: true,
		message: 'Session cleared',
	})
}
