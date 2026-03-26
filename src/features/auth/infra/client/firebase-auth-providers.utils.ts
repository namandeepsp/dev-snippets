import {
	GoogleAuthProvider,
	signInWithPopup,
	signInWithRedirect,
	type Auth,
} from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGooglePopup(auth: Auth) {
	return signInWithPopup(auth, googleProvider)
}

export async function handleGooglePopupError(
	auth: Auth,
	error: any,
): Promise<boolean> {
	const code = error?.code as string | undefined
	if (
		code === 'auth/popup-blocked' ||
		code === 'auth/cancelled-popup-request' ||
		code === 'auth/operation-not-supported-in-this-environment'
	) {
		await signInWithRedirect(auth, googleProvider)
		return true
	}
	return false
}
