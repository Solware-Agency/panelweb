import React from 'react'
import { TrendingUp, Users, DollarSign, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { BackgroundGradient } from '../../../components/ui/background-gradient'

const StatsPage: React.FC = () => {
	return (
		<div className="p-3 sm:p-6">
			<div className="mb-4 sm:mb-6">
				<h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
					Estadísticas Detalladas
				</h1>
				<p className="text-white">Análisis completo del rendimiento de tu negocio</p>
			</div>

			{/* KPI Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
				{/* Revenue Card */}
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
								<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
							</div>
							<div className="flex items-center text-green-600 dark:text-green-400">
								<ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
								<span className="text-xs sm:text-sm font-medium">+12.5%</span>
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos Totales</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">$85,240</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Este mes: $12,450</p>
						</div>
					</div>
				</BackgroundGradient>

				{/* Users Card */}
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
								<Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="flex items-center text-blue-600 dark:text-blue-400">
								<ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
								<span className="text-xs sm:text-sm font-medium">+8.2%</span>
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuarios Activos</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">2,580</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Nuevos este mes: 145</p>
						</div>
					</div>
				</BackgroundGradient>
				{/* Projects Card */}
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
								<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
							</div>
							<div className="flex items-center text-purple-600 dark:text-purple-400">
								<ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
								<span className="text-xs sm:text-sm font-medium">+15.3%</span>
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Proyectos Completados</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">127</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Este mes: 18</p>
						</div>
					</div>
				</BackgroundGradient>
				{/* Conversion Rate Card */}
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
								<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
							</div>
							<div className="flex items-center text-red-600 dark:text-red-400">
								<ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
								<span className="text-xs sm:text-sm font-medium">-2.1%</span>
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasa de Conversión</h3>
							<p className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">68.4%</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Promedio: 70.5%</p>
						</div>
					</div>
				</BackgroundGradient>
			</div>
			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
				{/* Revenue Trend Chart */}
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
							<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
								Tendencia de Ingresos
							</h3>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
								<span className="text-sm text-gray-600 dark:text-gray-400">Últimos 12 meses</span>
							</div>
						</div>
						<div className="relative h-48 sm:h-64 flex items-end justify-between gap-1 sm:gap-2">
							{/* Simulated line chart with more data points */}
							{[65, 78, 82, 75, 88, 92, 85, 95, 89, 98, 94, 100].map((height, index) => (
								<div
									key={index}
									className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm transition-all duration-200 hover:from-blue-600 hover:to-blue-400 hover:translate-y-[-4px]"
									style={{ height: `${height}%` }}
								></div>
							))}
						</div>
						<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-4 overflow-x-auto">
							{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((month) => (
								<span key={month} className="flex-shrink-0">
									{month}
								</span>
							))}
						</div>
					</div>
				</BackgroundGradient>
				{/* Service Distribution */}
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
							Distribución de Servicios
						</h3>
						<div className="flex items-center justify-center mb-4 sm:mb-6">
							<div className="relative size-36 sm:size-48">
								<svg className="size-full -rotate-90" viewBox="0 0 36 36">
									<circle
										cx="18"
										cy="18"
										r="14"
										fill="none"
										className="stroke-current text-gray-200 dark:text-neutral-700"
										strokeWidth="4"
									></circle>
									{/* Desarrollo Web - 60% */}
									<circle
										cx="18"
										cy="18"
										r="14"
										fill="none"
										className="stroke-current text-blue-500"
										strokeWidth="4"
										strokeDasharray="60 40"
										strokeDashoffset="0"
									></circle>
									{/* Automatización - 25% */}
									<circle
										cx="18"
										cy="18"
										r="14"
										fill="none"
										className="stroke-current text-green-500"
										strokeWidth="4"
										strokeDasharray="25 75"
										strokeDashoffset="-60"
									></circle>
									{/* Agentes IA - 15% */}
									<circle
										cx="18"
										cy="18"
										r="14"
										fill="none"
										className="stroke-current text-orange-500"
										strokeWidth="4"
										strokeDasharray="15 85"
										strokeDashoffset="-85"
									></circle>
								</svg>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-center">
										<p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">$85k</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
									</div>
								</div>
							</div>
						</div>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
									<span className="text-sm text-gray-600 dark:text-gray-400">Desarrollo Web</span>
								</div>
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">60% ($51k)</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-green-500 rounded-full"></div>
									<span className="text-sm text-gray-600 dark:text-gray-400">Automatización</span>
								</div>
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">25% ($21k)</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-orange-500 rounded-full"></div>
									<span className="text-sm text-gray-600 dark:text-gray-400">Agentes IA</span>
								</div>
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">15% ($13k)</span>
							</div>
						</div>
					</div>
				</BackgroundGradient>
			</div>

			{/* Detailed Tables */}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
				{/* Top Clients Table */}
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
							Clientes Principales
						</h3>
						<div className="overflow-x-auto">
							<table className="w-full min-w-full">
								<thead>
									<tr className="border-b border-gray-200 dark:border-gray-700">
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Cliente</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Proyectos</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Total</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-b border-gray-100 dark:border-gray-800">
										<td className="py-3">
											<div>
												<p className="font-medium text-gray-700 dark:text-gray-300 text-sm">TechCorp SA</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">Desarrollo Web</p>
											</div>
										</td>
										<td className="py-3 text-gray-700 dark:text-gray-300 text-sm">8</td>
										<td className="py-3 text-gray-700 dark:text-gray-300 font-medium text-sm">$24,500</td>
									</tr>
									<tr className="border-b border-gray-100 dark:border-gray-800">
										<td className="py-3">
											<div>
												<p className="font-medium text-gray-700 dark:text-gray-300 text-sm">InnovateLtd</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">Automatización</p>
											</div>
										</td>
										<td className="py-3 text-gray-700 dark:text-gray-300 text-sm">5</td>
										<td className="py-3 text-gray-700 dark:text-gray-300 font-medium text-sm">$18,200</td>
									</tr>
									<tr className="border-b border-gray-100 dark:border-gray-800">
										<td className="py-3">
											<div>
												<p className="font-medium text-gray-700 dark:text-gray-300 text-sm">StartupXYZ</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">Agentes IA</p>
											</div>
										</td>
										<td className="py-3 text-gray-700 dark:text-gray-300 text-sm">3</td>
										<td className="py-3 text-gray-700 dark:text-gray-300 font-medium text-sm">$12,800</td>
									</tr>
									<tr>
										<td className="py-3">
											<div>
												<p className="font-medium text-gray-700 dark:text-gray-300 text-sm">GlobalTech</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">Desarrollo Web</p>
											</div>
										</td>
										<td className="py-3 text-gray-700 dark:text-gray-300 text-sm">6</td>
										<td className="py-3 text-gray-700 dark:text-gray-300 font-medium text-sm">$15,600</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</BackgroundGradient>
				{/* Performance Metrics */}
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
							Métricas de Rendimiento
						</h3>
						<div className="space-y-4 sm:space-y-6">
							{/* Project Completion Rate */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Finalización</span>
									<span className="text-sm font-bold text-gray-700 dark:text-gray-300">94%</span>
								</div>
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
								</div>
							</div>

							{/* Client Satisfaction */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfacción del Cliente</span>
									<span className="text-sm font-bold text-gray-700 dark:text-gray-300">4.8/5</span>
								</div>
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div className="bg-blue-500 h-2 rounded-full" style={{ width: '96%' }}></div>
								</div>
							</div>

							{/* On-Time Delivery */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Entrega a Tiempo</span>
									<span className="text-sm font-bold text-gray-700 dark:text-gray-300">89%</span>
								</div>
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div className="bg-orange-500 h-2 rounded-full" style={{ width: '89%' }}></div>
								</div>
							</div>

							{/* Team Productivity */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Productividad del Equipo</span>
									<span className="text-sm font-bold text-gray-700 dark:text-gray-300">92%</span>
								</div>
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
								</div>
							</div>
						</div>
					</div>
				</BackgroundGradient>
			</div>
		</div>
	)
}

export default StatsPage
