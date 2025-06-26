import { useQuery } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/config'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export interface DashboardStats {
  totalRevenue: number
  uniquePatients: number
  completedCases: number
  monthlyRevenue: number
  newPatientsThisMonth: number
  revenueByBranch: Array<{ branch: string; revenue: number; percentage: number }>
  revenueByExamType: Array<{ examType: string; revenue: number; count: number }>
  salesTrendByMonth: Array<{ month: string; revenue: number }>
  topExamTypes: Array<{ examType: string; count: number; revenue: number }>
  totalCases: number
}

export const useDashboardStats = (selectedMonth?: Date) => {
  return useQuery({
    queryKey: ['dashboard-stats', selectedMonth?.toISOString()],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        // Get all records for general stats
        const { data: allRecords, error: allError } = await supabase
          .from('medical_records_clean')
          .select('*')

        if (allError) throw allError

        // Get current month data if selectedMonth is provided
        const currentMonth = selectedMonth || new Date()
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)

        const { data: monthRecords, error: monthError } = await supabase
          .from('medical_records_clean')
          .select('*')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString())

        if (monthError) throw monthError

        // Calculate total revenue
        const totalRevenue = allRecords?.reduce((sum, record) => sum + (record.total_amount || 0), 0) || 0

        // Calculate unique patients
        const uniquePatientIds = new Set(allRecords?.map(record => record.id_number) || [])
        const uniquePatients = uniquePatientIds.size

        // Calculate completed cases (assuming payment_status 'Completado' means completed)
        const completedCases = allRecords?.filter(record => record.payment_status === 'Completado').length || 0

        // Calculate monthly revenue
        const monthlyRevenue = monthRecords?.reduce((sum, record) => sum + (record.total_amount || 0), 0) || 0

        // Calculate new patients this month
        const existingPatientIds = new Set(
          allRecords?.filter(record => new Date(record.created_at) < monthStart)
            .map(record => record.id_number) || []
        )
        const monthPatientIds = new Set(monthRecords?.map(record => record.id_number) || [])
        const newPatientsThisMonth = Array.from(monthPatientIds).filter(id => !existingPatientIds.has(id)).length

        // Calculate revenue by branch
        const branchRevenue = new Map<string, number>()
        allRecords?.forEach(record => {
          const current = branchRevenue.get(record.branch) || 0
          branchRevenue.set(record.branch, current + (record.total_amount || 0))
        })

        const revenueByBranch = Array.from(branchRevenue.entries())
          .map(([branch, revenue]) => ({
            branch,
            revenue,
            percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
          }))
          .sort((a, b) => b.revenue - a.revenue)

        // Calculate revenue by exam type
        const examTypeRevenue = new Map<string, { revenue: number; count: number }>()
        allRecords?.forEach(record => {
          const current = examTypeRevenue.get(record.exam_type) || { revenue: 0, count: 0 }
          examTypeRevenue.set(record.exam_type, {
            revenue: current.revenue + (record.total_amount || 0),
            count: current.count + 1
          })
        })

        const revenueByExamType = Array.from(examTypeRevenue.entries())
          .map(([examType, data]) => ({
            examType,
            revenue: data.revenue,
            count: data.count
          }))
          .sort((a, b) => b.revenue - a.revenue)

        // Calculate sales trend by month (last 12 months)
        const monthlyTrend = new Map<string, number>()
        allRecords?.forEach(record => {
          const recordDate = new Date(record.created_at)
          const monthKey = format(recordDate, 'yyyy-MM')
          const current = monthlyTrend.get(monthKey) || 0
          monthlyTrend.set(monthKey, current + (record.total_amount || 0))
        })

        const salesTrendByMonth = Array.from(monthlyTrend.entries())
          .map(([month, revenue]) => ({ month, revenue }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-12) // Last 12 months

        // Calculate top exam types by frequency
        const examTypeCounts = new Map<string, { count: number; revenue: number }>()
        allRecords?.forEach(record => {
          const current = examTypeCounts.get(record.exam_type) || { count: 0, revenue: 0 }
          examTypeCounts.set(record.exam_type, {
            count: current.count + 1,
            revenue: current.revenue + (record.total_amount || 0)
          })
        })

        const topExamTypes = Array.from(examTypeCounts.entries())
          .map(([examType, data]) => ({
            examType,
            count: data.count,
            revenue: data.revenue
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5) // Top 5

        return {
          totalRevenue,
          uniquePatients,
          completedCases,
          monthlyRevenue,
          newPatientsThisMonth,
          revenueByBranch,
          revenueByExamType,
          salesTrendByMonth,
          topExamTypes,
          totalCases: allRecords?.length || 0
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export const useMonthSelector = () => {
  const currentDate = new Date()
  const months = []
  
  // Generate last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    months.push({
      value: date,
      label: format(date, 'MMMM yyyy', { locale: { localize: { month: (n: number) => {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        return monthNames[n]
      } } } })
    })
  }
  
  return months
}