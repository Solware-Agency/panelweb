import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search, Filter, Eye, Calendar, User, Stethoscope, CreditCard } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMedicalRecords } from '@/lib/supabase-service'
import type { MedicalRecord } from '@/lib/supabase-service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface CasesTableProps {
	onCaseSelect: (case_: MedicalRecord) => void
}

type SortField = 'id' | 'created_at' | 'full_name' | 'age' | 'total_amount'
type SortDirection = 'asc' | 'desc'

const CasesTable: React.FC<CasesTableProps> = ({ onCaseSelect }) => {
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [sortField, setSortField] = useState<SortField>('created_at')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
	const [rowLimit, setRowLimit] = useState<number>(20)

	// Fetch data from Supabase
	const {
		data: casesData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ['medical-cases'],
		queryFn: () => getMedicalRecords(100, 0), // Fetch more records to allow proper filtering
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	const cases = casesData?.data || []

	const getStatusColor = (status: string) => {
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
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
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
		let filtered = cases.filter((case_) => {
			const matchesSearch =
				case_.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				case_.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
				case_.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
				case_.exam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
				case_.treating_doctor.toLowerCase().includes(searchTerm.toLowerCase())

			const matchesStatus = statusFilter === 'all' || case_.payment_status === statusFilter

			return matchesSearch && matchesStatus
		})

		filtered.sort((a, b) => {
			let aValue: any = a[sortField]
			let bValue: any = b[sortField]

			if (sortField === 'created_at') {
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

		// Apply row limit
		if (rowLimit > 0) {
			return filtered.slice(0, rowLimit)
		}

		return filtered
	}, [cases, searchTerm, statusFilter, sortField, sortDirection, rowLimit])

	const SortIcon = ({ field }: { field: SortField }) => {
		if (sortField !== field) {
			return <ChevronUp className="w-4 h-4 text-gray-400" />
		}
		return sortDirection === 'asc' ? (
			<ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
		) : (
			<ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
		)
	}

	// Mobile Card Component
	const CaseCard = ({ case_ }: { case_: MedicalRecord }) => (
		<div
			onClick={() => onCaseSelect(case_)}
			className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
		>
			{/* Header with status and code */}
			<div className="flex items-center justify-between mb-3">
				<span
					className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(case_.payment_status)}`}
				>
					{case_.payment_status}
				</span>
				<span className="text-sm font-mono text-gray-600 dark:text-gray-400">{case_.id?.slice(-6).toUpperCase()}</span>
			</div>

			{/* Patient info */}
			<div className="flex items-center gap-2 mb-2">
				<User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
				<div>
					<p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{case_.full_name}</p>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						{case_.id_number} • {case_.age} años
					</p>
				</div>
			</div>

			{/* Medical info */}
			<div className="flex items-center gap-2 mb-2">
				<Stethoscope className="w-4 h-4 text-green-600 dark:text-green-400" />
				<div>
					<p className="text-sm text-gray-900 dark:text-gray-100">{case_.exam_type}</p>
					<p className="text-xs text-gray-500 dark:text-gray-400">{case_.treating_doctor}</p>
				</div>
			</div>

			{/* Date and amount */}
			<div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
				<div className="flex items-center gap-1">
					<Calendar className="w-3 h-3 text-gray-400" />
					<span className="text-xs text-gray-500 dark:text-gray-400">
						{case_.created_at ? format(new Date(case_.created_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'}
					</span>
				</div>
				<div className="flex items-center gap-1">
					<CreditCard className="w-3 h-3 text-gray-400" />
					<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
						${case_.total_amount.toLocaleString()}
					</span>
				</div>
			</div>

			{case_.remaining > 0 && (
				<div className="mt-2 text-xs text-red-600 dark:text-red-400">Faltante: ${case_.remaining.toLocaleString()}</div>
			)}
		</div>
	)

	if (isLoading) {
		return (
			<div className="bg-white/80 dark:bg-gray-900 rounded-xl transition-colors duration-300 h-full">
				<div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-center py-12">
						<div className="flex items-center gap-3">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
							<span className="text-lg text-gray-700 dark:text-gray-300">Cargando casos...</span>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="bg-white/80 dark:bg-gray-900 rounded-xl transition-colors duration-300 h-full">
				<div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="text-center py-12">
						<div className="text-red-500 dark:text-red-400">
							<p className="text-lg font-medium">Error al cargar los casos</p>
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
			</div>
		)
	}

	return (
		<div className="bg-white/80 dark:bg-gray-900 rounded-xl transition-colors duration-300 h-full">
			{/* Search and Filter Controls */}
			<div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
				<div className="flex flex-col gap-4">
					{/* Search and Status Filter Row */}
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

					{/* Row Limit Selector */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<label htmlFor="rowLimit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Mostrar:
							</label>
							<select
								id="rowLimit"
								value={rowLimit}
								onChange={(e) => setRowLimit(Number(e.target.value))}
								className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
							>
								<option value={5}>Últimos 5 casos</option>
								<option value={10}>Últimos 10 casos</option>
								<option value={20}>Últimos 20 casos</option>
								<option value={50}>Últimos 50 casos</option>
								<option value={0}>Todos los casos</option>
							</select>
						</div>

						{/* Results count */}
						<div className="text-sm text-gray-600 dark:text-gray-400">
							Mostrando {filteredAndSortedCases.length} de{' '}
							{
								cases.filter((case_) => {
									const matchesSearch =
										case_.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
										case_.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
										case_.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
										case_.exam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
										case_.treating_doctor.toLowerCase().includes(searchTerm.toLowerCase())
									const matchesStatus = statusFilter === 'all' || case_.payment_status === statusFilter
									return matchesSearch && matchesStatus
								}).length
							}{' '}
							casos
						</div>
					</div>
				</div>
			</div>

			{/* Mobile View - Cards */}
			<div className="block lg:hidden">
				<div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
					{filteredAndSortedCases.map((case_) => (
						<CaseCard key={case_.id} case_={case_} />
					))}

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

			{/* Desktop View - Table */}
			<div className="hidden lg:block">
				<div className="overflow-x-auto">
					<div className="max-h-[50vh] overflow-y-auto">
						<table className="w-full">
							<thead className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-[10px] sticky top-0 z-10">
								<tr>
									<th className="px-4 py-3 text-left">
										<button
											onClick={() => handleSort('id')}
											className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
										>
											Estatus / Código
											<SortIcon field="id" />
										</button>
									</th>
									<th className="px-4 py-3 text-left">
										<button
											onClick={() => handleSort('created_at')}
											className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
										>
											Fecha Ingreso
											<SortIcon field="created_at" />
										</button>
									</th>
									<th className="px-4 py-3 text-left">
										<button
											onClick={() => handleSort('full_name')}
											className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
										>
											Paciente
											<SortIcon field="full_name" />
										</button>
									</th>
									<th className="px-4 py-3 text-left">
										<button
											onClick={() => handleSort('age')}
											className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
										>
											Edad
											<SortIcon field="age" />
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
											onClick={() => handleSort('total_amount')}
											className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
										>
											Monto Total
											<SortIcon field="total_amount" />
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
										key={case_.id}
										className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
										onClick={() => onCaseSelect(case_)}
									>
										<td className="px-4 py-4">
											<div className="space-y-1">
												<span
													className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(case_.payment_status)}`}
												>
													{case_.payment_status}
												</span>
												<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
													{case_.id.slice(-6).toUpperCase()}
												</div>
											</div>
										</td>
										<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
											{new Date(case_.created_at).toLocaleDateString('es-ES')}
										</td>
										<td className="px-4 py-4">
											<div>
												<div className="text-sm font-medium text-gray-900 dark:text-gray-100">{case_.full_name}</div>
												<div className="text-sm text-gray-500 dark:text-gray-400">{case_.id_number}</div>
											</div>
										</td>
										<td className="px-4 py-4text-sm text-gray-900 dark:text-gray-100">
											<div className="bg-gray-200 dark:bg-gray-900/60 hover:bg-gray-300 dark:hover:bg-gray-800/80 text-center border border-gray-500 dark:border-gray-700 rounded-lg p-1">
												{case_.branch}
											</div>
										</td>
										<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{case_.exam_type}</td>
										<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{case_.treating_doctor}</td>
										<td className="px-4 py-4">
											<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
												${case_.total_amount.toLocaleString()}
											</div>
											{case_.remaining > 0 && (
												<div className="text-xs text-red-600 dark:text-red-400">
													Faltante: ${case_.remaining.toLocaleString()}
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
			</div>
		</div>
	)
}

export default CasesTable
