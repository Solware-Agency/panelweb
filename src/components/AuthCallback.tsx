import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/config'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...')
        
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('Error al verificar el email. Inténtalo de nuevo.')
          return
        }

        if (data.session?.user) {
          const user = data.session.user
          console.log('User authenticated via callback:', user.email)
          console.log('Email confirmed:', user.email_confirmed_at)
          
          if (user.email_confirmed_at) {
            setStatus('success')
            setMessage('¡Email verificado exitosamente! Redirigiendo...')
            
            // Redirect based on email
            setTimeout(() => {
              if (user.email === 'juegosgeorge0502@gmail.com') {
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
        } else {
          console.log('No session found, redirecting to login')
          setStatus('error')
          setMessage('No se pudo verificar la sesión. Redirigiendo al login...')
          setTimeout(() => {
            navigate('/login')
          }, 3000)
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err)
        setStatus('error')
        setMessage('Error inesperado. Redirigiendo al login...')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="w-screen h-screen bg-dark flex items-center justify-center">
      <div className="flex flex-col items-center justify-center bg-white p-8 rounded-none md:rounded-lg w-screen h-screen md:h-auto md:w-full md:max-w-md shadow-2xl shadow-black/60">
        <div className="text-center mb-6 flex flex-col items-center justify-center">
          <div className={`p-4 rounded-full mb-4 ${
            status === 'loading' ? 'bg-blue-500' :
            status === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {status === 'loading' && <RefreshCw className="text-white size-12 animate-spin" />}
            {status === 'success' && <CheckCircle className="text-white size-12" />}
            {status === 'error' && <AlertCircle className="text-white size-12" />}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Verificando Email...'}
            {status === 'success' && '¡Email Verificado!'}
            {status === 'error' && 'Error de Verificación'}
          </h1>
          
          <p className="text-gray-600 text-center">
            {message || 'Procesando verificación de email...'}
          </p>
        </div>

        {status === 'loading' && (
          <div className="w-full">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              <p className="text-sm text-center">
                Por favor espera mientras verificamos tu email...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="w-full">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition-colors"
            >
              Ir al Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthCallback