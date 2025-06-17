import { useState } from 'react'
import { CodeXml, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../supabase/auth'
import { useAuth } from '../context/AuthContext'

function LoginForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const { refreshUser } = useAuth()
	const [showPassword, setShowPassword] = useState(false)

	const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		try {
			setError('')
			setLoading(true)
			
			console.log('Attempting to sign in with:', email)
			
			const { user, error: signInError } = await signIn(email, password)

			if (signInError) {
				console.error('Sign in error:', signInError)
				// Handle Supabase auth errors
				if (signInError.message.includes('Invalid login credentials')) {
					setError('Credenciales inválidas. Verifica tu email y contraseña.')
				} else if (signInError.message.includes('Email not confirmed')) {
					setError('Por favor confirma tu email antes de iniciar sesión.')
					navigate('/email-verification-notice')
					return
				} else if (signInError.message.includes('Too many requests')) {
					setError('Demasiados intentos. Espera un momento antes de intentar de nuevo.')
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

			// Check if email is verified
			if (!user.email_confirmed_at) {
				console.log('Email not confirmed, redirecting to verification notice')
				navigate('/email-verification-notice')
				return
			}

			// Refresh user data
			await refreshUser()

			// Simple email-based redirect logic
			if (user.email === 'juegosgeorge0502@gmail.com') {
				console.log('Owner email detected, redirecting to dashboard')
				navigate('/dashboard')
			} else {
				console.log('Regular user email detected, redirecting to form')
				navigate('/form')
			}

		} catch (err: any) {
			console.error('Login error:', err)
			setError('Error al iniciar sesión. Verifica tus credenciales o crea una cuenta.')
		}
		setLoading(false)
	}

	return (
		<div className="w-screen h-screen bg-dark flex items-center justify-center">
			<div className="flex flex-col items-center justify-center bg-white p-8 rounded-none md:rounded-lg w-screen h-screen md:h-auto md:w-full md:max-w-md shadow-2xl shadow-black/60">
				<div className="text-center mb-4 flex flex-col items-center justify-center">
					<div className="p-4 bg-blue-500 rounded-full mb-4">
						<CodeXml className="text-white size-12" />
					</div>
					<h1 className="text-2xl font-bold text-secondary-900 mb-2">Bienvenido, inicia sesión</h1>
					<p className="text-secondary-600">Inicia sesión en tu cuenta para continuar.</p>
				</div>

				<form className="w-full" onSubmit={handleLogin}>
					<div className="flex flex-col gap-2 mb-4 w-full">
						<p className="text-sm text-secondary-600">Correo electrónico:</p>
						<input
							type="email"
							name="email"
							placeholder="tu@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="border-2 border-dark rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
							autoComplete="email"
						/>
						<p className="text-sm text-secondary-600">Contraseña:</p>
						<div className="relative">
							<input
								type={showPassword ? 'text' : 'password'}
								name="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="border-2 border-dark rounded-md p-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
								autoComplete="current-password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
							>
								{showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
							</button>
						</div>
					</div>

					{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

					<div className="flex items-center justify-between w-full mb-8">
						<label className="flex items-center">
							<input type="checkbox" className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
							<span className="ml-2 text-sm text-secondary-600">Recordarme</span>
						</label>

						<Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-600 transition-colors">
							¿Olvidaste tu contraseña?
						</Link>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
					</button>
				</form>

				{/* Footer */}
				<div className="mt-6 text-center">
					<p className="text-sm">
						¿No tienes una cuenta?{' '}
						<Link to="/register" className="font-medium text-blue-500 hover:text-blue-600 transition-colors">
							Regístrate aquí
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}

export default LoginForm