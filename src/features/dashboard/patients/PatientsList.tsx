import React, { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMedicalRecords } from '@lib/supabase-service'
import { Search, Filter, RefreshCw, User, Users, Phone, Mail, Calendar, ChevronUp, ChevronDown, UserCheck, AtSign } from 'lucide-react'
import { Card } from '@shared/components/ui/card'
import { Input } from '@shared/components/ui/input'
import { Button } from '@shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { getAgeDisplay } from '@lib/supabase-service'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

type SortField = 'full_name' | 'id_number' | 'date_of_birth' | 'phone' | 'email'
type SortDirection = 'asc' | 'desc'

interface PatientData {
  id_number: string
  full_name: string
  phone: string
  email: string | null
  date_of_birth: string | null
  lastVisit: string
}

const PatientsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('full_name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isSearching, setIsSearching] = useState(false)

  // Fetch all medical records
    queryKey: ['all-medical-records'],
  })

  // Process records to get unique patients
  const patients = useMemo(() => {
    if (!recordsData?.data) return []

    const patientMap = new Map<string, PatientData>()
    
    // Use a more efficient approach to process records
    const processedRecords = recordsData.data.reduce((map, record) => {
      if (!record.id_number) return map

      const existingPatient = map.get(record.id_number)
      const recordDate = new Date(record.created_at || record.date)

      if (!existingPatient) {
        map.set(record.id_number, {
          id_number: record.id_number,
          full_name: record.full_name,
          phone: record.phone,
          email: record.email,
          date_of_birth: record.date_of_birth,
          lastVisit: record.created_at || record.date,
          totalVisits: 1
        })
      } else {
        // Update last visit date if this record is newer
        const existingDate = new Date(existingPatient.lastVisit)
        if (recordDate > existingDate) {
          existingPatient.lastVisit = record.created_at || record.date
        }

        // Increment visit count
        existingPatient.totalVisits += 1

        // Update patient info if needed (in case it was updated in a newer record)
        if (record.full_name) existingPatient.full_name = record.full_name
        if (record.phone) existingPatient.phone = record.phone
        if (record.email) existingPatient.email = record.email
        if (record.date_of_birth) existingPatient.date_of_birth = record.date_of_birth

        map.set(record.id_number, existingPatient)
      }
      return map
    }, new Map<string, PatientData>())

    return Array.from(processedRecords.values())
  }, [recordsData?.data])

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    if (!patients) return []

    return patients.filter(patient => {
      const searchLower = searchTerm.toLowerCase()
      return (
        patient.full_name.toLowerCase().includes(searchLower) ||
        patient.id_number.toLowerCase().includes(searchLower) ||
        patient.phone.toLowerCase().includes(searchLower) ||
        (patient.email && patient.email.toLowerCase().includes(searchLower))
      )
    })
  }, [patients, searchTerm])

  // Sort patients
  const sortedPatients = useMemo(() => {
    if (!filteredPatients) return []

    return [...filteredPatients].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle null values
      if (aValue === null) aValue = ''
      if (bValue === null) bValue = ''

      // Special handling for date_of_birth
      if (sortField === 'date_of_birth') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      // String comparison for text fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
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

  // Handle search
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  // Refresh data
  const handleRefresh = useCallback(() => {
    setIsSearching(true)
    refetch().finally(() => setIsSearching(false))
  }, [refetch])

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

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPatients = patients.length
    const patientsWithEmail = patients.filter(p => p.email).length
    const totalVisits = patients.reduce((sum, p) => sum + p.totalVisits, 0)
    
    return {
      totalPatients,
      patientsWithEmail,
      totalVisits
    }
  }, [patients])

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-lg text-gray-700 dark:text-gray-300">Cargando pacientes...</span>
          </div>
        </div>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400">
            <p className="text-lg font-medium">Error al cargar los pacientes</p>
            <p className="text-sm mt-2">Verifica tu conexión a internet o contacta al administrador</p>
            <Button 
              onClick={handleRefresh} 
              className="mt-4 bg-red-500 hover:bg-red-600 text-white"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Render the component
  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, cédula, teléfono o email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2 whitespace-nowrap"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Pacientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPatients}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pacientes con Email</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.patientsWithEmail}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Visitas Totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalVisits}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Patients table */}
      <Card className="overflow-hidden">
        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
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
                    <button
                      onClick={() => handleSort('phone')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Teléfono
                      <SortIcon field="phone" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Email
                      <SortIcon field="email" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Última Visita
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Visitas
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedPatients.length > 0 ? (
                  sortedPatients.map((patient) => (
                    <tr key={patient.id_number} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{patient.full_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{patient.id_number}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {patient.date_of_birth ? (
                          <div>
                            <span>{format(parseISO(patient.date_of_birth), 'dd/MM/yyyy', { locale: es })}</span>
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                              ({getAgeDisplay(patient.date_of_birth)})
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">No disponible</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{patient.phone}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {patient.email || <span className="text-gray-500 dark:text-gray-400">No disponible</span>}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {format(new Date(patient.lastVisit), 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {patient.totalVisits}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <User className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                      <p className="text-lg font-medium">No se encontraron pacientes</p>
                      <p className="text-sm">
                        {searchTerm ? 'Intenta con otra búsqueda' : 'Aún no hay pacientes registrados'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile view - cards */}
        <div className="md:hidden">
          <div className="max-h-[500px] overflow-y-auto">
            {sortedPatients.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedPatients.map((patient) => (
                  <div 
                    key={`selected-${patient.id_number}`}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center mb-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{patient.full_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Cédula: {patient.id_number}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {patient.date_of_birth ? (
                            <>
                              {format(parseISO(patient.date_of_birth), 'dd/MM/yyyy', { locale: es })}
                              <span className="ml-2 text-blue-600 dark:text-blue-400">
                                ({getAgeDisplay(patient.date_of_birth)})
                              </span>
                            </>
                          ) : (
                            'Fecha de nacimiento no disponible'
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600 dark:text-gray-300">{patient.phone}</span>
                      </div>
                      
                      {patient.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600 dark:text-gray-300">{patient.email}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400">
                          Última visita: {format(new Date(patient.lastVisit), 'dd/MM/yyyy', { locale: es })}
                        </div>
                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {patient.totalVisits} visita{patient.totalVisits !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <User className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-lg font-medium">No se encontraron pacientes</p>
                <p className="text-sm">
                  {searchTerm ? 'Intenta con otra búsqueda' : 'Aún no hay pacientes registrados'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default PatientsList