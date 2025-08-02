import React from 'react'
import { Card } from '@shared/components/ui/card'
import { User } from 'lucide-react'
import { useDashboardStats } from '@shared/hooks/useDashboardStats'
import { useBreakpoint } from '@shared/components/ui/media-query'

const DoctorRevenueReport: React.FC = () => {
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
    <Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-transform duration-300 shadow-lg">
      <div className="bg-white dark:bg-background rounded-xl p-3 sm:p-4 overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300">
            Ingreso por Médico Tratante
          </h3>
        </div>

        <div className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : stats?.topTreatingDoctors && stats.topTreatingDoctors.length > 0 ? (
            isDesktop ? (
              <div>
                <table className="w-full">
                  <thead className="sticky top-0 bg-white dark:bg-background z-10">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-1 text-gray-600 dark:text-gray-400 font-semibold text-xs">Médico Tratante</th>
                      <th className="text-center py-2 px-1 text-gray-600 dark:text-gray-400 font-semibold text-xs">Casos</th>
                      <th className="text-right py-2 px-1 text-gray-600 dark:text-gray-400 font-semibold text-xs">Monto Total</th>
                      <th className="text-right py-2 px-1 text-gray-600 dark:text-gray-400 font-semibold text-xs">% del Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topTreatingDoctors.map((doctor, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-700 dark:text-gray-300 text-xs truncate">{doctor.doctor}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-1 text-center">
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {doctor.cases}
                          </span>
                        </td>
                        <td className="py-2 px-1 text-right">
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatCurrency(doctor.revenue)}</p>
                        </td>
                        <td className="py-2 px-1 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {((doctor.revenue / stats.totalRevenue) * 100).toFixed(1)}%
                            </p>
                            <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <div 
                                className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                                style={{ 
                                  width: `${stats.topTreatingDoctors.length > 0 ? 
                                    (doctor.revenue / Math.max(...stats.topTreatingDoctors.map(d => d.revenue))) * 100 : 0}%` 
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
                {stats.topTreatingDoctors.map((doctor, index) => (
                  <div 
                    key={index} 
                    className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm truncate">{doctor.doctor}</p>
                      </div>
                      <p className="text-base font-bold text-gray-700 dark:text-gray-300">{formatCurrency(doctor.revenue)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {doctor.cases} caso{doctor.cases !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {((doctor.revenue / stats.totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${stats.topTreatingDoctors.length > 0 ? 
                            (doctor.revenue / Math.max(...stats.topTreatingDoctors.map(d => d.revenue))) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No hay datos de médicos</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">No se encontraron registros de médicos tratantes</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default DoctorRevenueReport