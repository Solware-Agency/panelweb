import { Navigate } from 'react-router-dom'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import type { JSX } from 'react'

/**
 * Route protection for the form page
 * Allows access to employees and redirects owners to dashboard
 */
const FormRoute = ({ children }: { children: JSX.Element }) => {
	const { user, loading: authLoading } = useAuth()
	const { profile, isLoading: profileLoading, error: profileError } = useUserProfile()

	// Show loading spinner while checking authentication and profile
	if (authLoading || profileLoading) {
		return (
			<div className="w-screen h-screen bg-dark flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg">
					<div className="flex items-center gap-3">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
						<p className="text-lg">Cargando...</p>
					</div>
				</div>
			</div>
		)
	}

	// User must be logged in
	if (!user) {
		console.log('No user found, redirecting to login')
		return <Navigate to="/" />
	}

	// CRITICAL: User must have verified their email
	if (!user.email_confirmed_at) {
		console.log('User email not confirmed, redirecting to verification notice')
		return <Navigate to="/email-verification-notice" />
	}

	// Profile must exist and be loaded successfully
	if (!profile) {
		console.error('No profile found for user:', user.id, 'Error:', profileError)
		// If there's a profile error, redirect to login to try again
		return <Navigate to="/" />
	}

	// If user is the owner, redirect to dashboard
	if (profile.role === 'owner') {
		console.log('Owner user accessing form route, redirecting to dashboard')
		return <Navigate to="/dashboard" />
	}

	// Allow access for employees and other roles
	console.log(`Form access granted for user with role: ${profile.role}`)
	return children
}

export default FormRoute