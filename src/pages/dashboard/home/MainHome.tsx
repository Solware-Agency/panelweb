import EyeTrackingComponent from '@/components/dashboardComponents/RobotTraking'
import { TrendingUp, Users, DollarSign, Calendar, ArrowRight, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BackgroundGradient } from '@/components/ui/background-gradient'

function MainHome() {
	const navigate = useNavigate()

	return (
		<>
			<main className="p-3 sm:p-5">
				{/* Mobile-first responsive grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
					{/* Grid 1 - Enhanced Welcome Section */}
					<BackgroundGradient
						containerClassName="col-span-1 sm:col-span-2 lg:col-span-3 row-span-1 lg:row-span-2"
						className="dark:bg-gray-900 bg-white/80 rounded-xl py-4 sm:py-6 px-4 sm:px-8 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between shadow-lg hover:shadow-xl h-full cursor-pointer"
					>
						<div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
							<div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-3">
								<div>
									<h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
										¡Bienvenido a Solware!
									</h1>
									<div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
										<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
										<span className="text-sm text-green-600 dark:text-green-400 font-medium">Sistema activo</span>
									</div>
								</div>
							</div>
							<p className="text-gray-600 dark:text-gray-300 mb-4 text-base sm:text-lg">
								Gestiona tus proyectos y revisa el progreso de tu equipo
							</p>
						</div>
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-5 animate-pulse"></div>
							<EyeTrackingComponent
								className={
									'size-24 sm:size-32 lg:size-40 drop-shadow-[0px_5px_10px_rgba(59,130,246,0.3)] dark:drop-shadow-[0px_5px_10px_rgba(147,197,253,0.3)] transition-all duration-300 hover:scale-105 relative z-10'
								}
							/>
						</div>
					</BackgroundGradient>

					{/* Grid 2 - Enhanced Revenue Chart */}
					<BackgroundGradient
						containerClassName="col-span-1 sm:col-span-2 lg:col-span-3 row-span-1 lg:row-span-2"
						className="dark:bg-gray-900 bg-white/80 rounded-xl py-4 sm:py-6 px-4 sm:px-8 transition-all duration-300 cursor-pointer hover:shadow-xl group shadow-lg h-full"
					>
						<div className="h-full flex flex-col" onClick={() => navigate('/dashboard/stats')}>
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
								<div className="flex items-center gap-3 mb-3 sm:mb-0">
									<div>
										<h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
											Ingresos por Servicio
										</h2>
									</div>
								</div>
								<div className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
									<span className="text-sm font-medium text-purple-700 dark:text-purple-300">Ver detalles</span>
									<ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
								</div>
							</div>

							<div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center justify-center flex-1">
								<div className="relative">
									<div className="relative size-32 sm:size-36 lg:size-44">
										<svg className="size-full -rotate-90" viewBox="0 0 36 36">
											<circle
												cx="18"
												cy="18"
												r="14"
												fill="none"
												className="stroke-current text-gray-200 dark:text-neutral-700"
												strokeWidth="4"
											></circle>
											<circle
												cx="18"
												cy="18"
												r="14"
												fill="none"
												className="stroke-current text-red-500"
												strokeWidth="4"
												strokeDasharray="100"
												strokeDashoffset="0"
												strokeLinecap="round"
											></circle>
											<circle
												cx="18"
												cy="18"
												r="14"
												fill="none"
												className="stroke-current text-orange-500"
												strokeWidth="4"
												strokeDasharray="100"
												strokeDashoffset="50"
												strokeLinecap="round"
											></circle>
											<circle
												cx="18"
												cy="18"
												r="14"
												fill="none"
												className="stroke-current text-blue-600"
												strokeWidth="4"
												strokeDasharray="100"
												strokeDashoffset="65"
												strokeLinecap="round"
											></circle>
										</svg>
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="text-center">
												<p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">$1,125</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
											</div>
										</div>
									</div>
								</div>

								<div className="flex-1 w-full space-y-3 sm:space-y-4">
									<div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
										<div className="flex items-center gap-2 sm:gap-3">
											<div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full shadow-lg"></div>
											<div>
												<p className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
													Automatización
												</p>
											</div>
										</div>
										<div className="text-right">
											<span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">$100</span>
										</div>
									</div>

									<div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800/30">
										<div className="flex items-center gap-2 sm:gap-3">
											<div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded-full shadow-lg"></div>
											<div>
												<p className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">Agentes IA</p>
											</div>
										</div>
										<div className="text-right">
											<span className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">$25</span>
										</div>
									</div>

									<div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800/30">
										<div className="flex items-center gap-2 sm:gap-3">
											<div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full shadow-lg"></div>
											<div>
												<p className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
													Desarrollo Web
												</p>
											</div>
										</div>
										<div className="text-right">
											<span className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">$1,000</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</BackgroundGradient>

					{/* Grid 3 - KPI Card: Monthly Revenue */}
					<BackgroundGradient
						containerClassName="col-span-1 sm:col-span-1 lg:col-span-2 row-span-1 lg:row-span-2"
						className="dark:bg-gray-900 bg-white/80 rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-colors duration-300 flex flex-col justify-between cursor-pointer hover:bg-white/90 group h-full"
					>
						<div className="h-full flex flex-col justify-between" onClick={() => navigate('/dashboard/stats')}>
							<div className="flex items-center justify-between mb-4">
								<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
									<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center text-green-600 dark:text-green-400">
										<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
										<span className="text-xs sm:text-sm font-medium">+12.5%</span>
									</div>
									<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
								</div>
							</div>
							<div>
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos Mensuales</h3>
								<p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">$1,240</p>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs mes anterior</p>
							</div>
						</div>
					</BackgroundGradient>

					{/* Grid 4 - KPI Card: Registered Users */}
					<BackgroundGradient
						containerClassName="col-span-1 sm:col-span-1 lg:col-span-2 row-span-1 lg:row-span-2"
						className="dark:bg-gray-900 bg-white/80 rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-colors duration-300 flex flex-col justify-between cursor-pointer hover:bg-white/90 group h-full"
					>
						<div className="h-full flex flex-col justify-between" onClick={() => navigate('/dashboard/stats')}>
							<div className="flex items-center justify-between mb-4">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
									<Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center text-blue-600 dark:text-blue-400">
										<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
										<span className="text-xs sm:text-sm font-medium">+8.2%</span>
									</div>
									<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
								</div>
							</div>
							<div>
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuarios Registrados</h3>
								<p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">580</p>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">usuarios activos</p>
							</div>
						</div>
					</BackgroundGradient>

					{/* Grid 5 - Calendar Preview */}
					<BackgroundGradient
						containerClassName="col-span-1 sm:col-span-2 lg:col-span-2 row-span-1 lg:row-span-4"
						className="dark:bg-gray-900 bg-white/80 rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-colors duration-300 flex flex-col cursor-pointer hover:bg-white/90 group h-full"
					>
						<div className="h-full flex flex-col" onClick={() => navigate('/dashboard/calendar')}>
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2 sm:gap-3">
									<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
										<Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
									</div>
									<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">Próximos Eventos</h3>
								</div>
								<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
							</div>

							<div className="space-y-3 flex-1">
								<div className="flex items-center gap-2 sm:gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
									<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
									<div className="flex-1">
										<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reunión con cliente</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">Hoy, 2:00 PM</p>
									</div>
								</div>
								<div className="flex items-center gap-2 sm:gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
									<div className="w-3 h-3 bg-green-500 rounded-full"></div>
									<div className="flex-1">
										<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Entrega de proyecto</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">Mañana, 10:00 AM</p>
									</div>
								</div>
								<div className="flex items-center gap-2 sm:gap-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
									<div className="w-3 h-3 bg-orange-500 rounded-full"></div>
									<div className="flex-1">
										<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Revisión semanal</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">Viernes, 4:00 PM</p>
									</div>
								</div>
							</div>
						</div>
					</BackgroundGradient>

					{/* Grid 6 - Simulated Line Chart */}
					<BackgroundGradient
						containerClassName="col-span-1 sm:col-span-2 lg:col-span-4 row-span-1 lg:row-span-2"
						className="dark:bg-gray-900 bg-white/80 rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-colors duration-300 cursor-pointer hover:bg-white/90 group h-full"
					>
						<div className="h-full flex flex-col" onClick={() => navigate('/dashboard/stats')}>
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
								<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
									Tendencia de Ventas
								</h3>
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
										<span className="text-sm text-gray-600 dark:text-gray-400">Últimos 7 días</span>
									</div>
									<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
								</div>
							</div>
							<div className="relative h-16 sm:h-20 lg:h-24 flex items-end justify-between gap-1 sm:gap-2">
								{/* Simulated bar chart */}
								<div
									className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm hover:translate-y-[-4px] transition-all duration-200"
									style={{ height: '60%' }}
								></div>
								<div
									className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm hover:translate-y-[-4px] transition-all duration-200"
									style={{ height: '80%' }}
								></div>
								<div
									className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm hover:translate-y-[-4px] transition-all duration-200"
									style={{ height: '45%' }}
								></div>
								<div
									className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm hover:translate-y-[-4px] transition-all duration-200"
									style={{ height: '90%' }}
								></div>
								<div
									className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm hover:translate-y-[-4px] transition-all duration-200"
									style={{ height: '70%' }}
								></div>
								<div
									className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm hover:translate-y-[-4px] transition-all duration-200"
									style={{ height: '100%' }}
								></div>
								<div
									className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm hover:translate-y-[-4px] transition-all duration-200"
									style={{ height: '85%' }}
								></div>
							</div>
							<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
								<span>Lun</span>
								<span>Mar</span>
								<span>Mié</span>
								<span>Jue</span>
								<span>Vie</span>
								<span>Sáb</span>
								<span>Dom</span>
							</div>
						</div>
					</BackgroundGradient>

					{/* Grid 7 - Top Services/Products */}
					<BackgroundGradient
						containerClassName="col-span-1 sm:col-span-2 lg:col-span-3 row-span-1 lg:row-span-2"
						className="dark:bg-gray-900 bg-white/80 rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-colors duration-300 cursor-pointer hover:bg-white/90 group h-full"
					>
						<div className="h-full flex flex-col" onClick={() => navigate('/dashboard/reports')}>
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">
									Servicios Más Vendidos
								</h3>
								<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
							</div>
							<div className="space-y-2 sm:space-y-3 flex-1">
								<div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
									<div className="flex items-center gap-2 sm:gap-3">
										<div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
											<span className="text-white font-bold text-xs sm:text-sm">1</span>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Desarrollo Web</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">15 proyectos</p>
										</div>
									</div>
									<span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">$45k</span>
								</div>
								<div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
									<div className="flex items-center gap-2 sm:gap-3">
										<div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
											<span className="text-white font-bold text-xs sm:text-sm">2</span>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Automatización</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">8 proyectos</p>
										</div>
									</div>
									<span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">$28k</span>
								</div>
								<div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
									<div className="flex items-center gap-2 sm:gap-3">
										<div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
											<span className="text-white font-bold text-xs sm:text-sm">3</span>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Agentes IA</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">5 proyectos</p>
										</div>
									</div>
									<span className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">$12k</span>
								</div>
							</div>
						</div>
					</BackgroundGradient>

					{/* Grid 8 - Quick Actions & Notifications */}
					<BackgroundGradient
						containerClassName="col-span-1 sm:col-span-2 lg:col-span-3 row-span-1 lg:row-span-2"
						className="dark:bg-gray-900 bg-white/80 rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-colors duration-300 h-full"
					>
						<div className="h-full flex flex-col">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">Acciones Rápidas</h3>
								<div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
							</div>
							<div className="space-y-2 sm:space-y-3 flex-1">
								<button
									className="w-full p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
									onClick={() => navigate('/dashboard/stats')}
								>
									<BarChart3 className="w-4 h-4" />
									<span className="hidden sm:inline">Ver Estadísticas Completas</span>
									<span className="sm:hidden">Estadísticas</span>
								</button>
								<button
									className="w-full p-2 sm:p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
									onClick={() => navigate('/dashboard/calendar')}
								>
									<Calendar className="w-4 h-4" />
									<span className="hidden sm:inline">Abrir Calendario</span>
									<span className="sm:hidden">Calendario</span>
								</button>
								<div className="p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
									<div className="flex items-center gap-2 mb-1">
										<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
										<span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Recordatorio</span>
									</div>
									<p className="text-xs text-yellow-700 dark:text-yellow-300">Tienes 3 tareas pendientes para hoy</p>
								</div>
							</div>
						</div>
					</BackgroundGradient>
				</div>
			</main>
		</>
	)
}

export default MainHome
