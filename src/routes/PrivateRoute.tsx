import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { JSX } from 'react'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
	const { user, loading } = useAuth()

	if (loading) {
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

	// Simple email-based access control for dashboard
	if (user.email !== 'juegosgeorge0502@gmail.com') {
		console.log('Non-owner user trying to access dashboard, redirecting to form')
		return <Navigate to="/form" />
	}

	return children
}

export default PrivateRoute