import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search, Filter, Eye } from 'lucide-react'
import type { MedicalCase } from '../../types/case'

interface CasesTableProps {
  cases: MedicalCase[]
  onCaseSelect: (case_: MedicalCase) => void
}

type SortField = 'codigo' | 'fechaIngreso' | 'nombreCompleto' | 'edad' | 'montoTotal'
type SortDirection = 'asc' | 'desc'

const CasesTable: React.FC<CasesTableProps> = ({ cases, onCaseSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('fechaIngreso')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const getStatusColor = (status: MedicalCase['estatus']) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'En Proceso':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'Cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedCases = useMemo(() => {
    let filtered = cases.filter(case_ => {
      const matchesSearch = 
        case_.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.estudio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.medicoTratante.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || case_.estatus === statusFilter

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'fechaIngreso') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

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

    return filtered
  }, [cases, searchTerm, statusFilter, sortField, sortDirection])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
  }

  return (
    <div className="bg-white/80 dark:bg-gray-900 rounded-xl transition-colors duration-300">
      {/* Search and Filter Controls */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código, cédula, estudio o médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
            >
              <option value="all">Todos los estatus</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredAndSortedCases.length} de {cases.length} casos
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('codigo')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Estatus / Código
                  <SortIcon field="codigo" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('fechaIngreso')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Fecha Ingreso
                  <SortIcon field="fechaIngreso" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('nombreCompleto')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Paciente
                  <SortIcon field="nombreCompleto" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('edad')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Edad
                  <SortIcon field="edad" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estudio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Médico Tratante
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('montoTotal')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Monto Total
                  <SortIcon field="montoTotal" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedCases.map((case_) => (
              <tr
                key={case_.codigo}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                onClick={() => onCaseSelect(case_)}
              >
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(case_.estatus)}`}>
                      {case_.estatus}
                    </span>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {case_.codigo}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(case_.fechaIngreso).toLocaleDateString('es-ES')}
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {case_.nombreCompleto}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {case_.cedula}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {case_.edad} años
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {case_.estudio}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {case_.medicoTratante}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${case_.montoTotal.toLocaleString()}
                  </div>
                  {case_.montoFaltante > 0 && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      Faltante: ${case_.montoFaltante.toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCaseSelect(case_)
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedCases.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron casos</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CasesTable