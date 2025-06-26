import React from 'react'
import {
	TrendingUp,
	Download,
	FileText,
	Calendar,
	DollarSign,
	Users,
	Star,
	Award,
	Earth,
	Settings,
	Bot,
	Lightbulb,
} from 'lucide-react'
import { BackgroundGradient } from '@shared/components/ui/background-gradient'

const ReportsPage: React.FC = () => {
	return (
		<div className="p-3 sm:p-6">
			{/* Quick Actions */}
			<div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<button className="bg-white/80 dark:bg-gray-900 rounded-xl p-3 sm:p-4 transition-colors duration-300 flex items-center gap-2 sm:gap-3">
						<div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
							<Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="text-left">
							<p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Exportar PDF</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Reporte mensual</p>
						</div>
					</button>
				</BackgroundGradient>
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<button className="bg-white/80 dark:bg-gray-900 rounded-xl p-3 sm:p-4 transition-colors duration-300 flex items-center gap-2 sm:gap-3">
						<div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
							<FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
						</div>
						<div className="text-left">
							<p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Generar Excel</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Datos completos</p>
						</div>
					</button>
				</BackgroundGradient>
			</div>

			{/* Services Performance */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
				{/* Top Services Detailed */}
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
							<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
								Servicios Más Vendidos
							</h3>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
								<span className="text-sm text-gray-600 dark:text-gray-400">Este trimestre</span>
							</div>
						</div>
						<div className="space-y-3 sm:space-y-4">
							{[
								{
									name: 'Desarrollo Web Completo',
									projects: 15,
									revenue: 45000,
									growth: 25,
									color: 'blue',
									icon: <Earth className="w-4 h-4 text-white" />,
								},
								{
									name: 'Automatización de Procesos',
									projects: 8,
									revenue: 28000,
									growth: 18,
									color: 'green',
									icon: <Settings className="w-4 h-4 text-white" />,
								},
								{
									name: 'Agentes IA Personalizados',
									projects: 5,
									revenue: 12000,
									growth: 35,
									color: 'purple',
									icon: <Bot className="w-4 h-4 text-white" />,
								},
								{
									name: 'Consultoría Tecnológica',
									projects: 12,
									revenue: 18000,
									growth: 12,
									color: 'orange',
									icon: <Lightbulb className="w-4 h-4 text-white" />,
								},
							].map((service, index) => (
								<div
									key={index}
									className={`p-3 sm:p-4 rounded-xl bg-gradient-to-r ${
										service.color === 'blue'
											? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
											: service.color === 'green'
												? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
												: service.color === 'purple'
													? 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
													: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20'
									} border border-gray-200 dark:border-gray-700`}
								>
									<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
										<div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
											<div
												className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg ${
													service.color === 'blue'
														? 'bg-blue-500'
														: service.color === 'green'
															? 'bg-green-500'
															: service.color === 'purple'
																? 'bg-purple-500'
																: 'bg-orange-500'
												}`}
											>
												{service.icon}
											</div>
											<div>
												<h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
													{service.name}
												</h4>
												<p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
													{service.projects} proyectos completados
												</p>
											</div>
										</div>
										<div className="text-right">
											<p
												className={`text-base sm:text-lg font-bold ${
													service.color === 'blue'
														? 'text-blue-600 dark:text-blue-400'
														: service.color === 'green'
															? 'text-green-600 dark:text-green-400'
															: service.color === 'purple'
																? 'text-purple-600 dark:text-purple-400'
																: 'text-orange-600 dark:text-orange-400'
												}`}
											>
												${service.revenue.toLocaleString()}
											</p>
											<div className="flex items-center gap-1">
												<TrendingUp className="w-3 h-3 text-green-500" />
												<span className="text-xs text-green-600 dark:text-green-400">+{service.growth}%</span>
											</div>
										</div>
									</div>
									<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
										<div
											className={`h-2 rounded-full ${
												service.color === 'blue'
													? 'bg-blue-500'
													: service.color === 'green'
														? 'bg-green-500'
														: service.color === 'purple'
															? 'bg-purple-500'
															: 'bg-orange-500'
											}`}
											style={{ width: `${(service.revenue / 45000) * 100}%` }}
										></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</BackgroundGradient>

				{/* Revenue Breakdown */}
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
							Desglose de Ingresos
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
										strokeWidth="3"
									></circle>
									{/* Desarrollo Web - 43% */}
									<circle
										cx="18"
										cy="18"
										r="14"
										fill="none"
										className="stroke-current text-blue-500"
										strokeWidth="3"
										strokeDasharray="43 57"
										strokeDashoffset="0"
									></circle>
									{/* Automatización - 27% */}
									<circle
										cx="18"
										cy="18"
										r="14"
										fill="none"
										className="stroke-current text-green-500"
										strokeWidth="3"
										strokeDasharray="27 73"
										strokeDashoffset="-43"
									></circle>
									{/* Consultoría - 18% */}
									<circle
										cx="18"
										cy="18"
										r="14"
										fill="none"
										className="stroke-current text-orange-500"
										strokeWidth="3"
										strokeDasharray="18 82"
										strokeDashoffset="-70"
									></circle>
									{/* IA - 12% */}
									<circle
										cx="18"
										cy="18"
										r="14"
										fill="none"
										className="stroke-current text-purple-500"
										strokeWidth="3"
										strokeDasharray="12 88"
										strokeDashoffset="-88"
									></circle>
								</svg>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-center">
										<p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">$103k</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">Total Q1</p>
									</div>
								</div>
							</div>
						</div>
						<div className="space-y-3">
							{[
								{ name: 'Desarrollo Web', percentage: 43, amount: 45000, color: 'blue' },
								{ name: 'Automatización', percentage: 27, amount: 28000, color: 'green' },
								{ name: 'Consultoría', percentage: 18, amount: 18000, color: 'orange' },
								{ name: 'Agentes IA', percentage: 12, amount: 12000, color: 'purple' },
							].map((item, index) => (
								<div key={index} className="flex items-center justify-between">
									<div className="flex items-center gap-2 sm:gap-3">
										<div
											className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
												item.color === 'blue'
													? 'bg-blue-500'
													: item.color === 'green'
														? 'bg-green-500'
														: item.color === 'orange'
															? 'bg-orange-500'
															: 'bg-purple-500'
											}`}
										></div>
										<span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
									</div>
									<div className="text-right">
										<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.percentage}%</span>
										<p className="text-xs text-gray-500 dark:text-gray-400">${item.amount.toLocaleString()}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</BackgroundGradient>
			</div>

			{/* Client Analysis */}
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
				{/* Top Clients */}
				<BackgroundGradient containerClassName="xl:col-span-2 grid" className="grid">
					<div className=" bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
							<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
								Análisis de Clientes
							</h3>
							<div className="flex items-center gap-2">
								<Star className="w-4 h-4 text-yellow-500" />
								<span className="text-sm text-gray-600 dark:text-gray-400">Clientes VIP</span>
							</div>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full min-w-full">
								<thead>
									<tr className="border-b border-gray-200 dark:border-gray-700">
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Cliente</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Proyectos</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Ingresos</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm hidden sm:table-cell">
											Satisfacción
										</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Estado</th>
									</tr>
								</thead>
								<tbody>
									{[
										{
											name: 'TechCorp SA',
											type: 'Empresa',
											projects: 8,
											revenue: 24500,
											satisfaction: 4.9,
											status: 'Activo',
											tier: 'VIP',
										},
										{
											name: 'InnovateLtd',
											type: 'Startup',
											projects: 5,
											revenue: 18200,
											satisfaction: 4.7,
											status: 'Activo',
											tier: 'Premium',
										},
										{
											name: 'StartupXYZ',
											type: 'Startup',
											projects: 3,
											revenue: 12800,
											satisfaction: 4.8,
											status: 'Completado',
											tier: 'Standard',
										},
										{
											name: 'GlobalTech',
											type: 'Corporación',
											projects: 6,
											revenue: 15600,
											satisfaction: 4.6,
											status: 'En Progreso',
											tier: 'Premium',
										},
										{
											name: 'LocalBiz',
											type: 'PYME',
											projects: 4,
											revenue: 8900,
											satisfaction: 4.5,
											status: 'Activo',
											tier: 'Standard',
										},
									].map((client, index) => (
										<tr
											key={index}
											className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
										>
											<td className="py-4">
												<div className="flex items-center gap-2 sm:gap-3">
													{client.tier === 'VIP' && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />}
													{client.tier === 'Premium' && <Award className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />}
													<div>
														<p className="font-medium text-gray-700 dark:text-gray-300 text-sm">{client.name}</p>
														<p className="text-xs text-gray-500 dark:text-gray-400">{client.type}</p>
													</div>
												</div>
											</td>
											<td className="py-4 text-gray-700 dark:text-gray-300 text-sm">{client.projects}</td>
											<td className="py-4 text-gray-700 dark:text-gray-300 font-medium text-sm">
												${client.revenue.toLocaleString()}
											</td>
											<td className="py-4 hidden sm:table-cell">
												<div className="flex items-center gap-2">
													<div className="flex">
														{[...Array(5)].map((_, i) => (
															<Star
																key={i}
																className={`w-3 h-3 ${
																	i < Math.floor(client.satisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-300'
																}`}
															/>
														))}
													</div>
													<span className="text-sm text-gray-600 dark:text-gray-400">{client.satisfaction}</span>
												</div>
											</td>
											<td className="py-4">
												<span
													className={`px-2 py-1 text-xs font-medium rounded-full ${
														client.status === 'Activo'
															? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
															: client.status === 'En Progreso'
																? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
																: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
													}`}
												>
													{client.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</BackgroundGradient>
				{/* Client Metrics */}
				<BackgroundGradient containerClassName="grid" className="grid">
					<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
							Métricas de Cliente
						</h3>
						<div className="space-y-4 sm:space-y-6">
							<div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
								<Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
								<p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">127</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">Clientes Totales</p>
							</div>

							<div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
								<DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
								<p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">$812</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">Valor Promedio</p>
							</div>

							<div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
								<Star className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
								<p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">4.7</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">Satisfacción Media</p>
							</div>

							<div className="space-y-3">
								<div>
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm text-gray-600 dark:text-gray-400">Retención</span>
										<span className="text-sm font-medium text-gray-700 dark:text-gray-300">89%</span>
									</div>
									<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
										<div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
									</div>
								</div>
								<div>
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm text-gray-600 dark:text-gray-400">Recomendación</span>
										<span className="text-sm font-medium text-gray-700 dark:text-gray-300">94%</span>
									</div>
									<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
										<div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</BackgroundGradient>
			</div>

			{/* Performance Summary */}
			<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
				<div className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 sm:p-6 transition-colors duration-300">
					<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
						Resumen de Rendimiento
					</h3>
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
						{[
							{ title: 'Proyectos Entregados', value: '127', change: '+15%', color: 'blue', icon: FileText },
							{ title: 'Tiempo Promedio', value: '18 días', change: '-8%', color: 'green', icon: Calendar },
							{ title: 'Margen de Ganancia', value: '68%', change: '+5%', color: 'purple', icon: TrendingUp },
							{ title: 'Eficiencia del Equipo', value: '94%', change: '+12%', color: 'orange', icon: Award },
						].map((metric, index) => (
							<div key={index} className="text-center">
								<div
									className={`p-2 sm:p-3 rounded-lg mb-3 mx-auto w-fit ${
										metric.color === 'blue'
											? 'bg-blue-100 dark:bg-blue-900/30'
											: metric.color === 'green'
												? 'bg-green-100 dark:bg-green-900/30'
												: metric.color === 'purple'
													? 'bg-purple-100 dark:bg-purple-900/30'
													: 'bg-orange-100 dark:bg-orange-900/30'
									}`}
								>
									<metric.icon
										className={`w-5 h-5 sm:w-6 sm:h-6 ${
											metric.color === 'blue'
												? 'text-blue-600 dark:text-blue-400'
												: metric.color === 'green'
													? 'text-green-600 dark:text-green-400'
													: metric.color === 'purple'
														? 'text-purple-600 dark:text-purple-400'
														: 'text-orange-600 dark:text-orange-400'
										}`}
									/>
								</div>
								<p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300 mb-1">{metric.value}</p>
								<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">{metric.title}</p>
								<div
									className={`text-xs sm:text-sm font-medium ${
										metric.change.startsWith('+')
											? 'text-green-600 dark:text-green-400'
											: 'text-red-600 dark:text-red-400'
									}`}
								>
									{metric.change} vs mes anterior
								</div>
							</div>
						))}
					</div>
				</div>
			</BackgroundGradient>
		</div>
	)
}

export default ReportsPage
