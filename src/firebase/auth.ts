import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	sendEmailVerification,
	sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from './config'

export const signUp = async (email: string, password: string) => {
	const userCredential = await createUserWithEmailAndPassword(auth, email, password)
	await sendEmailVerification(userCredential.user)
	return userCredential
}

export const signIn = async (email: string, password: string) => {
	return await signInWithEmailAndPassword(auth, email, password)
}

export const logout = async () => {
	return await signOut(auth)
}

export const sendVerificationEmail = async (user: any) => {
	return await sendEmailVerification(user)
}

export const resetPassword = async (email: string) => {
	return await sendPasswordResetEmail(auth, email)
}