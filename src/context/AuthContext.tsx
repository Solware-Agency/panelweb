import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'

interface AuthContextType {
	user: User | null
	loading: boolean
	refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ 
	user: null, 
	loading: true,
	refreshUser: async () => {}
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	const refreshUser = async () => {
		if (auth.currentUser) {
			try {
				await auth.currentUser.reload()
				setUser({ ...auth.currentUser })
			} catch (error) {
				console.error("Error refreshing user:", error)
			}
		}
	}

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				try {
					// Always reload user data to get the latest emailVerified status
					await user.reload()
					const refreshedUser = auth.currentUser
					if (refreshedUser) {
						setUser({ ...refreshedUser })
					}
				} catch (error) {
					console.error("Error reloading user:", error)
					setUser(user)
				}
			} else {
				setUser(null)
			}
			setLoading(false)
		})

		return () => {
			unsubscribe()
		}
	}, [])

	return (
		<AuthContext.Provider value={{ user, loading, refreshUser }}>
			{children}
		</AuthContext.Provider>
	)
}