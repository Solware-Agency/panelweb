import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';
import { RegisterCredentials } from '../types/auth';

export const RegisterPage: React.FC = () => {
  const handleRegister = (credentials: RegisterCredentials) => {
    console.log('Register attempt:', credentials);
    // Aquí implementarás la lógica de registro
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Crear nueva cuenta
            </h1>
            <p className="text-secondary-600">
              Únete a nosotros y comienza tu experiencia
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm onSubmit={handleRegister} />

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              ¿Ya tienes una cuenta?{' '}
              <a href="/login" className="text-primary-600 hover:text-primary-500 font-medium transition-colors">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-secondary-500">
            Al registrarte, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
};