import React, { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllUniquePatients } from '@lib/supabase-service'
import { Card } from '@shared/components/ui/card'
import { Input } from '@shared/components/ui/input'
import { Button } from '@shared/components/ui/button'
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
  UserRound
} from 'lucide-react'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { useToast } from '@shared/hooks/use-toast'

interface Patient {
  id_number: string
  full_name: string
  date_of_birth: string
  email: string | null
  phone: string
  created_at: string
}

type SortField = 'full_name' | 'id_number' | 'date_of_birth' | 'created_at'
type SortDirection = 'asc' | 'desc'

const PatientsList: React.FC = () => {
  const { toast } = useToast()
  const { profile } = useUserProfile()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isSearching, setIsSearching] = useState(false)

  // Query to fetch all unique patients
  const { data: patients, isLoading, error, refetch } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const { data, error } = await getAllUniquePatients()
      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    if (!patients || !patients.length) return []
    
    return patients.filter(patient => {
      const searchLower = searchTerm.toLowerCase()
      return (
        patient.full_name.toLowerCase().includes(searchLower) ||
        patient.id_number.toLowerCase().includes(searchLower) ||
        (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
        patient.phone.toLowerCase().includes(searchLower)
      )
    })
  }, [patients, searchTerm])

  // Sort patients
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]
      
      if (sortField === 'date_of_birth' || sortField === 'created_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [filteredPatients, sortField, sortDirection])

  // Handle sort
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField, sortDirection])

  // Sort icon component
  const SortIcon = useCallback(({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    )
  }, [sortField, sortDirection])

  // Patient card for mobile view
  const PatientCard = useCallback(({ patient }: { patient: Patient }) => {
    const ageDisplay = patient.date_of_birth ? getAgeDisplay(patient.date_of_birth) : ''
    
    return (
      <div className="bg-white dark:bg-background rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <UserRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{patient.full_name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">CI: {patient.id_number}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {patient.date_of_birth 
                  ? format(parseISO(patient.date_of_birth), 'dd/MM/yyyy', { locale: es })
                  : 'N/A'}
              </p>
              {ageDisplay && (
                <p className="text-xs text-blue-600 dark:text-blue-400">{ageDisplay}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <p className="text-sm text-gray-700 dark:text-gray-300">{patient.phone}</p>
          </div>
          
          {patient.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-sm text-gray-700 dark:text-gray-300 break-all">{patient.email}</p>
            </div>
          )}
        </div>
      </div>
    )
  }, [])

  // Handle search
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  if (error) {
    return (
      <div className="p-3 sm:p-6">
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
              <User className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-red-800 dark:text-red-300">Error al cargar pacientes</h2>
          </div>
          <p className="text-red-700 dark:text-red-400 mb-4">
            No se pudieron cargar los datos de pacientes. Por favor, intenta de nuevo más tarde.
          </p>
          <Button onClick={() => refetch()} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </Card>
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
            placeholder="Buscar por nombre, cédula, email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          className="whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>
      
      {/* Stats Card */}
      <Card className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white dark:bg-background">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <UserRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total de Pacientes</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {isLoading ? '...' : patients?.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Pacientes con Fecha de Nacimiento</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {isLoading ? '...' : patients?.filter(p => !!p.date_of_birth).length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Pacientes con Email</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {isLoading ? '...' : patients?.filter(p => !!p.email).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Mobile View - Cards */}
      <div className="block lg:hidden">
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-lg text-gray-700 dark:text-gray-300">Cargando pacientes...</span>
              </div>
            </div>
          ) : sortedPatients.length > 0 ? (
            sortedPatients.map(patient => (
              <PatientCard key={patient.id_number} patient={patient} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <UserRound className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No se encontraron pacientes</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Desktop View - Table */}
      <div className="hidden lg:block">
        <Card className="bg-white dark:bg-background">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-background/50 backdrop-blur-[10px] sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('full_name')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
                    >
                      Nombre
                      <SortIcon field="full_name" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('id_number')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
                    >
                      Cédula
                      <SortIcon field="id_number" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('date_of_birth')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
                    >
                      Fecha de Nacimiento
                      <SortIcon field="date_of_birth" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Teléfono
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
                    >
                      Registrado
                      <SortIcon field="created_at" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando pacientes...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedPatients.length > 0 ? (
                  sortedPatients.map(patient => {
                    const ageDisplay = patient.date_of_birth ? getAgeDisplay(patient.date_of_birth) : '';
                    
                    return (
                      <tr key={patient.id_number} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                              <UserRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{patient.full_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{patient.id_number}</td>
                        <td className="px-4 py-4">
                          {patient.date_of_birth ? (
                            <div>
                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                {format(parseISO(patient.date_of_birth), 'dd/MM/yyyy', { locale: es })}
                              </p>
                              {ageDisplay && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">{ageDisplay}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {patient.email || (
                            <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{patient.phone}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(patient.created_at), 'dd/MM/yyyy', { locale: es })}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <UserRound className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No se encontraron pacientes</p>
                        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
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