import { UserRound, Eye, EyeOff } from 'lucide-react'
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
	const navigate = useNavigate()

	const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		
		if (password !== confirmPassword) {
			setError('Las contraseñas no coinciden.')
			return
		}

		if (password.length < 6) {
			setError('La contraseña debe tener al menos 6 caracteres.')
			return
		}

		try {
			setError('')
			setMessage('')
			setLoading(true)
			
			const { user, error: signUpError } = await signUp(email, password)

			if (signUpError) {
				// Handle Supabase auth errors
				if (signUpError.message.includes('User already registered')) {
					setError('Ya existe una cuenta con este correo electrónico.')
				} else if (signUpError.message.includes('Password should be at least')) {
					setError('La contraseña es muy débil.')
				} else if (signUpError.message.includes('Unable to validate email address')) {
					setError('Correo electrónico inválido.')
				} else {
					setError('Error al crear la cuenta. Inténtalo de nuevo.')
				}
				return
			}

			if (user) {
				setMessage('Cuenta creada exitosamente. Se ha enviado un correo de verificación a tu email.')
				
				// Redirect to login after a short delay
				setTimeout(() => {
					navigate('/login')
				}, 3000)
			}
		} catch (err: any) {
			console.error('Registration error:', err)
			setError('Error al crear la cuenta. Inténtalo de nuevo.')
		}
		setLoading(false)
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
							className="border-2 border-gray-900 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
								className="border-2 border-gray-900 rounded-md p-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
								autoComplete="new-password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
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
								className="border-2 border-gray-900 rounded-md p-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
								autoComplete="new-password"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
							>
								{showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
							</button>
						</div>
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
						type="submit"
						disabled={loading}
						className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Creando cuenta...' : 'Registrarse'}
					</button>
				</form>

				{/* Footer */}
				<div className="mt-6 text-center">
					<p className="text-sm">
						¿Ya tienes una cuenta?{' '}
						<Link to="/login" className="font-medium text-blue-500 hover:text-blue-600 transition-colors">
							Inicia sesión aquí
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}

export default RegisterForm