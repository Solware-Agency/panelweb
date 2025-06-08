import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EmailVerificationNotice from '../components/EmailVerificationNotice'
import type { JSX } from 'react'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
	const { user, loading } = useAuth()

	if (loading) {
		return (
			<div className="w-screen h-screen bg-dark flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg">
					<p className="text-lg">Cargando...</p>
				</div>
			</div>
		)
	}

	if (!user) {
		return <Navigate to="/login" />
	}

	if (!user.emailVerified) {
		return <EmailVerificationNotice />
	}

	return children
}

export default PrivateRoute