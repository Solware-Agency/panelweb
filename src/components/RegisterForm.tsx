import { UserRound, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signUp, sendVerificationEmail } from '../firebase/auth'

function RegisterForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [error, setError] = useState('')
	const navigate = useNavigate()

	const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (password !== confirmPassword) {
			setError('Passwords do not match.')
			return
		}
		try {
			const userCredential = await signUp(email, password)
			await sendVerificationEmail(userCredential.user)
			setError('Verification email sent. Please check your inbox.')
			navigate('/dashboard')
		} catch (err) {
			setError('Failed to register. Please try again.')
		}
	}

	return (
		<div className="w-screen h-screen bg-dark flex items-center justify-center">
			<div className="flex flex-col items-center justify-center bg-white p-8 rounded-none md:rounded-lg w-screen h-screen md:h-auto md:w-full md:max-w-md">
				<div className="text-center mb-4 flex flex-col items-center justify-center">
					<div className="p-4 bg-blue-500 rounded-full mb-4">
						<UserRound className="text-white size-12" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido, Registrate</h1>
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

					{error && <p className="text-red-500 text-sm mb-4">{error}</p>}

					<button
						type="submit"
						className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition-colors"
					>
						Registrarse
					</button>
				</form>

				{/* Footer */}
				<div className="mt-6 text-center">
					<p className="text-sm">
						¿Ya tienes una cuenta?{' '}
						<a href="/login" className="font-medium">
							Inicia sesión aquí
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}

export default RegisterForm