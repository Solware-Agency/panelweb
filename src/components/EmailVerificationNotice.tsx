import { useState, useEffect } from 'react'
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { sendVerificationEmail, logout } from '../firebase/auth'

function EmailVerificationNotice() {
	const { user, refreshUser } = useAuth()
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [checkingVerification, setCheckingVerification] = useState(false)

	// Check verification status when component mounts and periodically
	useEffect(() => {
		let intervalId: NodeJS.Timeout

		const checkVerificationStatus = async () => {
			if (user && !checkingVerification) {
				setCheckingVerification(true)
				await refreshUser()
				setCheckingVerification(false)
			}
		}

		// Check immediately when component mounts
		checkVerificationStatus()

		// Set up periodic checking every 5 seconds
		intervalId = setInterval(checkVerificationStatus, 5000)

		return () => {
			if (intervalId) {
				clearInterval(intervalId)
			}
		}
	}, [user, refreshUser, checkingVerification])

	// Listen for when the user returns to the app
	useEffect(() => {
		const handleVisibilityChange = async () => {
			if (!document.hidden && user) {
				await refreshUser()
			}
		}

		const handleFocus = async () => {
			if (user) {
				await refreshUser()
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)
		window.addEventListener('focus', handleFocus)

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
			window.removeEventListener('focus', handleFocus)
		}
	}, [user, refreshUser])

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

	const handleCheckVerification = async () => {
		if (!user) return

		try {
			setCheckingVerification(true)
			setMessage('')
			setError('')
			await refreshUser()
			
			// Small delay to ensure state updates
			setTimeout(() => {
				if (user.emailVerified) {
					setMessage('¡Email verificado exitosamente! Serás redirigido al dashboard.')
				} else {
					setError('El email aún no ha sido verificado. Por favor, revisa tu correo e inténtalo de nuevo.')
				}
				setCheckingVerification(false)
			}, 1000)
		} catch (err) {
			setError('Error al verificar el estado del email. Inténtalo de nuevo.')
			setCheckingVerification(false)
		}
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
						Por favor verifica tu dirección de correo electrónico para acceder al dashboard.
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

					{checkingVerification && (
						<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
							<RefreshCw size={16} className="animate-spin" />
							Verificando estado del email...
						</div>
					)}

					<div className="space-y-3">
						<button
							onClick={handleCheckVerification}
							disabled={checkingVerification}
							className="w-full bg-green-500 text-white rounded-md p-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							<CheckCircle size={16} />
							{checkingVerification ? 'Verificando...' : 'Ya verifiqué mi email'}
						</button>

						<button
							onClick={handleResendVerification}
							disabled={loading || checkingVerification}
							className="w-full bg-orange-500 text-white rounded-md p-2 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
							{loading ? 'Enviando...' : 'Reenviar Correo de Verificación'}
						</button>
					</div>
				</div>

				<div className="text-center space-y-3">
					<p className="text-sm text-gray-600">
						¿Problemas con la verificación?
					</p>
					<button
						onClick={handleLogout}
						className="flex items-center justify-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors mx-auto"
					>
						<ArrowLeft size={16} />
						Cerrar sesión e intentar de nuevo
					</button>
				</div>

				<div className="mt-4 text-xs text-gray-500 text-center">
					<p>💡 Consejo: Después de verificar tu email, haz clic en "Ya verifiqué mi email" o regresa a esta pestaña.</p>
				</div>
			</div>
		</div>
	)
}

export default EmailVerificationNotice