import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { LoginCredentials } from '../types/auth';

export const LoginPage: React.FC = () => {
  const handleLogin = (credentials: LoginCredentials) => {
    console.log('Login attempt:', credentials);
    // Aquí implementarás la lógica de autenticación
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Bienvenido de vuelta
            </h1>
            <p className="text-secondary-600">
              Inicia sesión en tu cuenta para continuar
            </p>
          </div>

          {/* Login Form */}
          <LoginForm onSubmit={handleLogin} />

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              ¿No tienes una cuenta?{' '}
              <a href="/register" className="text-primary-600 hover:text-primary-500 font-medium transition-colors">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-secondary-500">
            Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
};