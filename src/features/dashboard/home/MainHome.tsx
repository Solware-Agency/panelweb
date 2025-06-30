import EyeTrackingComponent from '@features/dashboard/home/RobotTraking'
import { TrendingUp, Users, DollarSign, ArrowRight, BarChart3, AlertTriangle, Clock, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboardStats } from '@shared/hooks/useDashboardStats'
import { YearSelector } from '@shared/components/ui/year-selector'
import { Card } from '@shared/components/ui/card'
import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useUserProfile } from '@shared/hooks/useUserProfile'

function MainHome() {
	const navigate = useNavigate()
	const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
	const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
	const { data: stats, isLoading, error } = useDashboardStats(selectedMonth, selectedYear)
	const { profile } = useUserProfile()
	const [hoveredBranch, setHoveredBranch] = useState<number | null>(null)

	if (error) {
		console.error('Error loading dashboard stats:', error)
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('es-VE', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount)
	}

	const handleMonthBarClick = (monthData: any) => {
		// FIXED: Use the monthIndex to create the correct date
		const clickedDate = new Date(selectedYear, monthData.monthIndex, 1)
		setSelectedMonth(clickedDate)
	}

	const handleYearChange = (year: number) => {
		setSelectedYear(year)
		// Update selected month to the same month in the new year
		setSelectedMonth(new Date(year, selectedMonth.getMonth(), 1))
	}

	return (
		<>
			<main className="p-3 sm:p-5">
				{/* Mobile-first responsive grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
					{/* Grid 1 - Enhanced Welcome Section */}
					<Card className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-1 lg:row-span-2 dark:bg-background bg-white rounded-xl py-4 sm:py-6 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between shadow-lg h-full cursor-pointer transition-all duration-300 hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
						<div className="flex-1 text-center sm:text-left mb-4 sm:mb-0 ">
							<div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-3">
								<div>
									<h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
										¡Bienvenido a Conspat!
									</h1>
									<div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
										{profile?.display_name ? (
											<span className="text-sm text-green-600 dark:text-green-400 font-medium">
												{profile.display_name}
											</span>
										) : (
											<>
												<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
												<span className="text-sm text-green-600 dark:text-green-400 font-medium">Sistema activo</span>
											</>
										)}
									</div>
								</div>
							</div>
							<p className="text-gray-600 dark:text-gray-300 mb-4 text-base sm:text-lg">
								Gestiona tus ingresos y estadisticas de empresa.
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
					</Card>

					{/* Grid 2 - Revenue by Branch Chart */}
					<Card
						className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-1 lg:row-span-2 dark:bg-background bg-white rounded-xl py-4 sm:py-6 px-4 sm:px-8 transition-all duration-300 cursor-pointer group shadow-lg h-full hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
					>
						<div className="h-full flex flex-col" onClick={() => navigate('/dashboard/stats')}>
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
								<div className="flex items-center gap-3 mb-3 sm:mb-0">
									<div>
										<h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
											Ingresos por Sede
										</h2>
									</div>
								</div>
								<div className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
									<span className="text-sm font-medium text-purple-700 dark:text-purple-300">Ver detalles</span>
									<ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
								</div>
							</div>

							<div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center justify-center flex-1 relative">
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
											{stats?.revenueByBranch.map((branch, index) => {
												const colors = [
													'text-blue-500',
													'text-green-500',
													'text-orange-500',
													'text-red-500',
													'text-purple-500',
												]
												const offset = stats.revenueByBranch.slice(0, index).reduce((sum, b) => sum + b.percentage, 0)
												return (
													<circle
														key={branch.branch}
														cx="18"
														cy="18"
														r="14"
														fill="none"
														className={`stroke-current ${colors[index % colors.length]}`}
														strokeWidth="4"
														strokeDasharray={`${branch.percentage} ${100 - branch.percentage}`}
														strokeDashoffset={-offset}
														strokeLinecap="round"
													></circle>
												)
											})}
										</svg>
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="text-center">
												<p className="text-xl font-bold text-gray-700 dark:text-gray-300">
													{isLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
											</div>
										</div>
									</div>
								</div>

								<div className="flex-1 w-full space-y-3 sm:space-y-4">
									{isLoading ? (
										<div className="space-y-3">
											{[1, 2, 3].map((i) => (
												<div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-12 rounded-xl"></div>
											))}
										</div>
									) : (
										stats?.revenueByBranch.slice(0, 4).map((branch, index) => {
											const colors = [
												{
													bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
													border: 'border-blue-200 dark:border-blue-800/30',
													text: 'text-blue-600 dark:text-blue-400',
													dot: 'bg-blue-500',
													hover: 'hover:bg-blue-100/80 dark:hover:bg-blue-900/40',
													tooltip: 'bg-blue-600 dark:bg-blue-500',
												},
												{
													bg: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
													border: 'border-green-200 dark:border-green-800/30',
													text: 'text-green-600 dark:text-green-400',
													dot: 'bg-green-500',
													hover: 'hover:bg-green-100/80 dark:hover:bg-green-900/40',
													tooltip: 'bg-green-600 dark:bg-green-500',
												},
												{
													bg: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
													border: 'border-orange-200 dark:border-orange-800/30',
													text: 'text-orange-600 dark:text-orange-400',
													dot: 'bg-orange-500',
													hover: 'hover:bg-orange-100/80 dark:hover:bg-orange-900/40',
													tooltip: 'bg-orange-600 dark:bg-orange-500',
												},
												{
													bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
													border: 'border-red-200 dark:border-red-800/30',
													text: 'text-red-600 dark:text-red-400',
													dot: 'bg-red-500',
													hover: 'hover:bg-red-100/80 dark:hover:bg-red-900/40',
													tooltip: 'bg-red-600 dark:bg-red-500',
												},
											]
											const color = colors[index % colors.length]
											return (
												<div
													key={branch.branch}
													className={`flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r ${color.bg} rounded-xl border ${color.border} relative ${color.hover} transition-all duration-300`}
													onMouseEnter={() => setHoveredBranch(index)}
													onMouseLeave={() => setHoveredBranch(null)}
												>
													<div className="flex items-center gap-2 sm:gap-3">
														<div className={`w-3 h-3 sm:w-4 sm:h-4 ${color.dot} rounded-full shadow-lg`}></div>
														<div>
															<p className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
																{branch.branch}
															</p>
														</div>
													</div>
													<div className="text-right">
														<span className={`text-base sm:text-lg font-bold ${color.text}`}>
															{formatCurrency(branch.revenue)}
														</span>
													</div>
													
													{/* Interactive Tooltip */}
													{hoveredBranch === index && (
														<div className={`absolute z-10 -top-24 left-1/2 transform -translate-x-1/2 ${color.tooltip} text-white rounded-lg p-3 shadow-lg min-w-[200px] animate-fade-in`}>
															<div className="text-center mb-2">
																<h3 className="font-bold">{branch.branch}</h3>
																<div className="w-full h-0.5 bg-white/30 my-1"></div>
															</div>
															<div className="grid grid-cols-2 gap-2 text-sm">
																<div>
																	<p className="text-white/70">Ingresos:</p>
																	<p className="font-bold">{formatCurrency(branch.revenue)}</p>
																</div>
																<div>
																	<p className="text-white/70">Porcentaje:</p>
																	<p className="font-bold">{branch.percentage.toFixed(1)}%</p>
																</div>
																<div className="col-span-2">
																	<p className="text-white/70">Período:</p>
																	<p className="font-bold">{format(selectedMonth, 'MMMM yyyy', { locale: es })}</p>
																</div>
															</div>
															<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-inherit"></div>
														</div>
													)}
												</div>
											)
										})
									)}
								</div>
							</div>
						</div>
					</Card>

					{/* Grid 3 - KPI Card: Monthly Revenue */}
					<Card
						className="col-span-1 sm:col-span-1 lg:col-span-2 row-span-1 lg:row-span-2 dark:bg-background bg-white rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:bg-white/90 group h-full hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
					>
						<div className="h-full flex flex-col justify-between" onClick={() => navigate('/dashboard/stats')}>
							<div className="flex items-center justify-between mb-4">
								<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
									<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center text-green-600 dark:text-green-400">
										<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
										<span className="text-xs sm:text-sm font-medium">{isLoading ? '...' : '+12.5%'}</span>
									</div>
									<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
								</div>
							</div>
							<div>
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos Mensuales</h3>
								<p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">
									{isLoading ? '...' : formatCurrency(stats?.monthlyRevenue || 0)}
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{format(selectedMonth, 'MMMM yyyy', { locale: es })}
								</p>
							</div>
						</div>
					</Card>

					{/* Grid 4 - KPI Card: Total de Casos */}
					<Card
						className="col-span-1 sm:col-span-1 lg:col-span-2 row-span-1 lg:row-span-2 dark:bg-background bg-white rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:bg-white/90 group h-full hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
					>
						<div className="h-full flex flex-col justify-between" onClick={() => navigate('/dashboard/stats')}>
							<div className="flex items-center justify-between mb-4">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
									<Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center text-blue-600 dark:text-blue-400">
										<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
										<span className="text-xs sm:text-sm font-medium">
											{isLoading ? '...' : `+${stats?.newPatientsThisMonth || 0}`}
										</span>
									</div>
									<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
								</div>
							</div>
							<div>
								<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Casos</h3>
								<p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">
									{isLoading ? '...' : stats?.totalCases || 0}
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">casos registrados</p>
							</div>
						</div>
					</Card>

					{/* Grid 5 - Médicos Tratantes */}
					<Card
						className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-1 lg:row-span-4 dark:bg-background bg-white rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:bg-white/90 group h-full hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
					>
						<div className="h-full flex flex-col" onClick={() => navigate('/dashboard/reports')}>
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2 sm:gap-3">
									<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
										<Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
									</div>
									<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">Médicos Tratantes</h3>
								</div>
								<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
							</div>

							<div className="space-y-3 flex-1">
								{isLoading ? (
									<div className="space-y-3">
										{[1, 2, 3].map((i) => (
											<div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-12 rounded-lg"></div>
										))}
									</div>
								) : stats?.topTreatingDoctors && stats.topTreatingDoctors.length > 0 ? (
									stats.topTreatingDoctors.slice(0, 3).map((doctor, index) => {
										const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500']
										return (
											<div key={doctor.doctor} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition">
												<div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{doctor.doctor}</p>
													<p className="text-xs text-gray-500 dark:text-gray-400">
														{doctor.cases} caso{doctor.cases !== 1 ? 's' : ''} • {formatCurrency(doctor.revenue)}
													</p>
												</div>
											</div>
										)
									})
								) : (
									<div className="flex items-center justify-center h-full">
										<div className="text-center">
											<Stethoscope className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
											<p className="text-sm text-gray-500 dark:text-gray-400">No hay datos de médicos</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</Card>

					{/* Grid 6 - 12-Month Sales Trend Chart with Year Selector */}
					<Card
						className="col-span-1 sm:col-span-2 lg:col-span-4 row-span-1 lg:row-span-2 dark:bg-background bg-white rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-all duration-300 cursor-pointer shadow-lg hover:bg-white/90 group h-full hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
					>
						<div className="h-full flex flex-col">
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
								<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
									Tendencia de Ventas
								</h3>
								{/* Year Selector with Arrows */}
								<div className="flex items-center gap-4">
									<YearSelector
										selectedYear={selectedYear}
										onYearChange={handleYearChange}
										minYear={2020}
										maxYear={new Date().getFullYear() + 2}
									/>
									<span className="text-sm text-gray-600 dark:text-gray-400">12 meses de {selectedYear}</span>
								</div>
							</div>
							<div className="relative h-16 sm:h-20 lg:h-24 flex items-end justify-between gap-1 sm:gap-2">
								{isLoading ? (
									<div className="flex items-center justify-center w-full h-full">
										<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
									</div>
								) : (
									stats?.salesTrendByMonth.map((month, _index) => {
										const maxRevenue = Math.max(...(stats?.salesTrendByMonth.map((m) => m.revenue) || [1]))
										const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
										const isSelected = month.isSelected
										return (
											<div
												key={month.month}
												className={`flex-1 rounded-t-sm hover:translate-y-[-4px] transition-all duration-200 cursor-pointer ${
													isSelected
														? 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-lg'
														: 'bg-gradient-to-t from-blue-500 to-blue-300 hover:from-blue-600 hover:to-blue-400'
												}`}
												style={{ height: `${Math.max(height, 20)}%` }} // FIXED: Increased minimum height for better UX
												title={`${format(new Date(month.month), 'MMM yyyy', { locale: es })}: ${formatCurrency(
													month.revenue,
												)}`}
												onClick={() => handleMonthBarClick(month)}
											></div>
										)
									})
								)}
							</div>
							<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
								{/* FIXED: Force Spanish month labels regardless of system language */}
								{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((m) => (
									<span key={m}>{m}</span>
								))}
							</div>
						</div>
					</Card>

					{/* Grid 7 - Top Exam Types (Normalized) */}
					<Card
						className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-1 lg:row-span-2 dark:bg-background bg-white rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-all duration-300 cursor-pointer shadow-lg hover:bg-white/90 group h-full hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
					>
						<div className="h-full flex flex-col" onClick={() => navigate('/dashboard/reports')}>
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">
									Estudios Más Frecuentes
								</h3>
								<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
							</div>
							<div className="space-y-2 sm:space-y-3 flex-1">
								{isLoading ? (
									<div className="space-y-3">
										{[1, 2, 3].map((i) => (
											<div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-12 rounded-lg"></div>
										))}
									</div>
								) : (
									stats?.topExamTypes.slice(0, 3).map((exam, index) => {
										const colors = [
											{
												bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
												text: 'text-blue-600 dark:text-blue-400',
												badge: 'bg-blue-500',
											},
											{
												bg: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
												text: 'text-green-600 dark:text-green-400',
												badge: 'bg-green-500',
											},
											{
												bg: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
												text: 'text-orange-600 dark:text-orange-400',
												badge: 'bg-orange-500',
											},
										]
										const color = colors[index]
										return (
											<div
												key={exam.examType}
												className={`flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r ${color.bg} rounded-lg`}
											>
												<div className="flex items-center gap-2 sm:gap-3">
													<div
														className={`w-6 h-6 sm:w-8 sm:h-8 ${color.badge} rounded-lg flex items-center justify-center`}
													>
														<span className="text-white font-bold text-xs sm:text-sm">{index + 1}</span>
													</div>
													<div>
														<p className="text-sm font-medium text-gray-700 dark:text-gray-300">{exam.examType}</p>
														<p className="text-xs text-gray-500 dark:text-gray-400">{exam.count} casos</p>
													</div>
												</div>
												<span className={`text-base sm:text-lg font-bold ${color.text}`}>
													{formatCurrency(exam.revenue)}
												</span>
											</div>
										)
									})
								)}
							</div>
						</div>
					</Card>

					{/* Grid 8 - Quick Actions & Status Indicators */}
					<Card
						className="col-span-1 sm:col-span-2 lg:col-span-3 row-span-1 lg:row-span-2 dark:bg-background bg-white rounded-xl py-4 sm:py-5 px-4 sm:px-6 transition-all duration-300 h-full hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 shadow-lg"
					>
						<div className="h-full flex flex-col">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">Estado del Sistema</h3>
								<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
							</div>
							<div className="space-y-2 sm:space-y-3 flex-1">
								{/* Incomplete Cases Alert */}
								<div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
									<div className="flex items-center gap-2 mb-1">
										<AlertTriangle className="w-4 h-4 text-orange-500" />
										<span className="text-sm font-medium text-orange-800 dark:text-orange-400">Casos Incompletos</span>
									</div>
									<p className="text-xs text-orange-700 dark:text-orange-300">
										{isLoading ? 'Cargando...' : `${stats?.incompleteCases || 0} casos pendientes de completar`}
									</p>
								</div>

								{/* Pending Payments Alert */}
								<div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
									<div className="flex items-center gap-2 mb-1">
										<Clock className="w-4 h-4 text-red-500" />
										<span className="text-sm font-medium text-red-800 dark:text-red-400">Pagos Pendientes</span>
									</div>
									<p className="text-xs text-red-700 dark:text-red-300">
										{isLoading ? 'Cargando...' : `${formatCurrency(stats?.pendingPayments || 0)} por cobrar`}
									</p>
								</div>

								{/* Quick Actions */}
								<button
									className="w-full p-2 sm:p-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
									onClick={() => navigate('/dashboard/stats')}
								>
									<BarChart3 className="w-4 h-4" />
									<span className="hidden sm:inline">Ver Estadísticas Completas</span>
									<span className="sm:hidden">Estadísticas</span>
								</button>
							</div>
						</div>
					</Card>
				</div>
			</main>
		</>
	)
}

export default MainHome