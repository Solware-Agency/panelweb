import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../firebase/auth'

function LoginForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		try {
			setError('')
			setLoading(true)
			const userCredential = await signIn(email, password)

			await userCredential.user.reload()
			const refreshedUser = userCredential.user

			// Check if email is verified
			if (!refreshedUser.emailVerified) {
				navigate('/email-verification-notice')
				return
			}

			navigate('/dashboard')
		} catch (err: any) {
			if (err.code === 'auth/user-not-found') {
				setError('No se encontró una cuenta con este correo electrónico.')
			} else if (err.code === 'auth/wrong-password') {
				setError('Contraseña incorrecta.')
			} else if (err.code === 'auth/invalid-email') {
				setError('Correo electrónico inválido.')
			} else if (err.code === 'auth/user-disabled') {
				setError('Esta cuenta ha sido deshabilitada.')
			} else {
				setError('Error al iniciar sesión. Verifica tus credenciales o crea una cuenta.')
			}
		}
		setLoading(false)
	}

	return (
		<div className="w-screen h-screen bg-dark flex items-center justify-center">
			<div className="flex flex-col items-center justify-center bg-white p-8 rounded-none md:rounded-lg w-screen h-screen md:h-auto md:w-full md:max-w-md shadow-2xl shadow-black/60">
				<div className="text-center mb-4 flex flex-col items-center justify-center">
					<div className="p-4 bg-blue-500 rounded-full mb-4">
						<Lock className="text-white size-12" />
					</div>
					<h1 className="text-2xl font-bold text-secondary-900 mb-2">Bienvenido, Inicia sesión</h1>
					<p className="text-secondary-600">Inicia sesión en tu cuenta para continuar</p>
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
						<input
							type="password"
							name="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="border-2 border-dark rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
							autoComplete="current-password"
						/>
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