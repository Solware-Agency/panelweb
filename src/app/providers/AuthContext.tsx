import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@lib/supabase/config'
import { signOut as authSignOut } from '@lib/supabase/auth' // Rename to avoid conflicts
import { useSessionTimeout } from '@shared/hooks/useSessionTimeout'
import { SessionTimeoutWarning } from '@shared/components/ui/session-timeout-warning'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
	user: User | null
	session: Session | null
	loading: boolean
	signOut: () => Promise<void>
	refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	session: null,
	loading: true,
	signOut: async () => {},
	refreshUser: async () => {},
})

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)


	// Handle session timeout
	const handleSessionTimeout = async () => {
		console.log('🔒 CALLBACK: handleSessionTimeout EJECUTADO!')
		console.log('🔒 CALLBACK: Session timed out, signing out...')
		try {
			console.log('🔒 CALLBACK: Usando función signOut de auth.ts...')
			const { error } = await authSignOut() // Use the same signOut function as Header

			if (error) {
				console.error('❌ CALLBACK: Error during signOut:', error)
			} else {
				console.log('✅ CALLBACK: signOut successful')
			}

			// Force redirect like Header does
			console.log('🔒 CALLBACK: Forcing redirect to login...')
			window.location.replace('/') // Use replace for stronger redirect
		} catch (error) {
			console.error('❌ CALLBACK: Error during timeout sign out:', error)
			// Force redirect even if there's an error
			window.location.replace('/')
		}
	}

	const handleSessionWarning = (remainingTime: number) => {
		console.log(`🚨 CALLBACK: Session will expire in ${remainingTime} seconds`)
		console.log('🚨 CALLBACK: Warning triggered - showWarning will be managed by hook')
	}

	const { formatTimeRemaining, resetSessionTimer, showWarning, dismissWarning } = useSessionTimeout({
		onTimeout: handleSessionTimeout,
		onWarning: handleSessionWarning,
		warningThreshold: 30, // Mostrar advertencia 30 segundos antes
	})

	// Handle manual sign out

	const refreshUser = async () => {
		try {
			const {
				data: { user: currentUser },
			} = await supabase.auth.getUser()
			setUser(currentUser)
		} catch (error) {
			console.error('Error refreshing user:', error)
			setUser(null)
		}
	}

	useEffect(() => {
		// Get initial session
		const getInitialSession = async () => {
			try {
				const {
					data: { session: initialSession },
				} = await supabase.auth.getSession()
				console.log('Initial session:', initialSession?.user?.email)
				setSession(initialSession)
				setUser(initialSession?.user ?? null)
			} catch (error) {
				console.error('Error getting initial session:', error)
				// Clear invalid session data
				await supabase.auth.signOut()
				setSession(null)
				setUser(null)
			} finally {
				setLoading(false)
			}
		}

		getInitialSession()

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, currentSession) => {
			console.log('Auth state changed:', event, currentSession?.user?.email)

			setSession(currentSession)
			setUser(currentSession?.user ?? null)
			setLoading(false)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [])

	return (
		<AuthContext.Provider
			value={{
				user,
				session,
				loading,
				signOut: async () => {
					console.log('🔒 MANUAL SIGNOUT: Using signOut from auth.ts...')
					const { error } = await authSignOut()
					if (error) {
						console.error('❌ MANUAL SIGNOUT: Error:', error)
					} else {
						console.log('✅ MANUAL SIGNOUT: Success')
					}
				},
				refreshUser,
			}}
		>
			{children}

			{/* Session timeout warning */}
			<SessionTimeoutWarning
				isOpen={showWarning}
				onClose={() => {
					console.log('🚨 AUTH: Closing timeout warning manually')
					dismissWarning()
				}}
				onContinue={() => {
					console.log('🚨 AUTH: User clicked continue session')
					resetSessionTimer()
				}}
				timeRemaining={formatTimeRemaining()}
			/>
		</AuthContext.Provider>
	)
}