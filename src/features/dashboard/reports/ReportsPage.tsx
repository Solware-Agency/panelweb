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
	Stethoscope,
	Activity,
	Heart,
	Eye,
} from 'lucide-react'
import { Card } from '@shared/components/ui/card'
import { useDashboardStats } from '@shared/hooks/useDashboardStats'

const ReportsPage: React.FC = () => {
	const { data: stats, isLoading } = useDashboardStats()

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('es-VE', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount)
	}

	// Get exam type icon based on type
	const getExamTypeIcon = (examType: string) => {
		const type = examType.toLowerCase()
		if (type.includes('citologia')) {
			return <Eye className="w-4 h-4 text-white" />
		} else if (type.includes('biopsia')) {
			return <Activity className="w-4 h-4 text-white" />
		} else if (type.includes('inmunohistoquimica')) {
			return <Heart className="w-4 h-4 text-white" />
		}
		return <Stethoscope className="w-4 h-4 text-white" />
	}

	return (
		<div className="p-3 sm:p-6">
			{/* Quick Actions */}
			<div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<button className="bg-white dark:bg-background rounded-xl p-3 sm:p-4 transition-colors duration-300 flex items-center gap-2 sm:gap-3">
						<div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
							<Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="text-left">
							<p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Exportar PDF</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Reporte mensual</p>
						</div>
					</button>
				</Card>
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<button className="bg-white dark:bg-background rounded-xl p-3 sm:p-4 transition-colors duration-300 flex items-center gap-2 sm:gap-3">
						<div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
							<FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
						</div>
						<div className="text-left">
							<p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Generar Excel</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Datos completos</p>
						</div>
					</button>
				</Card>
			</div>

			{/* Services Performance */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
				{/* Top Medical Exam Types - UPDATED SECTION */}
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
							<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
								Tipos de Exámenes Más Solicitados
							</h3>
							<div className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
								<span className="text-sm font-medium text-purple-700 dark:text-purple-300">Servicios médicos</span>
							</div>
						</div>
						<div className="space-y-3 sm:space-y-4">
							{isLoading ? (
								<div className="space-y-3">
									{[1, 2, 3].map((i) => (
										<div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-xl"></div>
									))}
								</div>
							) : stats?.revenueByExamType && stats.revenueByExamType.length > 0 ? (
								stats.revenueByExamType.slice(0, 4).map((exam, index) => {
									const colors = [
										{
											bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
											border: 'border-blue-200 dark:border-blue-800/30',
											text: 'text-blue-600 dark:text-blue-400',
											iconBg: 'bg-blue-500',
										},
										{
											bg: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
											border: 'border-green-200 dark:border-green-800/30',
											text: 'text-green-600 dark:text-green-400',
											iconBg: 'bg-green-500',
										},
										{
											bg: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
											border: 'border-orange-200 dark:border-orange-800/30',
											text: 'text-orange-600 dark:text-orange-400',
											iconBg: 'bg-orange-500',
										},
										{
											bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
											border: 'border-red-200 dark:border-red-800/30',
											text: 'text-red-600 dark:text-red-400',
											iconBg: 'bg-red-500',
										},
									]
									const color = colors[index % colors.length]
									return (
										<div
											key={exam.examType}
											className={`p-3 sm:p-4 rounded-xl bg-gradient-to-r ${color.bg} border ${color.border}`}
										>
											<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
												<div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
													<div
														className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${color.iconBg}`}
													>
														{getExamTypeIcon(exam.examType)}
													</div>
													<div>
														<h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
															{exam.examType}
														</h4>
														<p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
															{exam.count} caso{exam.count !== 1 ? 's' : ''} realizados
														</p>
													</div>
												</div>
												<div className="text-right">
													<span className={`text-base sm:text-lg font-bold ${color.text}`}>
														{formatCurrency(exam.revenue)}
													</span>
													<div className="flex items-center gap-1">
														<TrendingUp className="w-3 h-3 text-green-500" />
														<span className="text-xs text-green-600 dark:text-green-400">
															{stats.totalRevenue > 0 ? ((exam.revenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
														</span>
													</div>
												</div>
											</div>
											<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
												<div
													className={`h-2 rounded-full ${color.iconBg}`}
													style={{ 
														width: `${stats.revenueByExamType.length > 0 ? 
															(exam.revenue / Math.max(...stats.revenueByExamType.map(e => e.revenue))) * 100 : 0}%` 
													}}
												></div>
											</div>
										</div>
									)
								})
							) : (
								<div className="text-center py-8">
									<Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
									<p className="text-gray-500 dark:text-gray-400">No hay datos de exámenes disponibles</p>
								</div>
							)}
						</div>
					</div>
				</Card>

				{/* Revenue Breakdown */}
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
							Desglose de Ingresos por Examen
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
									{isLoading ? null : stats?.revenueByExamType?.map((exam, index) => {
										const colors = ['text-blue-500', 'text-green-500', 'text-orange-500', 'text-red-500']
										const totalRevenue = stats.revenueByExamType.reduce((sum, e) => sum + e.revenue, 0)
										const percentage = totalRevenue > 0 ? (exam.revenue / totalRevenue) * 100 : 0
										const offset = stats.revenueByExamType.slice(0, index).reduce((sum, e) => {
											return sum + (totalRevenue > 0 ? (e.revenue / totalRevenue) * 100 : 0)
										}, 0)
										
										return (
											<circle
												key={exam.examType}
												cx="18"
												cy="18"
												r="14"
												fill="none"
												className={`stroke-current ${colors[index % colors.length]}`}
												strokeWidth="3"
												strokeDasharray={`${percentage} ${100 - percentage}`}
												strokeDashoffset={-offset}
												strokeLinecap="round"
											></circle>
										)
									})}
								</svg>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-center">
										<p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">
											{isLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
										</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
									</div>
								</div>
							</div>
						</div>
						<div className="space-y-3">
							{isLoading ? (
								<div className="space-y-2">
									{[1, 2, 3].map((i) => (
										<div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 rounded"></div>
									))}
								</div>
							) : stats?.revenueByExamType?.map((exam, index) => {
								const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500']
								const totalRevenue = stats.revenueByExamType.reduce((sum, e) => sum + e.revenue, 0)
								const percentage = totalRevenue > 0 ? (exam.revenue / totalRevenue) * 100 : 0
								
								return (
									<div key={exam.examType} className="flex items-center justify-between">
										<div className="flex items-center gap-2 sm:gap-3">
											<div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${colors[index % colors.length]}`}></div>
											<span className="text-sm text-gray-600 dark:text-gray-400">{exam.examType}</span>
										</div>
										<div className="text-right">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
												{percentage.toFixed(1)}%
											</span>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{formatCurrency(exam.revenue)} • {exam.count} casos
											</p>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				</Card>
			</div>

			{/* Client Analysis */}
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
				{/* Top Clients */}
				<Card className="xl:col-span-2 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
							<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
								Análisis de Pacientes
							</h3>
							<div className="flex items-center gap-2">
								<Star className="w-4 h-4 text-yellow-500" />
								<span className="text-sm text-gray-600 dark:text-gray-400">Pacientes Frecuentes</span>
							</div>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full min-w-full">
								<thead>
									<tr className="border-b border-gray-200 dark:border-gray-700">
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Paciente</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Casos</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Ingresos</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm hidden sm:table-cell">
											Último Examen
										</th>
										<th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Estado</th>
									</tr>
								</thead>
								<tbody>
									{[
										{
											name: 'María González',
											idNumber: '12345678',
											cases: 3,
											revenue: 450,
											lastExam: 'Citología',
											status: 'Activo',
											tier: 'VIP',
										},
										{
											name: 'Carlos Rodríguez',
											idNumber: '87654321',
											cases: 2,
											revenue: 320,
											lastExam: 'Biopsia',
											status: 'Activo',
											tier: 'Premium',
										},
										{
											name: 'Ana Martínez',
											idNumber: '11223344',
											cases: 2,
											revenue: 280,
											lastExam: 'Inmunohistoquímica',
											status: 'Completado',
											tier: 'Standard',
										},
										{
											name: 'Luis Pérez',
											idNumber: '44332211',
											cases: 1,
											revenue: 150,
											lastExam: 'Citología',
											status: 'En Progreso',
											tier: 'Standard',
										},
										{
											name: 'Carmen Silva',
											idNumber: '55667788',
											cases: 1,
											revenue: 120,
											lastExam: 'Biopsia',
											status: 'Activo',
											tier: 'Standard',
										},
									].map((patient, index) => (
										<tr
											key={index}
											className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
										>
											<td className="py-4">
												<div className="flex items-center gap-2 sm:gap-3">
													{patient.tier === 'VIP' && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />}
													{patient.tier === 'Premium' && <Award className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />}
													<div>
														<p className="font-medium text-gray-700 dark:text-gray-300 text-sm">{patient.name}</p>
														<p className="text-xs text-gray-500 dark:text-gray-400">{patient.idNumber}</p>
													</div>
												</div>
											</td>
											<td className="py-4 text-gray-700 dark:text-gray-300 text-sm">{patient.cases}</td>
											<td className="py-4 text-gray-700 dark:text-gray-300 font-medium text-sm">
												${patient.revenue.toLocaleString()}
											</td>
											<td className="py-4 hidden sm:table-cell">
												<span className="text-sm text-gray-600 dark:text-gray-400">{patient.lastExam}</span>
											</td>
											<td className="py-4">
												<span
													className={`px-2 py-1 text-xs font-medium rounded-full ${
														patient.status === 'Activo'
															? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
															: patient.status === 'En Progreso'
																? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
																: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
													}`}
												>
													{patient.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</Card>
				{/* Client Metrics */}
				<Card className="grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
						<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
							Métricas de Pacientes
						</h3>
						<div className="space-y-4 sm:space-y-6">
							<div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
								<Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
								<p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
									{isLoading ? '...' : stats?.uniquePatients || 0}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">Pacientes Únicos</p>
							</div>

							<div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
								<DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
								<p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
									{isLoading ? '...' : formatCurrency(stats?.totalRevenue && stats?.uniquePatients ? stats.totalRevenue / stats.uniquePatients : 0)}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">Valor Promedio por Paciente</p>
							</div>

							<div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
								<Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
								<p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
									{isLoading ? '...' : stats?.totalCases && stats?.uniquePatients ? (stats.totalCases / stats.uniquePatients).toFixed(1) : '0'}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">Casos Promedio por Paciente</p>
							</div>

							<div className="space-y-3">
								<div>
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm text-gray-600 dark:text-gray-400">Tasa de Finalización</span>
										<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
											{isLoading ? '...' : stats?.totalCases ? `${((stats.completedCases / stats.totalCases) * 100).toFixed(1)}%` : '0%'}
										</span>
									</div>
									<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
										<div 
											className="bg-green-500 h-2 rounded-full" 
											style={{ 
												width: `${stats?.totalCases ? (stats.completedCases / stats.totalCases) * 100 : 0}%` 
											}}
										></div>
									</div>
								</div>
								<div>
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm text-gray-600 dark:text-gray-400">Pacientes Nuevos</span>
										<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
											{isLoading ? '...' : `+${stats?.newPatientsThisMonth || 0}`}
										</span>
									</div>
									<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
										<div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card>
			</div>

			{/* Performance Summary */}
			<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
				<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
					<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
						Resumen de Rendimiento
					</h3>
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
						{[
							{ 
								title: 'Casos Completados', 
								value: isLoading ? '...' : (stats?.completedCases || 0).toString(), 
								change: '+15%', 
								color: 'blue', 
								icon: FileText 
							},
							{ 
								title: 'Tiempo Promedio', 
								value: '3 días', 
								change: '-8%', 
								color: 'green', 
								icon: Calendar 
							},
							{ 
								title: 'Margen de Ganancia', 
								value: '68%', 
								change: '+5%', 
								color: 'purple', 
								icon: TrendingUp 
							},
							{ 
								title: 'Eficiencia del Servicio', 
								value: isLoading ? '...' : stats?.totalCases ? `${((stats.completedCases / stats.totalCases) * 100).toFixed(0)}%` : '0%', 
								change: '+12%', 
								color: 'orange', 
								icon: Award 
							},
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
			</Card>
		</div>
	)
}

export default ReportsPage