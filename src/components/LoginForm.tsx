import { Lock } from 'lucide-react'

function LoginForm() {
	return (
		<div className="w-screen h-screen bg-dark flex items-center justify-center">
			<div className="flex flex-col items-center justify-center bg-white p-8 rounded-none md:rounded-lg w-screen h-screen md:h-auto md:w-full md:max-w-md">
				<div className="text-center mb-4 flex flex-col items-center justify-center">
					<div className="p-4 bg-blue-500 rounded-full mb-4">
						<Lock className="text-white size-12" />
					</div>
					<h1 className="text-2xl font-bold text-secondary-900 mb-2">Bienvenido, Inicia sesión</h1>
					<p className="text-secondary-600">Inicia sesión en tu cuenta para continuar</p>
				</div>

				<form className="w-full">
					<div className="flex flex-col gap-2 mb-4 w-full">
						<p className="text-sm text-secondary-600">Correo electrónico:</p>
						<input
							type="email"
							name="email"
							placeholder="tu@email.com"
							required
							className="border-2 border-dark rounded-md p-2 w-full"
							autoComplete="email"
						/>
						<p className="text-sm text-secondary-600">Contraseña:</p>
						<input
							type="password"
							name="password"
							placeholder="••••••••"
							required
							className="border-2 border-dark rounded-md p-2 w-full"
							autoComplete="current-password"
						/>
					</div>

					<div className="flex items-center justify-between w-full mb-8">
						<label className="flex items-center">
							<input type="checkbox" className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
							<span className="ml-2 text-sm text-secondary-600">Recordarme</span>
						</label>

						<a href="#" className="text-sm text-blue-500 hover:text-blue-600 transition-colors">
							¿Olvidaste tu contraseña?
						</a>
					</div>

					<button type="submit" className="w-full bg-blue-500 text-white rounded-md p-2">
						Iniciar sesión
					</button>
				</form>

				{/* Footer */}
				<div className="mt-6 text-center">
					<p className="text-sm">
						¿No tienes una cuenta?{' '}
						<a href="/register" className="font-medium">
							Regístrate aquí
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}

export default LoginForm
