import { UserRound, Eye, EyeOff, Clock } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../supabase/auth'

function RegisterForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [error, setError] = useState('')
	const [message, setMessage] = useState('')
	const [loading, setLoading] = useState(false)
	const [rateLimitError, setRateLimitError] = useState(false)
	const [retryCountdown, setRetryCountdown] = useState(0)
	const navigate = useNavigate()

	const startRetryCountdown = (seconds: number) => {
		setRetryCountdown(seconds)
		const interval = setInterval(() => {
			setRetryCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(interval)
					setRateLimitError(false)
					return 0
				}
				return prev - 1
			})
		}, 1000)
	}

	const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		// Reset previous states
		setError('')
		setMessage('')
		setRateLimitError(false)

		if (password !== confirmPassword) {
			setError('Las contraseñas no coinciden.')
			return
		}

		if (password.length < 6) {
			setError('La contraseña debe tener al menos 6 caracteres.')
			return
		}

		try {
			setLoading(true)

			console.log('Attempting to register user:', email)

			const { user, error: signUpError } = await signUp(email, password)

			if (signUpError) {
				console.error('Registration error:', signUpError)

				// Handle Supabase auth errors
				if (signUpError.message.includes('User already registered')) {
					setError('Ya existe una cuenta con este correo electrónico.')
				} else if (signUpError.message.includes('Password should be at least')) {
					setError('La contraseña es muy débil.')
				} else if (
					signUpError.message.includes('Unable to validate email address') ||
					signUpError.message.includes('Invalid email')
				) {
					setError('Correo electrónico inválido.')
				} else if (signUpError.message.includes('Signup is disabled')) {
					setError('El registro está temporalmente deshabilitado. Contacta al administrador.')
				} else if (
					signUpError.message.includes('email rate limit exceeded') ||
					signUpError.message.includes('over_email_send_rate_limit')
				) {
					setRateLimitError(true)
					setError(
						'Se ha alcanzado el límite de envío de correos electrónicos. Este es un límite temporal del servicio de email.',
					)
					startRetryCountdown(300) // 5 minutes countdown
				} else {
					setError('Error al crear la cuenta. Inténtalo de nuevo.')
				}
				return
			}

			if (user) {
				console.log('User registered successfully:', user.email)
				console.log('Email confirmed at registration:', user.email_confirmed_at)
				console.log('Confirmation sent at:', user.confirmation_sent_at)

				// CRITICAL: Always redirect to email verification notice
				// New users should NEVER be automatically verified
				setMessage(
					'¡Cuenta creada exitosamente! Se ha enviado un correo de verificación a tu email. Revisa tu bandeja de entrada y carpeta de spam.',
				)

				// Always redirect to email verification notice
				setTimeout(() => {
					navigate('/email-verification-notice')
				}, 2000)
			}
		} catch (err: any) {
			console.error('Registration error:', err)

			// Check if the error is related to rate limiting
			if (
				err.message &&
				(err.message.includes('email rate limit exceeded') || err.message.includes('over_email_send_rate_limit'))
			) {
				setRateLimitError(true)
				setError(
					'Se ha alcanzado el límite de envío de correos electrónicos. Este es un límite temporal del servicio de email.',
				)
				startRetryCountdown(300) // 5 minutes countdown
			} else {
				setError('Error al crear la cuenta. Inténtalo de nuevo.')
			}
		} finally {
			// CRITICAL: Always reset loading state
			setLoading(false)
		}
	}

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
	}

	return (
		<div className="w-screen h-screen bg-dark flex items-center justify-center">
			<div className="flex flex-col items-center justify-center bg-white p-8 rounded-none md:rounded-lg w-screen h-screen md:h-auto md:w-full md:max-w-md shadow-2xl shadow-black/60">
				<div className="text-center mb-4 flex flex-col items-center justify-center">
					<div className="p-4 bg-blue-500 rounded-full mb-4">
						<UserRound className="text-white size-12" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido a Solware, Registrate</h1>
					<p className="text-gray-600">Crea una cuenta para continuar</p>
				</div>

				<form className="w-full" onSubmit={handleRegister}>
					<div className="flex flex-col gap-2 mb-4 w-full">
						<p className="text-sm text-gray-600">Correo electrónico:</p>
						<input
							type="email"
							name="email"
							placeholder="tu@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={loading || rateLimitError}
							className="border-2 border-gray-900 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							autoComplete="email"
						/>

						<p className="text-sm text-gray-600">Contraseña:</p>
						<div className="relative">
							<input
								type={showPassword ? 'text' : 'password'}
								name="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={loading || rateLimitError}
								className="border-2 border-gray-900 rounded-md p-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
								autoComplete="new-password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								disabled={loading || rateLimitError}
								className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900 disabled:opacity-50"
							>
								{showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
							</button>
						</div>

						<p className="text-sm text-gray-600">Confirmar contraseña:</p>
						<div className="relative">
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								name="confirmPassword"
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								disabled={loading || rateLimitError}
								className="border-2 border-gray-900 rounded-md p-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
								autoComplete="new-password"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								disabled={loading || rateLimitError}
								className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900 disabled:opacity-50"
							>
								{showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
							</button>
						</div>
					</div>

					{error && (
						<div
							className={`border px-4 py-3 rounded mb-4 ${
								rateLimitError
									? 'bg-yellow-100 border-yellow-400 text-yellow-800'
									: 'bg-red-100 border-red-400 text-red-700'
							}`}
						>
							<div className="flex items-start gap-2">
								{rateLimitError && <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />}
								<div className="flex-1">
									<p className="font-medium">{error}</p>
									{rateLimitError && (
										<div className="mt-2 text-sm">
											<p>Esto puede suceder cuando:</p>
											<ul className="list-disc list-inside mt-1 space-y-1">
												<li>Se han enviado muchos correos en poco tiempo</li>
												<li>El servicio de email está temporalmente limitado</li>
											</ul>
											<p className="mt-2 font-medium">Soluciones recomendadas:</p>
											<ul className="list-disc list-inside mt-1 space-y-1">
												<li>Espera unos minutos e intenta de nuevo</li>
												<li>Verifica si ya recibiste un correo de confirmación</li>
												<li>Contacta al administrador si el problema persiste</li>
											</ul>
											{retryCountdown > 0 && (
												<p className="mt-3 font-medium text-yellow-900">
													Podrás intentar de nuevo en: {formatTime(retryCountdown)}
												</p>
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{message && (
						<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>
					)}

					<button
						type="submit"
						disabled={loading || rateLimitError}
						className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{loading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								Creando cuenta...
							</>
						) : rateLimitError ? (
							<>
								<Clock className="w-4 h-4" />
								{retryCountdown > 0 ? `Espera ${formatTime(retryCountdown)}` : 'Límite de email alcanzado'}
							</>
						) : (
							'Registrarse'
						)}
					</button>
				</form>

				{/* Footer */}
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">
						¿Ya tienes una cuenta?{' '}
						<Link
							to="/"
							className={`font-medium text-blue-500 hover:text-blue-600 transition-colors ${loading || rateLimitError ? 'pointer-events-none opacity-50' : ''}`}
						>
							Inicia sesión aquí
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}

export default RegisterForm
