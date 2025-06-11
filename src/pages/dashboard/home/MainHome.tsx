import EyeTrackingComponent from '../../../components/dashboardComponents/RobotTraking'
import { TrendingUp, Users, CheckCircle, DollarSign, Calendar, Clock, ArrowRight, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function MainHome() {
	const navigate = useNavigate()

	return (
		<>
			<main className="m-5 parent">
				{/* Grid 1 - Welcome Section */}
				<div className="bg-white/80 dark:bg-gray-900/80 rounded-xl py-4 px-6 transition-colors duration-300 flex items-center justify-around div1">
					<div>
						<h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Bienvenido a Solware!</h1>
						<p className="text-gray-700 dark:text-gray-300">
							Recuerda revisar los proyectos pendientes y el calendario
						</p>
					</div>
					<EyeTrackingComponent
						className={
							'size-36 drop-shadow-[0px_0px_10px_rgba(0,0,0,0.5)] dark:drop-shadow-[0px_0px_10px_rgba(225,225,225,0.5)] transition duration-300'
						}
					/>
				</div>

				{/* Grid 2 - Revenue Chart (Clickable to Stats) */}
				<div 
					className="bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div2 cursor-pointer hover:bg-white/90 dark:hover:bg-gray-900/90 group"
					onClick={() => navigate('/dashboard/stats')}
				>
					<div className="flex items-center justify-between mb-2">
						<h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Ingresos por Servicio</h2>
						<ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
					</div>
					<div className="flex gap-5 items-center justify-center p-5">
						<div className="relative size-40">
							<svg className="size-full -rotate-90" viewBox="0 0 36 36">
								<circle
									cx="18"
									cy="18"
									r="14"
									fill="none"
									className="stroke-current text-gray-200 dark:text-neutral-700"
									strokeWidth="5"
								></circle>
								<circle
									cx="18"
									cy="18"
									r="14"
									fill="none"
									className="stroke-current text-red-500 dark:text-red-500"
									strokeWidth="5"
									strokeDasharray="100"
									strokeDashoffset="0"
								></circle>
								<circle
									cx="18"
									cy="18"
									r="14"
									fill="none"
									className="stroke-current text-orange-500 dark:text-orange-500"
									strokeWidth="5"
									strokeDasharray="100"
									strokeDashoffset="50"
								></circle>
								<circle
									cx="18"
									cy="18"
									r="14"
									fill="none"
									className="stroke-current text-blue-600 dark:text-blue-500"
									strokeWidth="5"
									strokeDasharray="100"
									strokeDashoffset="65"
								></circle>
							</svg>
						</div>
						<ul className="flex flex-col gap-2">
							<li className="flex items-center gap-2">
								<div className="size-2 bg-blue-500 dark:bg-blue-500 rounded-full"></div>
								<p className="text-gray-700 dark:text-gray-300">Automatización: $100</p>
							</li>
							<li className="flex items-center gap-2">
								<div className="size-2 bg-orange-500 dark:bg-orange-500 rounded-full"></div>
								<p className="text-gray-700 dark:text-gray-300">Agentes IA: $25</p>
							</li>
							<li className="flex items-center gap-2">
								<div className="size-2 bg-red-500 dark:bg-red-500 rounded-full"></div>
								<p className="text-gray-700 dark:text-gray-300">Desarrollo: $1000</p>
							</li>
						</ul>
					</div>
				</div>

				{/* Grid 3 - KPI Card: Monthly Revenue (Clickable to Stats) */}
				<div 
					className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div3 flex flex-col justify-between cursor-pointer hover:bg-white/90 dark:hover:bg-gray-900/90 group'
					onClick={() => navigate('/dashboard/stats')}
				>
					<div className="flex items-center justify-between mb-4">
						<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
							<DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
						</div>
						<div className="flex items-center gap-2">
							<div className="flex items-center text-green-600 dark:text-green-400">
								<TrendingUp className="w-4 h-4 mr-1" />
								<span className="text-sm font-medium">+12.5%</span>
							</div>
							<ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
						</div>
					</div>
					<div>
						<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos Mensuales</h3>
						<p className="text-2xl font-bold text-gray-700 dark:text-gray-300">$1,240</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs mes anterior</p>
					</div>
				</div>

				{/* Grid 4 - KPI Card: Registered Users (Clickable to Stats) */}
				<div 
					className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div4 flex flex-col justify-between cursor-pointer hover:bg-white/90 dark:hover:bg-gray-900/90 group'
					onClick={() => navigate('/dashboard/stats')}
				>
					<div className="flex items-center justify-between mb-4">
						<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
							<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="flex items-center gap-2">
							<div className="flex items-center text-blue-600 dark:text-blue-400">
								<TrendingUp className="w-4 h-4 mr-1" />
								<span className="text-sm font-medium">+8.2%</span>
							</div>
							<ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
						</div>
					</div>
					<div>
						<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuarios Registrados</h3>
						<p className="text-2xl font-bold text-gray-700 dark:text-gray-300">580</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">usuarios activos</p>
					</div>
				</div>

				{/* Grid 5 - Simulated Line Chart (Clickable to Stats) */}
				<div 
					className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div5 cursor-pointer hover:bg-white/90 dark:hover:bg-gray-900/90 group'
					onClick={() => navigate('/dashboard/stats')}
				>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Tendencia de Ventas</h3>
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
								<span className="text-sm text-gray-600 dark:text-gray-400">Últimos 7 días</span>
							</div>
							<ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
						</div>
					</div>
					<div className="relative h-24 flex items-end justify-between gap-2">
						{/* Simulated bar chart */}
						<div className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm" style={{height: '60%'}}></div>
						<div className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm" style={{height: '80%'}}></div>
						<div className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm" style={{height: '45%'}}></div>
						<div className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm" style={{height: '90%'}}></div>
						<div className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm" style={{height: '70%'}}></div>
						<div className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm" style={{height: '100%'}}></div>
						<div className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm" style={{height: '85%'}}></div>
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

				{/* Grid 6 - Calendar Preview (Clickable to Calendar) */}
				<div 
					className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div6 flex flex-col cursor-pointer hover:bg-white/90 dark:hover:bg-gray-900/90 group'
					onClick={() => navigate('/dashboard/calendar')}
				>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
								<Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
							</div>
							<h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Próximos Eventos</h3>
						</div>
						<ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
					</div>
					
					<div className="space-y-3 flex-1">
						<div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
							<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reunión con cliente</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">Hoy, 2:00 PM</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
							<div className="w-3 h-3 bg-green-500 rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Entrega de proyecto</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">Mañana, 10:00 AM</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
							<div className="w-3 h-3 bg-orange-500 rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Revisión semanal</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">Viernes, 4:00 PM</p>
							</div>
						</div>
					</div>
				</div>

				{/* Grid 7 - Top Services/Products (Clickable to Reports) */}
				<div 
					className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div7 cursor-pointer hover:bg-white/90 dark:hover:bg-gray-900/90 group'
					onClick={() => navigate('/dashboard/reports')}
				>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Servicios Más Vendidos</h3>
						<ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
					</div>
					<div className="space-y-3">
						<div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
									<span className="text-white font-bold text-sm">1</span>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Desarrollo Web</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">15 proyectos</p>
								</div>
							</div>
							<span className="text-lg font-bold text-blue-600 dark:text-blue-400">$45k</span>
						</div>
						<div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
									<span className="text-white font-bold text-sm">2</span>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Automatización</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">8 proyectos</p>
								</div>
							</div>
							<span className="text-lg font-bold text-green-600 dark:text-green-400">$28k</span>
						</div>
						<div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
									<span className="text-white font-bold text-sm">3</span>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Agentes IA</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">5 proyectos</p>
								</div>
							</div>
							<span className="text-lg font-bold text-orange-600 dark:text-orange-400">$12k</span>
						</div>
					</div>
				</div>

				{/* Grid 8 - Quick Actions & Notifications */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div8'>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Acciones Rápidas</h3>
						<div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
					</div>
					<div className="space-y-3">
						<button 
							className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
							onClick={() => navigate('/dashboard/stats')}
						>
							<BarChart3 className="w-4 h-4" />
							Ver Estadísticas Completas
						</button>
						<button 
							className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
							onClick={() => navigate('/dashboard/calendar')}
						>
							<Calendar className="w-4 h-4" />
							Abrir Calendario
						</button>
						<div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
							<div className="flex items-center gap-2 mb-1">
								<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
								<span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Recordatorio</span>
							</div>
							<p className="text-xs text-yellow-700 dark:text-yellow-300">Tienes 3 tareas pendientes para hoy</p>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}

export default MainHome