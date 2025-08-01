import React from 'react'
import { Card } from '@shared/components/ui/card'
import { MapPin } from 'lucide-react'
import { useDashboardStats } from '@shared/hooks/useDashboardStats'
import { useBreakpoint } from '@shared/components/ui/media-query'

const OriginRevenueReport: React.FC = () => {
  const { data: stats, isLoading } = useDashboardStats()
  const isDesktop = useBreakpoint('lg')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
		<Card className="h-full hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-transform duration-300 shadow-lg">
			<div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 overflow-hidden h-full flex flex-col">
				<div className="flex items-center gap-3 mb-6 flex-shrink-0">
					<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
						<MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
					</div>
					<h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300">
						Ingreso por Procedencia
					</h3>
				</div>

				<div className="flex-1 overflow-hidden">
					{isLoading ? (
						<div className="flex items-center justify-center h-full">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
						</div>
					) : stats?.revenueByOrigin && stats.revenueByOrigin.length > 0 ? (
						isDesktop ? (
							<div className="h-full overflow-y-auto">
								<table className="w-full">
									<thead className="sticky top-0 bg-white dark:bg-background z-10">
										<tr className="border-b border-gray-200 dark:border-gray-700">
											<th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-semibold text-xs">Procedencia</th>
											<th className="text-center py-3 px-2 text-gray-600 dark:text-gray-400 font-semibold text-xs">Casos</th>
											<th className="text-center py-3 px-2 text-gray-600 dark:text-gray-400 font-semibold text-xs">% del Total</th>
											<th className="text-right py-3 px-2 text-gray-600 dark:text-gray-400 font-semibold text-xs">Monto Total</th>
										</tr>
									</thead>
									<tbody>
										{stats.revenueByOrigin.map((origin, index) => (
											<tr
												key={index}
												className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
											>
												<td className="py-3 px-2">
													<div className="flex items-center gap-2">
														<div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
															<MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
														</div>
														<div className="min-w-0 flex-1">
															<p className="font-semibold text-gray-700 dark:text-gray-300 text-xs truncate">{origin.origin}</p>
														</div>
													</div>
												</td>
												<td className="py-3 px-2 text-center">
													<span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
														{origin.cases}
													</span>
												</td>
												<td className="py-3 px-2 text-center">
													<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
														{origin.percentage.toFixed(1)}%
													</span>
												</td>
												<td className="py-3 px-2 text-right">
													<div className="flex flex-col items-end gap-1">
														<p className="text-sm font-bold text-gray-700 dark:text-gray-300">
															{formatCurrency(origin.revenue)}
														</p>
														<div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
															<div
																className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
																style={{
																	width: `${
																		stats.revenueByOrigin.length > 0
																			? (origin.revenue / Math.max(...stats.revenueByOrigin.map((o) => o.revenue))) * 100
																			: 0
																	}%`,
																}}
															></div>
														</div>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							// Mobile card view
							<div className="space-y-4">
								{stats.revenueByOrigin.map((origin, index) => (
									<div 
										key={index} 
										className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
									>
										<div className="flex items-center gap-3 mb-3">
											<div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
												<MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-semibold text-gray-700 dark:text-gray-300 text-sm truncate">{origin.origin}</p>
											</div>
											<p className="text-base font-bold text-gray-700 dark:text-gray-300">
												{formatCurrency(origin.revenue)}
											</p>
										</div>
										
										<div className="flex items-center justify-between mb-3">
											<span className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
												{origin.cases} caso{origin.cases !== 1 ? 's' : ''}
											</span>
											<span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
												{origin.percentage.toFixed(1)}%
											</span>
										</div>
										
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
											<div
												className="bg-purple-500 h-2 rounded-full transition-all duration-300"
												style={{
													width: `${
														stats.revenueByOrigin.length > 0
															? (origin.revenue / Math.max(...stats.revenueByOrigin.map((o) => o.revenue))) * 100
															: 0
													}%`,
												}}
											></div>
										</div>
									</div>
								))}
							</div>
						)
					) : (
						<div className="flex flex-col items-center justify-center h-full text-center">
							<div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
								<MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
							</div>
							<p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No hay datos de procedencia</p>
							<p className="text-sm text-gray-500 dark:text-gray-400">No se encontraron registros de procedencia</p>
						</div>
					)}
				</div>
			</div>
		</Card>
	)
}

export default OriginRevenueReport