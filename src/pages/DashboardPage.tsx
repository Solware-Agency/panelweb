import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-secondary-900">
                Panel de Control
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">U</span>
                </div>
                <span className="text-sm font-medium text-secondary-700">Usuario</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            ¡Bienvenido al Dashboard!
          </h2>
          <p className="text-secondary-600">
            Aquí podrás gestionar toda tu información y configuraciones.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Usuarios', value: '1,234', icon: '👥', color: 'bg-blue-500' },
            { title: 'Ventas', value: '$12,345', icon: '💰', color: 'bg-green-500' },
            { title: 'Pedidos', value: '567', icon: '📦', color: 'bg-yellow-500' },
            { title: 'Productos', value: '89', icon: '🛍️', color: 'bg-purple-500' },
          ].map((stat, index) => (
            <div key={index} className="card p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Actividad Reciente
            </h3>
            <div className="space-y-4">
              {[
                { action: 'Nuevo usuario registrado', time: 'Hace 2 minutos', type: 'user' },
                { action: 'Pedido completado #1234', time: 'Hace 15 minutos', type: 'order' },
                { action: 'Producto actualizado', time: 'Hace 1 hora', type: 'product' },
                { action: 'Pago procesado', time: 'Hace 2 horas', type: 'payment' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 hover:bg-secondary-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-900">{activity.action}</p>
                    <p className="text-xs text-secondary-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Nuevo Usuario', icon: '👤', color: 'bg-blue-500' },
                { title: 'Crear Producto', icon: '📦', color: 'bg-green-500' },
                { title: 'Ver Reportes', icon: '📊', color: 'bg-yellow-500' },
                { title: 'Configuración', icon: '⚙️', color: 'bg-gray-500' },
              ].map((action, index) => (
                <button
                  key={index}
                  className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors group"
                >
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white text-lg mb-2 mx-auto group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-medium text-secondary-700">{action.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};