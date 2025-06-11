import EyeTrackingComponent from '../../../components/dashboardComponents/RobotTraking'
import { TrendingUp, Users, CheckCircle, DollarSign, Calendar, Clock } from 'lucide-react'

function MainHome() {
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

				{/* Grid 2 - Revenue Chart */}
				<div className="bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div2">
					<h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Ingresos por Servicio</h2>
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
								<p className="text-gray-700 dark:text-gray-300">Automatización de Procesos: 100$</p>
							</li>
							<li className="flex items-center gap-2">
								<div className="size-2 bg-orange-500 dark:bg-orange-500 rounded-full"></div>
								<p className="text-gray-700 dark:text-gray-300">Agentes IA: 25$</p>
							</li>
							<li className="flex items-center gap-2">
								<div className="size-2 bg-red-500 dark:bg-red-500 rounded-full"></div>
								<p className="text-gray-700 dark:text-gray-300">Desarrollo Web y Móvil: 1000$</p>
							</li>
						</ul>
					</div>
				</div>

				{/* Grid 3 - KPI Card: Monthly Revenue */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div3 flex flex-col justify-between'>
					<div className="flex items-center justify-between mb-4">
						<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
							<DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
						</div>
						<div className="flex items-center text-green-600 dark:text-green-400">
							<TrendingUp className="w-4 h-4 mr-1" />
							<span className="text-sm font-medium">+12.5%</span>
						</div>
					</div>
					<div>
						<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos Mensuales</h3>
						<p className="text-2xl font-bold text-gray-700 dark:text-gray-300">$1,240</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs mes anterior</p>
					</div>
				</div>

				{/* Grid 4 - KPI Card: Registered Users */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div4 flex flex-col justify-between'>
					<div className="flex items-center justify-between mb-4">
						<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
							<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="flex items-center text-blue-600 dark:text-blue-400">
							<TrendingUp className="w-4 h-4 mr-1" />
							<span className="text-sm font-medium">+8.2%</span>
						</div>
					</div>
					<div>
						<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuarios Registrados</h3>
						<p className="text-2xl font-bold text-gray-700 dark:text-gray-300">580</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">usuarios activos</p>
					</div>
				</div>

				{/* Grid 5 - Simulated Line Chart */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div5'>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Tendencia de Ventas</h3>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
							<span className="text-sm text-gray-600 dark:text-gray-400">Últimos 7 días</span>
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

				{/* Grid 6 - Recent Activity & Tasks Completed */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div6 flex flex-col'>
					<div className="mb-4">
						<div className="flex items-center justify-between mb-3">
							<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
								<CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
							</div>
							<span className="text-2xl font-bold text-gray-700 dark:text-gray-300">92%</span>
						</div>
						<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tareas Completadas Hoy</h3>
						<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
							<div className="bg-purple-600 h-2 rounded-full" style={{width: '92%'}}></div>
						</div>
					</div>
					
					<div className="flex-1">
						<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Actividad Reciente</h4>
						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<div className="flex-1">
									<p className="text-xs text-gray-600 dark:text-gray-400">Proyecto web completado</p>
									<p className="text-xs text-gray-500 dark:text-gray-500">hace 2 horas</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								<div className="flex-1">
									<p className="text-xs text-gray-600 dark:text-gray-400">Nueva reunión programada</p>
									<p className="text-xs text-gray-500 dark:text-gray-500">hace 4 horas</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
								<div className="flex-1">
									<p className="text-xs text-gray-600 dark:text-gray-400">Factura enviada</p>
									<p className="text-xs text-gray-500 dark:text-gray-500">hace 6 horas</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Grid 7 - Client Summary Table */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div7'>
					<h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">Clientes Recientes</h3>
					<div className="overflow-hidden">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-gray-200 dark:border-gray-700">
									<th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Cliente</th>
									<th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Estado</th>
									<th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">Total</th>
								</tr>
							</thead>
							<tbody className="space-y-2">
								<tr className="border-b border-gray-100 dark:border-gray-800">
									<td className="py-2 text-gray-700 dark:text-gray-300">TechCorp SA</td>
									<td className="py-2">
										<span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">Completado</span>
									</td>
									<td className="py-2 text-gray-700 dark:text-gray-300 font-medium">$2,500</td>
								</tr>
								<tr className="border-b border-gray-100 dark:border-gray-800">
									<td className="py-2 text-gray-700 dark:text-gray-300">StartupXYZ</td>
									<td className="py-2">
										<span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">En progreso</span>
									</td>
									<td className="py-2 text-gray-700 dark:text-gray-300 font-medium">$1,800</td>
								</tr>
								<tr>
									<td className="py-2 text-gray-700 dark:text-gray-300">InnovateLtd</td>
									<td className="py-2">
										<span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">Pendiente</span>
									</td>
									<td className="py-2 text-gray-700 dark:text-gray-300 font-medium">$3,200</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* Grid 8 - Quick Stats */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div8'>
					<h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">Estadísticas Rápidas</h3>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Calendar className="w-5 h-5 text-blue-500" />
								<span className="text-sm text-gray-600 dark:text-gray-400">Reuniones esta semana</span>
							</div>
							<span className="text-lg font-bold text-gray-700 dark:text-gray-300">8</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Clock className="w-5 h-5 text-orange-500" />
								<span className="text-sm text-gray-600 dark:text-gray-400">Horas trabajadas</span>
							</div>
							<span className="text-lg font-bold text-gray-700 dark:text-gray-300">42h</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<CheckCircle className="w-5 h-5 text-green-500" />
								<span className="text-sm text-gray-600 dark:text-gray-400">Proyectos activos</span>
							</div>
							<span className="text-lg font-bold text-gray-700 dark:text-gray-300">12</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<TrendingUp className="w-5 h-5 text-purple-500" />
								<span className="text-sm text-gray-600 dark:text-gray-400">Crecimiento mensual</span>
							</div>
							<span className="text-lg font-bold text-green-600 dark:text-green-400">+15.3%</span>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}

export default MainHome