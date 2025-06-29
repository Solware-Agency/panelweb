import React from 'react'
import { Card } from '@shared/components/ui/card'
import { MapPin } from 'lucide-react'
import { useDashboardStats } from '@shared/hooks/useDashboardStats'
import ReportExportButton from './ReportExportButton'

const OriginRevenueReport: React.FC = () => {
  const { data: stats, isLoading } = useDashboardStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Prepare data for PDF export
  const prepareTableData = () => {
    if (!stats?.revenueByOrigin) return { headers: [], data: [] }

    const headers = ['Procedencia', 'Casos', 'Monto Total', '% del Total']
    const data = stats.revenueByOrigin.map(origin => [
      origin.origin,
      origin.cases.toString(),
      formatCurrency(origin.revenue),
      origin.percentage.toFixed(1) + '%'
    ])

    return { headers, data }
  }

  const { headers, data } = prepareTableData()

  return (
    <Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg mb-6">
      <div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-0 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-500" />
            Ingreso por Procedencia
          </h3>
          <ReportExportButton
            title="Reporte de Ingresos por Procedencia"
            subtitle="Detalle de ingresos generados por cada procedencia"
            headers={headers}
            data={data}
            isLoading={isLoading}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Procedencia</th>
                <th className="text-center py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Casos</th>
                <th className="text-center py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">% del Total</th>
                <th className="text-right py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Monto Total</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
                  </td>
                </tr>
              ) : stats?.revenueByOrigin && stats.revenueByOrigin.length > 0 ? (
                stats.revenueByOrigin.map((origin, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4">
                      <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">{origin.origin}</p>
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        {origin.cases} caso{origin.cases !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {origin.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <p className="text-base font-bold text-gray-700 dark:text-gray-300">{formatCurrency(origin.revenue)}</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full" 
                          style={{ 
                            width: `${stats.revenueByOrigin.length > 0 ? 
                              (origin.revenue / Math.max(...stats.revenueByOrigin.map(o => o.revenue))) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No hay datos de procedencia</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}

export default OriginRevenueReport