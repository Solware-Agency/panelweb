import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@lib/supabase/config'
import { updatePassword } from '@lib/supabase/auth'
import { useSecureRedirect } from '@shared/hooks/useSecureRedirect'
import { CheckCircle, AlertCircle, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react'
import Aurora from '@shared/components/ui/Aurora'
import FadeContent from '@shared/components/ui/FadeContent'

function AuthCallback() {
	const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'password_reset'>('loading')
	const [message, setMessage] = useState('')
	const [showPasswordForm, setShowPasswordForm] = useState(false)
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [passwordError, setPasswordError] = useState('')
	const [passwordLoading, setPasswordLoading] = useState(false)
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	// Use secure redirect for role-based navigation after successful verification
	const { redirectUser } = useSecureRedirect({
		onRedirect: (role, path) => {
			console.log(`Email verified user with role "${role}" being redirected to: ${path}`)
		}
	})

	useEffect(() => {
		const handleAuthCallback = async () => {
			try {
				console.log('Processing auth callback...')
				console.log('Current URL:', window.location.href)
				console.log('Search params:', Object.fromEntries(searchParams.entries()))
				console.log('Hash:', window.location.hash)

				// PRIORITY 1: Check for password recovery first
				const type = searchParams.get('type')
				const accessToken = searchParams.get('access_token')
				const refreshToken = searchParams.get('refresh_token')

				console.log('Callback type:', type)
				console.log('Has access token:', !!accessToken)
				console.log('Has refresh token:', !!refreshToken)

				// Handle password recovery with highest priority
				if (type === 'recovery' || type === 'password_recovery') {
					console.log('Password recovery flow detected - handling with priority')

					if (accessToken && refreshToken) {
						console.log('Setting session with recovery tokens...')
						// Set the session with the tokens from URL
						const { error: setSessionError } = await supabase.auth.setSession({
							access_token: accessToken,
							refresh_token: refreshToken,
						})

						if (setSessionError) {
							console.error('Error setting session for password recovery:', setSessionError)
							setStatus('error')
							setMessage('Error al procesar el enlace de recuperación. El enlace puede haber expirado.')
							return
						}

						console.log('Session set successfully for password recovery')
						setStatus('password_reset')
						setShowPasswordForm(true)
						setMessage('Por favor, ingresa tu nueva contraseña.')
						return
					} else {
						console.error('Password recovery link missing required tokens')
						setStatus('error')
						setMessage('Enlace de recuperación inválido o expirado.')
						return
					}
				}

				// PRIORITY 2: Check for general errors
				const error = searchParams.get('error')
				const errorDescription = searchParams.get('error_description')
				const errorCode = searchParams.get('error_code')

				if (error) {
					console.error('Auth callback error from URL:', { error, errorDescription, errorCode })

					if (error === 'access_denied' && errorCode === 'otp_expired') {
						setStatus('error')
						setMessage(
							'El enlace ha expirado. Por favor, solicita un nuevo enlace de verificación o restablecimiento de contraseña.',
						)
					} else {
						setStatus('error')
						setMessage(`Error de autenticación: ${errorDescription || error}`)
					}
					return
				}

				// PRIORITY 3: Handle email confirmation (only if not password recovery)
				console.log('Not a password recovery, checking for email confirmation...')

				// Check for session from URL hash or query params
				const { data, error: sessionError } = await supabase.auth.getSession()

				if (sessionError) {
					console.error('Auth callback session error:', sessionError)
					setStatus('error')
					setMessage('Error al verificar la sesión. Inténtalo de nuevo.')
					return
				}

				// Handle email confirmation
				if (data.session?.user) {
					const user = data.session.user
					console.log('User authenticated via callback:', user.email)
					console.log('Email confirmed:', user.email_confirmed_at)
					console.log('User metadata:', user.user_metadata)

					if (user.email_confirmed_at) {
						setStatus('success')
						setMessage('¡Email verificado exitosamente! Redirigiendo...')

						// Use secure redirect for role-based navigation
						setTimeout(() => {
							redirectUser()
						}, 2000)
					} else {
						setStatus('error')
						setMessage('El email aún no está verificado. Revisa tu correo.')
						setTimeout(() => {
							navigate('/email-verification-notice')
						}, 3000)
					}
				} else {
					console.log('No session found, checking if this was a confirmation link')

					// Try to exchange the URL for a session (for email confirmation)
					const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
						window.location.search,
					)

					if (exchangeError) {
						console.error('Error exchanging code for session:', exchangeError)
						setStatus('error')
						setMessage('Error al verificar el email. El enlace puede haber expirado.')
						setTimeout(() => {
							navigate('/')
						}, 3000)
						return
					}

					if (exchangeData.session?.user) {
						const user = exchangeData.session.user
						console.log('Email confirmed via code exchange:', user.email)

						setStatus('success')
						setMessage('¡Email verificado exitosamente! Redirigiendo...')

						// Use secure redirect for role-based navigation
						setTimeout(() => {
							redirectUser()
						}, 2000)
					} else {
						setStatus('error')
						setMessage('No se pudo verificar la sesión. Redirigiendo al login...')
						setTimeout(() => {
							navigate('/')
						}, 3000)
					}
				}
			} catch (err) {
				console.error('Unexpected auth callback error:', err)
				setStatus('error')
				setMessage('Error inesperado. Redirigiendo al login...')
				setTimeout(() => {
					navigate('/')
				}, 3000)
			}
		}

		handleAuthCallback()
	}, [navigate, searchParams, redirectUser])

	const handlePasswordUpdate = async (e: React.FormEvent) => {
		e.preventDefault()

		if (newPassword !== confirmPassword) {
			setPasswordError('Las contraseñas no coinciden.')
			return
		}

		if (newPassword.length < 6) {
			setPasswordError('La contraseña debe tener al menos 6 caracteres.')
			return
		}

		try {
			setPasswordError('')
			setPasswordLoading(true)

			console.log('Updating password...')
			const { error } = await updatePassword(newPassword)

			if (error) {
				console.error('Password update error:', error)
				setPasswordError('Error al actualizar la contraseña. Inténtalo de nuevo.')
				return
			}

			console.log('Password updated successfully')
			setStatus('success')
			setMessage('¡Contraseña actualizada exitosamente! Redirigiendo...')
			setShowPasswordForm(false)

			setTimeout(() => {
				navigate('/')
			}, 2000)
		} catch (err) {
			console.error('Password update error:', err)
			setPasswordError('Error inesperado al actualizar la contraseña.')
		} finally {
			setPasswordLoading(false)
		}
	}

	return (
		<div className="w-screen h-screen relative overflow-hidden bg-gradient-to-br from-black via-black to-black">
			{/* Aurora Background with New Color Palette */}
			<Aurora colorStops={['#ec4699', '#750c41', '#ec4699']} blend={0.7} amplitude={1.3} speed={0.3} />

			{/* Content Container with FadeContent Animation */}
			<div className="relative z-10 w-screen h-screen bg-gradient-to-br from-black/20 via-transparent to-black/30 flex items-center justify-center">
				<FadeContent
					blur={true}
					duration={1000}
					easing="ease-out"
					initialOpacity={0}
					delay={200}
					className="w-full h-full flex items-center justify-center"
				>
					<div className="flex flex-col items-center justify-center bg-slate-800/90 backdrop-blur-xl p-8 rounded-none md:rounded-xl w-screen h-screen md:h-auto md:w-full md:max-w-md shadow-2xl border border-slate-700/50">
						{!showPasswordForm ? (
							<>
								<div className="text-center mb-6 flex flex-col items-center justify-center">
									<div
										className={`p-4 rounded-full mb-4 ${
											status === 'loading' ? 'bg-blue-500' : status === 'success' ? 'bg-green-500' : 'bg-red-500'
										}`}
									>
										{status === 'loading' && <RefreshCw className="text-white size-12 animate-spin" />}
										{status === 'success' && <CheckCircle className="text-white size-12" />}
										{status === 'error' && <AlertCircle className="text-white size-12" />}
									</div>

									<h1 className="text-2xl font-bold text-white mb-2">
										{status === 'loading' && 'Verificando...'}
										{status === 'success' && '¡Verificación Exitosa!'}
										{status === 'error' && 'Error de Verificación'}
									</h1>

									<p className="text-slate-300 text-center">{message || 'Procesando verificación...'}</p>
								</div>

								{status === 'loading' && (
									<div className="w-full">
										<div className="bg-blue-900/50 border border-blue-700/50 text-blue-200 px-4 py-3 rounded">
											<p className="text-sm text-center">Por favor espera mientras procesamos tu solicitud...</p>
										</div>
									</div>
								)}

								{status === 'error' && (
									<div className="w-full">
										<button
											onClick={() => navigate('/')}
											className="w-full bg-transparent border border-primary hover:shadow-sm hover:shadow-primary text-white rounded-md p-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
										>
											Ir al Login
										</button>
									</div>
								)}
							</>
						) : (
							<>
								<div className="text-center mb-6 flex flex-col items-center justify-center">
									<div className="p-4 bg-[#9e1157] rounded-full mb-4 shadow-lg">
										<Lock className="text-white size-12" />
									</div>
									<h1 className="text-2xl font-bold text-white mb-2">Nueva Contraseña</h1>
									<p className="text-slate-300 text-center">
										Ingresa tu nueva contraseña para completar el restablecimiento.
									</p>
								</div>

								<form onSubmit={handlePasswordUpdate} className="w-full">
									<div className="flex flex-col gap-4 mb-4">
										<div>
											<label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-1">
												Nueva Contraseña:
											</label>
											<div className="relative">
												<input
													type={showPassword ? 'text' : 'password'}
													id="newPassword"
													value={newPassword}
													onChange={(e) => setNewPassword(e.target.value)}
													required
													className="w-full border-2 border-slate-600 bg-slate-700/80 text-white rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
													placeholder="••••••••"
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
												>
													{showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
												</button>
											</div>
										</div>

										<div>
											<label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
												Confirmar Contraseña:
											</label>
											<div className="relative">
												<input
													type={showConfirmPassword ? 'text' : 'password'}
													id="confirmPassword"
													value={confirmPassword}
													onChange={(e) => setConfirmPassword(e.target.value)}
													required
													className="w-full border-2 border-slate-600 bg-slate-700/80 text-white rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
													placeholder="••••••••"
												/>
												<button
													type="button"
													onClick={() => setShowConfirmPassword(!showConfirmPassword)}
													className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
												>
													{showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
												</button>
											</div>
										</div>
									</div>

									{passwordError && (
										<div className="bg-red-900/80 border border-red-700 text-red-200 px-4 py-3 rounded mb-4 flex items-center gap-2">
											<AlertCircle className="size-5 flex-shrink-0" />
											<span>{passwordError}</span>
										</div>
									)}

									<button
										type="submit"
										disabled={passwordLoading}
										className="w-full bg-transparent border border-primary hover:shadow-sm hover:shadow-primary text-white rounded-md p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
									>
										{passwordLoading ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												Actualizando...
											</>
										) : (
											'Actualizar Contraseña'
										)}
									</button>
								</form>
							</>
						)}
					</div>
				</FadeContent>
			</div>
		</div>
	)
}

export default AuthCallback