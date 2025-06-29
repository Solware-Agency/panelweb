import React from 'react'
import { Card } from '@shared/components/ui/card'
import { Building } from 'lucide-react'
import { useDashboardStats } from '@shared/hooks/useDashboardStats'
import ReportExportButton from './ReportExportButton'

const BranchRevenueReport: React.FC = () => {
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
    if (!stats?.revenueByBranch) return { headers: [], data: [] }

    const headers = ['Sede', 'Monto Total', '% del Total']
    const data = stats.revenueByBranch.map(branch => [
      branch.branch,
      formatCurrency(branch.revenue),
      branch.percentage.toFixed(1) + '%'
    ])

    return { headers, data }
  }

  const { headers, data } = prepareTableData()

  const getBranchColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-purple-500',
    ]
    return colors[index % colors.length]
  }

  return (
    <Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg mb-6">
      <div className="bg-white dark:bg-background rounded-xl p-4 sm:p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-0 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-500" />
            Ingreso por Sede
          </h3>
          <ReportExportButton
            title="Reporte de Ingresos por Sede"
            subtitle="Detalle de ingresos generados por cada sede"
            headers={headers}
            data={data}
            isLoading={isLoading}
          />
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative size-36 sm:size-48">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                className="stroke-current text-gray-200 dark:text-neutral-700"
                strokeWidth="4"
              ></circle>
              {isLoading ? null : stats?.revenueByBranch.map((branch, index) => {
                const offset = stats.revenueByBranch.slice(0, index).reduce((sum, b) => sum + b.percentage, 0)
                return (
                  <circle
                    key={branch.branch}
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    className={`stroke-current ${getBranchColor(index)}`}
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
                <p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {isLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Sede</th>
                <th className="text-center py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">% del Total</th>
                <th className="text-right py-3 text-gray-600 dark:text-gray-400 font-medium text-sm">Monto Total</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : stats?.revenueByBranch && stats.revenueByBranch.length > 0 ? (
                stats.revenueByBranch.map((branch, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 ${getBranchColor(index)} rounded-full`}></div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">{branch.branch}</p>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {branch.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <p className="text-base font-bold text-gray-700 dark:text-gray-300">{formatCurrency(branch.revenue)}</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${getBranchColor(index)}`}
                          style={{ 
                            width: `${stats.revenueByBranch.length > 0 ? 
                              (branch.revenue / Math.max(...stats.revenueByBranch.map(b => b.revenue))) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No hay datos de sedes</p>
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

export default BranchRevenueReport