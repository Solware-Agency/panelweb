import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@lib/supabase/config'
import { updatePassword, getUserProfile } from '@lib/supabase/auth'
import { CheckCircle, AlertCircle, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react'

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

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...')
        console.log('Current URL:', window.location.href)
        console.log('Search params:', Object.fromEntries(searchParams.entries()))
        console.log('Hash:', window.location.hash)

        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        const errorCode = searchParams.get('error_code')

        if (error) {
          console.error('Auth callback error from URL:', { error, errorDescription, errorCode })
          setStatus('error')
          setMessage(error === 'access_denied' && errorCode === 'otp_expired'
            ? 'El enlace ha expirado. Por favor, solicita un nuevo enlace.'
            : `Error de autenticación: ${errorDescription || error}`)
          return
        }

        // Revisamos la sesión actual (ya debe estar activa si es confirmación)
        const { data, error: sessionError } = await supabase.auth.getSession()
        console.log('Resultado de getSession():', { data, sessionError })

        if (sessionError || !data.session?.user) {
          setStatus('error')
          setMessage('No se pudo verificar la sesión. Redirigiendo al login...')
          setTimeout(() => {
            navigate('/')
          }, 3000)
          return
        }

        const user = data.session.user
        console.log('Usuario:', user.email)
        const profile = await getUserProfile(user.id)

        if (user.email_confirmed_at) {
          setStatus('success')
          setMessage('¡Email verificado exitosamente! Redirigiendo...')

          setTimeout(() => {
            if (profile?.role === 'owner') {
              navigate('/dashboard')
            } else {
              navigate('/form')
            }
          }, 2000)
        } else {
          setStatus('error')
          setMessage('El email aún no está verificado. Revisa tu correo.')
          setTimeout(() => {
            navigate('/email-verification-notice')
          }, 3000)
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
  }, [navigate, searchParams])
  
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

			const { error } = await updatePassword(newPassword)

			if (error) {
				setPasswordError('Error al actualizar la contraseña. Inténtalo de nuevo.')
				return
			}

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
		<div className="w-screen h-screen bg-dark flex items-center justify-center">
			<div className="flex flex-col items-center justify-center bg-white p-8 rounded-none md:rounded-lg w-screen h-screen md:h-auto md:w-full md:max-w-md shadow-2xl shadow-black/60">
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

							<h1 className="text-2xl font-bold text-gray-900 mb-2">
								{status === 'loading' && 'Verificando...'}
								{status === 'success' && '¡Verificación Exitosa!'}
								{status === 'error' && 'Error de Verificación'}
							</h1>

							<p className="text-gray-600 text-center">{message || 'Procesando verificación...'}</p>
						</div>

						{status === 'loading' && (
							<div className="w-full">
								<div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
									<p className="text-sm text-center">Por favor espera mientras procesamos tu solicitud...</p>
								</div>
							</div>
						)}

						{status === 'error' && (
							<div className="w-full">
								<button
									onClick={() => navigate('/')}
									className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition-colors"
								>
									Ir al Login
								</button>
							</div>
						)}
					</>
				) : (
					<>
						<div className="text-center mb-6 flex flex-col items-center justify-center">
							<div className="p-4 bg-blue-500 rounded-full mb-4">
								<Lock className="text-white size-12" />
							</div>
							<h1 className="text-2xl font-bold text-gray-900 mb-2">Nueva Contraseña</h1>
							<p className="text-gray-600 text-center">
								Ingresa tu nueva contraseña para completar el restablecimiento.
							</p>
						</div>

						<form onSubmit={handlePasswordUpdate} className="w-full">
							<div className="flex flex-col gap-4 mb-4">
								<div>
									<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
										Nueva Contraseña:
									</label>
									<div className="relative">
										<input
											type={showPassword ? 'text' : 'password'}
											id="newPassword"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											required
											className="w-full border-2 border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="••••••••"
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

								<div>
									<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
										Confirmar Contraseña:
									</label>
									<div className="relative">
										<input
											type={showConfirmPassword ? 'text' : 'password'}
											id="confirmPassword"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											required
											className="w-full border-2 border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="••••••••"
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
							</div>

							{passwordError && (
								<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
									{passwordError}
								</div>
							)}

							<button
								type="submit"
								disabled={passwordLoading}
								className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
							</button>
						</form>
					</>
				)}
			</div>
		</div>
	)
}

export default AuthCallback
