import React from 'react'
import { DollarSign, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@shared/components/ui/card'
import { useDashboardStats } from '@shared/hooks/useDashboardStats'

const RemainingAmount: React.FC = () => {
	const { data: stats, isLoading } = useDashboardStats()

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('es-VE', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount)
	}

	// Calculate pending payments percentage
	const pendingPaymentsPercentage = stats?.totalRevenue ? (stats.pendingPayments / stats.totalRevenue) * 100 : 0

	return (
		<Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-transform duration-300 shadow-lg">
			<div className="bg-white dark:bg-background rounded-xl p-3 sm:p-4">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
					<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-0 flex items-center gap-2">
						<AlertCircle className="w-5 h-5 text-red-500" />
						Casos por Cobrar
					</h3>
					<div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
						<span className="text-sm font-medium text-red-700 dark:text-red-300">Pagos pendientes</span>
					</div>
				</div>

				<div className="overflow-hidden">
					{isLoading ? (
						<div className="flex items-center justify-center h-full">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
						</div>
					) : (
						<div>
							{/* Summary Cards */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								{/* Amount Card */}
								<div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-3 border border-red-200 dark:border-red-800/30 hover:scale-[1.01] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-center">
									<div className="flex flex-col items-center text-center mb-3">
										<div className="p-3 bg-red-500 rounded-lg mb-2">
											<DollarSign className="w-6 h-6 text-white" />
										</div>
										<div>
											<p className="text-sm text-red-700 dark:text-red-300">Monto por Cobrar</p>
											<p className="text-2xl font-bold text-red-800 dark:text-red-200">
												{formatCurrency(stats?.pendingPayments || 0)}
											</p>
										</div>
									</div>
									<div className="w-full bg-red-200 dark:bg-red-800/50 rounded-full h-3">
										<div
											className="bg-red-500 h-3 rounded-full flex items-center justify-end pr-2"
											style={{ width: `${Math.min(pendingPaymentsPercentage, 100)}%` }}
										>
											{pendingPaymentsPercentage > 15 && (
												<span className="text-xs text-white font-medium">{pendingPaymentsPercentage.toFixed(1)}%</span>
											)}
										</div>
									</div>
									{pendingPaymentsPercentage <= 15 && (
										<div className="text-xs text-red-700 dark:text-red-300 mt-1 text-center">
											{pendingPaymentsPercentage.toFixed(1)}% del total de ingresos
										</div>
									)}
								</div>

								{/* Cases Card */}
								<div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-3 border border-orange-200 dark:border-orange-800/30 hover:scale-[1.01] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-center">
									<div className="flex flex-col items-center text-center mb-3">
										<div className="p-3 bg-orange-500 rounded-lg mb-2">
											<Users className="w-6 h-6 text-white" />
										</div>
										<div>
											<p className="text-sm text-orange-700 dark:text-orange-300">Casos Incompletos</p>
											<p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
												{stats?.incompleteCases || 0}
											</p>
										</div>
									</div>
									<div className="w-full bg-orange-200 dark:bg-orange-800/50 rounded-full h-3">
										<div
											className="bg-orange-500 h-3 rounded-full flex items-center justify-end pr-2"
											style={{
												width: `${stats?.totalCases ? (stats.incompleteCases / stats.totalCases) * 100 : 0}%`,
											}}
										>
											{stats?.totalCases && (stats.incompleteCases / stats.totalCases) * 100 > 15 && (
												<span className="text-xs text-white font-medium">
													{((stats.incompleteCases / stats.totalCases) * 100).toFixed(1)}%
												</span>
											)}
										</div>
									</div>
									{stats?.totalCases && (stats.incompleteCases / stats.totalCases) * 100 <= 15 && (
										<div className="text-xs text-orange-700 dark:text-orange-300 mt-1 text-center">
											{((stats.incompleteCases / stats.totalCases) * 100).toFixed(1)}% del total de casos
										</div>
									)}
								</div>
							</div>

							{/* Status Breakdown */}
							<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 overflow-hidden flex-1">
								<h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
									Desglose de Estatus
								</h4>
								<div className="space-y-3">
									{/* Completed Cases */}
									<div className="p-2 rounded-lg transition-all duration-200 hover:scale-[1.005] hover:bg-gray-50 dark:hover:bg-gray-700/50">
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center gap-2">
												<CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
												<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Casos Completados</span>
											</div>
											<span className="text-sm font-bold text-green-700 dark:text-green-300">
												{stats?.completedCases || 0} casos
											</span>
										</div>
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
											<div
												className="bg-green-500 h-2.5 rounded-full"
												style={{
													width: `${stats?.totalCases ? (stats.completedCases / stats.totalCases) * 100 : 0}%`,
												}}
											></div>
										</div>
										<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
											{stats?.totalCases ? ((stats.completedCases / stats.totalCases) * 100).toFixed(1) : 0}% del total
										</div>
									</div>

									{/* Incomplete Cases */}
									<div className="p-2 rounded-lg transition-all duration-200 hover:scale-[1.005] hover:bg-gray-50 dark:hover:bg-gray-700/50">
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center gap-2">
												<XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
												<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Casos Incompletos</span>
											</div>
											<span className="text-sm font-bold text-red-700 dark:text-red-300">
												{stats?.incompleteCases || 0} casos
											</span>
										</div>
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
											<div
												className="bg-red-500 h-2.5 rounded-full"
												style={{
													width: `${stats?.totalCases ? (stats.incompleteCases / stats.totalCases) * 100 : 0}%`,
												}}
											></div>
										</div>
										<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
											{stats?.totalCases ? ((stats.incompleteCases / stats.totalCases) * 100).toFixed(1) : 0}% del total
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</Card>
	)
}

export default RemainingAmount
