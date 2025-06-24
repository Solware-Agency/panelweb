import { Navigate } from 'react-router-dom'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import type { JSX } from 'react'

interface PrivateRouteProps {
	children: JSX.Element
	requiredRole?: 'owner' | 'employee'
}

/**
 * Protected route component that checks authentication, email verification, and role permissions
 * Only allows access to users with verified emails and appropriate roles
 */
const PrivateRoute = ({ children, requiredRole = 'owner' }: PrivateRouteProps) => {
	const { user, loading: authLoading } = useAuth()
	const { profile, isLoading: profileLoading, error: profileError } = useUserProfile()

	// Show loading spinner while checking authentication and profile
	if (authLoading || profileLoading) {
		return (
			<div className="w-screen h-screen bg-dark flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg">
					<div className="flex items-center gap-3">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
						<p className="text-lg">Verificando permisos...</p>
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

	// Check role permissions
	if (profile.role !== requiredRole) {
		console.log(`User role "${profile.role}" does not match required role "${requiredRole}"`)
		
		// Redirect based on actual user role
		if (profile.role === 'owner') {
			return <Navigate to="/dashboard" />
		} else {
			return <Navigate to="/form" />
		}
	}

	console.log(`Access granted for user with role: ${profile.role}`)
	return children
}

export default PrivateRoute