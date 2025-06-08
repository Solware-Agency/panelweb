import { useState } from 'react'
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { sendVerificationEmail, logout } from '../firebase/auth'

function EmailVerificationNotice() {
	const { user } = useAuth()
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleResendVerification = async () => {
		if (!user) return

		try {
			setMessage('')
			setError('')
			setLoading(true)
			await sendVerificationEmail(user)
			setMessage('Correo de verificación enviado. Revisa tu bandeja de entrada.')
		} catch (err: any) {
			if (err.code === 'auth/too-many-requests') {
				setError('Demasiados intentos. Espera un momento antes de intentar de nuevo.')
			} else {
				setError('Error al enviar el correo de verificación. Inténtalo de nuevo.')
			}
		}
		setLoading(false)
	}

	const handleLogout = async () => {
		await logout()
	}

	return (
		<div className="w-screen h-screen bg-dark flex items-center justify-center">
			<div className="flex flex-col items-center justify-center bg-white p-8 rounded-none md:rounded-lg w-screen h-screen md:h-auto md:w-full md:max-w-md shadow-2xl shadow-black/60">
				<div className="text-center mb-6 flex flex-col items-center justify-center">
					<div className="p-4 bg-orange-500 rounded-full mb-4">
						<Mail className="text-white size-12" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Verifica tu Correo Electrónico</h1>
					<p className="text-gray-600 text-center">
						Por favor verifica tu dirección de correo electrónico e inicia sesión nuevamente para acceder al dashboard.
					</p>
				</div>

				<div className="w-full mb-6">
					<div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
						<p className="text-sm">
							Hemos enviado un correo de verificación a: <br />
							<strong>{user?.email}</strong>
						</p>
					</div>

					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
							{error}
						</div>
					)}

					{message && (
						<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
							{message}
						</div>
					)}

					<button
						onClick={handleResendVerification}
						disabled={loading}
						className="w-full bg-orange-500 text-white rounded-md p-2 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3 flex items-center justify-center gap-2"
					>
						<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
						{loading ? 'Enviando...' : 'Reenviar Correo de Verificación'}
					</button>
				</div>

				<div className="text-center space-y-3">
					<p className="text-sm text-gray-600">
						¿Ya verificaste tu correo?
					</p>
					<button
						onClick={handleLogout}
						className="flex items-center justify-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors mx-auto"
					>
						<ArrowLeft size={16} />
						Iniciar sesión nuevamente
					</button>
				</div>
			</div>
		</div>
	)
}

export default EmailVerificationNotice