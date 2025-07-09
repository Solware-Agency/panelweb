import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@lib/supabase/config'
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
	const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
	
	// Handle session timeout
	const handleSessionTimeout = async () => {
		console.log('Session timed out, signing out...')
		await handleSignOut()
		window.location.href = '/' // Redirect to login page
	}
	
	const handleSessionWarning = (remainingTime: number) => {
		console.log(`Session will expire in ${remainingTime} seconds`)
		setShowTimeoutWarning(true)
	}
	
	const { 
		timeRemaining, 
		formatTimeRemaining, 
		resetSessionTimer 
	} = useSessionTimeout({
		onTimeout: handleSessionTimeout,
		onWarning: handleSessionWarning,
	})
	
	// Handle manual sign out
	const handleSignOut = async () => {
		try {
			await supabase.auth.signOut()
			setUser(null)
			setSession(null)
			
			// Clear session storage
			localStorage.removeItem('last_activity_time')
			localStorage.removeItem('session_expiry_time')
		} catch (error) {
			console.error('Error signing out:', error)
		}
	}

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
				signOut: handleSignOut,
				refreshUser,
			}}
		>
			{children}
			
			{/* Session timeout warning */}
			<SessionTimeoutWarning
				isOpen={showTimeoutWarning}
				onClose={() => setShowTimeoutWarning(false)}
				onContinue={() => {
					resetSessionTimer()
					setShowTimeoutWarning(false)
				}}
				timeRemaining={formatTimeRemaining()}
			/>
		</AuthContext.Provider>
	)
}