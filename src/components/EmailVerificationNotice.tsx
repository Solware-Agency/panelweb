import { useState } from 'react'
import { Mail, RefreshCw, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { resendConfirmation, signOut } from '../supabase/auth'
import { useNavigate } from 'react-router-dom'

function EmailVerificationNotice() {
	const { user, refreshUser } = useAuth()
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [checkingVerification, setCheckingVerification] = useState(false)
	const navigate = useNavigate()

	const handleResendVerification = async () => {
		if (!user?.email) return

		try {
			setMessage('')
			setError('')
			setLoading(true)
			
			console.log('Resending verification email to:', user.email)
			
			const { error: resendError } = await resendConfirmation(user.email)

			if (resendError) {
				console.error('Resend error:', resendError)
				if (resendError.message.includes('For security purposes') || resendError.message.includes('rate limit')) {
					setError('Demasiados intentos. Espera un momento antes de intentar de nuevo.')
				} else if (resendError.message.includes('already confirmed')) {
					setMessage('Tu email ya está verificado. Intenta iniciar sesión.')
				} else {
					setError('Error al enviar el correo de verificación. Inténtalo de nuevo.')
				}
				return
			}

			setMessage('Correo de verificación enviado. Revisa tu bandeja de entrada y carpeta de spam.')
		} catch (err: any) {
			console.error('Resend verification error:', err)
			setError('Error al enviar el correo de verificación. Inténtalo de nuevo.')
		}
		setLoading(false)
	}

	const handleCheckVerification = async () => {
		if (!user) return

		try {
			setCheckingVerification(true)
			setMessage('')
			setError('')
			
			console.log('Checking verification status for user:', user.email)
			
			// Refresh user data to get latest email verification status
			await refreshUser()
			
			// Get the latest user data from Supabase
			const { supabase } = await import('../supabase/config')
			const { data: { user: latestUser } } = await supabase.auth.getUser()
			
			console.log('Latest user verification status:', latestUser?.email_confirmed_at)
			
			// Check if email is now verified
			if (latestUser?.email_confirmed_at) {
				setMessage('¡Email verificado exitosamente! Redirigiendo...')
				setTimeout(() => {
					// Simple email-based redirect logic
					if (latestUser.email === 'juegosgeorge0502@gmail.com') {
						navigate('/dashboard')
					} else {
						navigate('/form')
					}
				}, 1500)
			} else {
				setError('El email aún no ha sido verificado. Por favor, revisa tu correo e inténtalo de nuevo.')
			}
		} catch (err) {
			console.error('Check verification error:', err)
			setError('Error al verificar el estado del email. Inténtalo de nuevo.')
		}
		setCheckingVerification(false)
	}

	const handleLogout = async () => {
		await signOut()
		navigate('/login')
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
						Por favor verifica tu dirección de correo electrónico para continuar.
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
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
							<AlertCircle size={16} />
							{error}
						</div>
					)}

					{message && (
						<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
							<CheckCircle size={16} />
							{message}
						</div>
					)}

					<div className="space-y-3">
						<button
							onClick={handleCheckVerification}
							disabled={checkingVerification}
							className="w-full bg-green-500 text-white rounded-md p-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{checkingVerification ? (
								<>
									<RefreshCw size={16} className="animate-spin" />
									Verificando...
								</>
							) : (
								<>
									<CheckCircle size={16} />
									Ya verifiqué mi email
								</>
							)}
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

				<div className="mt-4 text-xs text-gray-500 text-center space-y-2">
					<p>💡 <strong>Consejos:</strong></p>
					<ul className="text-left space-y-1">
						<li>• Revisa tu carpeta de spam/correo no deseado</li>
						<li>• Espera hasta 5 minutos para que llegue el correo</li>
						<li>• Asegúrate de que tu email esté escrito correctamente</li>
						<li>• Después de hacer clic en el enlace del correo, regresa aquí y haz clic en "Ya verifiqué mi email"</li>
					</ul>
				</div>
			</div>
		</div>
	)
}

export default EmailVerificationNotice