import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { JSX } from 'react'

const FormRoute = ({ children }: { children: JSX.Element }) => {
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

	if (!user) {
		return <Navigate to="/login" />
	}

	// If user is the owner, redirect to dashboard
	if (user.email === 'juegosgeorge0502@gmail.com') {
		return <Navigate to="/dashboard" />
	}

	return children
}

export default FormRoute