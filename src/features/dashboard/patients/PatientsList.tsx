import React, { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/config'
import { useToast } from '@shared/hooks/use-toast'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { Card } from '@shared/components/ui/card'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { getAgeDisplay } from '@lib/supabase-service'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  User, 
  Search, 
  RefreshCw, 
  Mail, 
  Phone, 
  Calendar, 
  ChevronUp, 
  ChevronDown,
  ArrowUpDown,
  Cake
} from 'lucide-react'

interface Patient {
  id_number: string
  full_name: string
  date_of_birth: string
  email: string | null
  phone: string
  gender?: string | null
  created_at: string
  case_count: number
}

type SortField = 'full_name' | 'id_number' | 'date_of_birth' | 'created_at' | 'case_count'
type SortDirection = 'asc' | 'desc'

const PatientsList: React.FC = () => {
  const { toast } = useToast()
  const { profile } = useUserProfile()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isSearching, setIsSearching] = useState(false)

  // Query to fetch all unique patients
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unique-patients'],
    queryFn: async () => {
      try {
        // First get all medical records
        const { data: records, error } = await supabase
          .from('medical_records_clean')
          .select('id_number, full_name, date_of_birth, email, phone, created_at')
          .order('created_at', { ascending: false })
        
        if (error) throw error

        // Deduplicate by id_number
        const uniquePatients = new Map<string, Patient>()
        
        records?.forEach(record => {
          if (!uniquePatients.has(record.id_number)) {
            // Count cases for this patient
            const caseCount = records.filter(r => r.id_number === record.id_number).length
            
            uniquePatients.set(record.id_number, {
              ...record,
              case_count: caseCount
            })
          }
        })
        
        return Array.from(uniquePatients.values())
      } catch (error) {
        console.error('Error fetching patients:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  // Handle search on Enter key
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsSearching(true)
      setTimeout(() => setIsSearching(false), 500)
    }
  }, [])

  // Handle sort
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField, sortDirection])

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    if (!data) return []

    // Apply search filter
    let filtered = data.filter(patient => {
      if (!searchTerm) return true
      
      const searchLower = searchTerm.toLowerCase()
      return (
        patient.full_name.toLowerCase().includes(searchLower) ||
        patient.id_number.toLowerCase().includes(searchLower) ||
        (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
        patient.phone.toLowerCase().includes(searchLower)
      )
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'date_of_birth' || sortField === 'created_at') {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [data, searchTerm, sortField, sortDirection])

  // Sort icon component
  const SortIcon = useCallback(({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    )
  }, [sortField, sortDirection])

  // Mobile card component
  const PatientCard = useCallback(({ patient }: { patient: Patient }) => {
    const ageDisplay = patient.date_of_birth ? getAgeDisplay(patient.date_of_birth) : ''
    
    return (
      <div className="bg-white dark:bg-background rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{patient.full_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">CI: {patient.id_number}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Cake className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {patient.date_of_birth ? format(parseISO(patient.date_of_birth), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
              {ageDisplay && ` (${ageDisplay})`}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">{patient.phone}</span>
          </div>
          
          {patient.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{patient.email}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Registrado: {format(new Date(patient.created_at), 'dd/MM/yyyy', { locale: es })}
            </span>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            {patient.case_count} caso{patient.case_count !== 1 ? 's' : ''} registrado{patient.case_count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    )
  }, [])

  // Render loading state
  if (isLoading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-lg text-gray-700 dark:text-gray-300">Cargando pacientes...</span>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="p-3 sm:p-6">
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400">
            <p className="text-lg font-medium">Error al cargar los pacientes</p>
            <p className="text-sm mt-2">Verifica tu conexión a internet o contacta al administrador</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Page Title */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Pacientes</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
          Gestiona todos los pacientes registrados en el sistema
        </p>
      </div>
      
      {/* Search and Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, cédula, email o teléfono..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10 pr-4 py-2"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => refetch()}
          variant="outline"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>
      
      {/* Stats Card */}
      <Card className="mb-4 sm:mb-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total de Pacientes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{data?.length || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pacientes con Casos</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data?.filter(p => p.case_count > 0).length || 0}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Con Email</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data?.filter(p => p.email).length || 0}
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Mobile View - Cards */}
      <div className="block lg:hidden">
        <div className="space-y-3">
          {filteredAndSortedPatients.length > 0 ? (
            filteredAndSortedPatients.map((patient) => (
              <PatientCard key={patient.id_number} patient={patient} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No se encontraron pacientes</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Desktop View - Table */}
      <div className="hidden lg:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-background/50 backdrop-blur-[10px] sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('full_name')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Nombre
                      <SortIcon field="full_name" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('id_number')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Cédula
                      <SortIcon field="id_number" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('date_of_birth')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Fecha de Nacimiento
                      <SortIcon field="date_of_birth" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contacto
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Registrado
                      <SortIcon field="created_at" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('case_count')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Casos
                      <SortIcon field="case_count" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedPatients.length > 0 ? (
                  filteredAndSortedPatients.map((patient) => {
                    const ageDisplay = patient.date_of_birth ? getAgeDisplay(patient.date_of_birth) : ''
                    
                    return (
                      <tr key={patient.id_number} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{patient.full_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {patient.id_number}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {patient.date_of_birth ? (
                            <div className="flex items-center gap-2">
                              <span>{format(parseISO(patient.date_of_birth), 'dd/MM/yyyy', { locale: es })}</span>
                              {ageDisplay && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                  {ageDisplay}
                                </span>
                              )}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-gray-100">{patient.phone}</span>
                            </div>
                            {patient.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-gray-100">{patient.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {format(new Date(patient.created_at), 'dd/MM/yyyy', { locale: es })}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {patient.case_count} caso{patient.case_count !== 1 ? 's' : ''}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <div className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No se encontraron pacientes</p>
                          <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PatientsList