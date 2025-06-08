import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	sendEmailVerification,
} from 'firebase/auth'
import { auth } from './config'

export const signUp = async (email: string, password: string) => {
	return await createUserWithEmailAndPassword(auth, email, password)
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
