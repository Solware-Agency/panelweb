import { useState } from 'react'
import { CodeXml, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { signIn } from '@lib/supabase/auth'
import { useAuth } from '@app/providers/AuthContext'
import { useSecureRedirect } from '@shared/hooks/useSecureRedirect'
import Aurora from '@shared/components/ui/Aurora'

function LoginForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const { refreshUser } = useAuth()
	const [showPassword, setShowPassword] = useState(false)

	// Use secure redirect hook for role-based navigation
	const { isRedirecting } = useSecureRedirect({
		onRedirect: (role, path) => {
			console.log(`User with role "${role}" being redirected to: ${path}`)
		}
	})

	const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		try {
			setError('')
			setLoading(true)

			console.log('Attempting to sign in with:', email)

			const { user, error: signInError } = await signIn(email, password)

			if (signInError) {
				console.error('Sign in error:', signInError)

				// Handle specific Supabase auth errors
				if (signInError.message.includes('Invalid login credentials')) {
					setError('Credenciales inválidas. Verifica tu email y contraseña.')
				} else if (signInError.name === 'EmailNotConfirmed' || signInError.message.includes('Email not confirmed')) {
					console.log('Email not confirmed, redirecting to verification notice')
					// If user exists but email not confirmed, redirect to verification notice
					if (user) {
						await refreshUser()
						// Note: The useSecureRedirect hook will handle the redirect to verification notice
						// if email is not confirmed
						return
					} else {
						setError('Por favor confirma tu email antes de iniciar sesión.')
					}
				} else if (signInError.message.includes('Too many requests')) {
					setError('Demasiados intentos. Espera un momento antes de intentar de nuevo.')
				} else if (signInError.message.includes('Invalid email')) {
					setError('Correo electrónico inválido.')
				} else {
					setError('Error al iniciar sesión. Verifica tus credenciales.')
				}
				return
			}

			if (!user) {
				setError('Error al iniciar sesión. Inténtalo de nuevo.')
				return
			}

			console.log('User signed in successfully:', user.email)
			console.log('Email confirmed at:', user.email_confirmed_at)

			// CRITICAL: Check if email is verified
			if (!user.email_confirmed_at) {
				console.log('Email not confirmed, will be handled by secure redirect')
				setError('Por favor confirma tu email antes de continuar.')
			}

			// Refresh user data and let the secure redirect handle the navigation
			await refreshUser()
			
			// The useSecureRedirect hook will automatically handle role-based redirection
			// after the user profile is loaded

		} catch (err: any) {
			console.error('Login error:', err)
			setError('Error al iniciar sesión. Verifica tus credenciales o crea una cuenta.')
		} finally {
			// CRITICAL: Always reset loading state
			setLoading(false)
		}
	}

	return (
		<div className="w-screen h-screen relative overflow-hidden">
			{/* Aurora Background with New Color Palette */}
			<Aurora
				colorStops={["#C084FC", "#22C55E", "#0EA5E9"]}
				blend={0.6}
				amplitude={1.2}
				speed={0.4}
			/>
			
			{/* Login Form Container */}
			<div className="relative z-10 w-screen h-screen bg-gradient-to-br from-black/30 via-transparent to-black/40 flex items-center justify-center">
				<div className="flex flex-col items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8 rounded-none md:rounded-xl w-screen h-screen md:h-auto md:w-full md:max-w-md shadow-2xl border border-white/30 dark:border-gray-700/30">
					<div className="text-center mb-4 flex flex-col items-center justify-center">
						<div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 shadow-lg">
							<CodeXml className="text-white size-12" />
						</div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bienvenido, inicia sesión</h1>
						<p className="text-gray-600 dark:text-gray-300">Inicia sesión en tu cuenta para continuar.</p>
					</div>

					<form className="w-full" onSubmit={handleLogin}>
						<div className="flex flex-col gap-2 mb-4 w-full">
							<p className="text-sm text-gray-600 dark:text-gray-400">Correo electrónico:</p>
							<input
								type="email"
								name="email"
								placeholder="tu@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading || isRedirecting}
								className="border-2 border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white transition-all duration-200"
								autoComplete="email"
							/>
							<p className="text-sm text-gray-600 dark:text-gray-400">Contraseña:</p>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									name="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={loading || isRedirecting}
									className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-md p-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white/90 dark:bg-gray-800/90 transition-all duration-200"
									autoComplete="current-password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									disabled={loading || isRedirecting}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 transition-colors"
								>
									{showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
								</button>
							</div>
						</div>

						{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 backdrop-blur-sm">{error}</div>}

						<div className="flex items-center justify-between w-full mb-8">
							<label className="flex items-center">
								<input
									type="checkbox"
									disabled={loading || isRedirecting}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
								/>
								<span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Recordarme</span>
							</label>

							<Link
								to="/forgot-password"
								className={`text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors ${loading || isRedirecting ? 'pointer-events-none opacity-50' : ''}`}
							>
								¿Olvidaste tu contraseña?
							</Link>
						</div>

						<button
							type="submit"
							disabled={loading || isRedirecting}
							className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-md p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
						>
							{loading || isRedirecting ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									{isRedirecting ? 'Redirigiendo...' : 'Iniciando sesión...'}
								</>
							) : (
								'Iniciar sesión'
							)}
						</button>
					</form>

					{/* Footer */}
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600 dark:text-gray-400">
							¿No tienes una cuenta?{' '}
							<Link
								to="/register"
								className={`font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors ${loading || isRedirecting ? 'pointer-events-none opacity-50' : ''}`}
							>
								Regístrate aquí
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LoginForm