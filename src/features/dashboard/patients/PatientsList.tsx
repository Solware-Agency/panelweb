import React, { useState, useCallback, useMemo } from 'react'
import { User, Phone, Mail, Calendar, ChevronUp, ChevronDown } from 'lucide-react'
import { Card } from '@shared/components/ui/card'
import { Button } from '@shared/components/ui/button'
import { getAgeDisplay } from '@lib/supabase-service'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import PatientHistoryModal from '@shared/components/patients/PatientHistoryModal'

// Define interface for patient data
type SortField = 'full_name' | 'id_number' | 'date_of_birth' | 'phone' | 'email'
type SortDirection = 'asc' | 'desc'

interface PatientData {
	id_number: string
	full_name: string
	phone: string
	email: string | null
	date_of_birth: string | null
	lastVisit: string
	totalVisits: number
}

// Define interface for medical record from database
interface MedicalRecord {
	id: string
	full_name: string
	id_number: string
	phone: string
	email: string | null
	date_of_birth: string | null
	created_at: string
	date: string
	[key: string]: any
}

// Props interface for PatientsList
interface PatientsListProps {
	searchTerm: string
	recordsData: {
		data: MedicalRecord[] | null
		error: any
	} | null
	isLoading: boolean
	error: any
	handleRefresh: () => void
}

// Use React.memo to prevent unnecessary re-renders
const PatientsList: React.FC<PatientsListProps> = React.memo(
	({ searchTerm, recordsData, isLoading, error, handleRefresh }) => {
		const [sortField, setSortField] = useState<SortField>('full_name')
		const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
		const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)
		const [isModalOpen, setIsModalOpen] = useState(false)

		// Process records to get unique patients
		const patients = useMemo(() => {
			if (!recordsData?.data) return []

			// Use a more efficient approach to process records
			const processedRecords = recordsData.data.reduce((map: Map<string, PatientData>, record: MedicalRecord) => {
				// Solo procesar registros con id_number válido
				if (!record.id_number || record.id_number.trim() === '') {
					return map
				}

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
						totalVisits: 1,
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

			return patients.filter((patient: PatientData) => {
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

			return [...filteredPatients].sort((a: PatientData, b: PatientData) => {
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
		const handleSort = useCallback(
			(field: SortField) => {
				if (sortField === field) {
					setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
				} else {
					setSortField(field)
					setSortDirection('asc')
				}
			},
			[sortField, sortDirection],
		)

		// Handle patient selection
		const handlePatientClick = useCallback((patient: PatientData) => {
			setSelectedPatient(patient)
			setIsModalOpen(true)
		}, [])

		// Sort icon component
		const SortIcon = useCallback(
			({ field }: { field: SortField }) => {
				if (sortField !== field) {
					return <ChevronUp className="w-4 h-4 text-gray-400" />
				}
				return sortDirection === 'asc' ? (
					<ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
				) : (
					<ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
				)
			},
			[sortField, sortDirection],
		)

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
							<Button onClick={handleRefresh} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
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
				{/* Patients table */}
				<Card className="overflow-hidden">
					{/* Desktop view */}
					<div className="hidden lg:block">
						<div className="max-h-[600px] overflow-auto">
							<table className="w-full">
								<thead className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-[10px] sticky top-0 z-10">
									<tr>
										<th className="w-[20%] px-4 py-3 text-left">
											<button
												onClick={() => handleSort('full_name')}
												className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
											>
												Nombre
												<SortIcon field="full_name" />
											</button>
										</th>
										<th className="w-[15%] px-4 py-3 text-left">
											<button
												onClick={() => handleSort('id_number')}
												className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
											>
												Cédula
												<SortIcon field="id_number" />
											</button>
										</th>
										<th className="w-[20%] px-4 py-3 text-left">
											<button
												onClick={() => handleSort('date_of_birth')}
												className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
											>
												Fecha de Nacimiento
												<SortIcon field="date_of_birth" />
											</button>
										</th>
										<th className="w-[15%] px-4 py-3 text-left">
											<button
												onClick={() => handleSort('phone')}
												className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
											>
												Teléfono
												<SortIcon field="phone" />
											</button>
										</th>
										<th className="w-[15%] px-4 py-3 text-left">
											<button
												onClick={() => handleSort('email')}
												className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
											>
												Email
												<SortIcon field="email" />
											</button>
										</th>
										<th className="w-[15%] px-4 py-3 text-center">
											<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
												Última Visita
											</span>
										</th>
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
									{sortedPatients.length > 0 ? (
										sortedPatients.map((patient: PatientData) => (
											<tr
												key={patient.id_number}
												className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
												onClick={() => handlePatientClick(patient)}
											>
												{/* Name Cell */}
												<td className="w-[20%] px-4 py-4">
													<div className="flex items-center">
														<div className="flex-shrink-0 h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
															<User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
														</div>
														<div className="ml-3">
															<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
																{patient.full_name}
															</p>
														</div>
													</div>
												</td>

												{/* ID Number Cell */}
												<td className="w-[15%] px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
													{patient.id_number}
												</td>

												{/* Date of Birth Cell */}
												<td className="w-[20%] px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
													{patient.date_of_birth ? (
														<div className="flex items-center">
															<span>{format(parseISO(patient.date_of_birth), 'dd/MM/yyyy', { locale: es })}</span>
															<span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
																({getAgeDisplay(patient.date_of_birth)})
															</span>
														</div>
													) : (
														<span className="text-gray-500 dark:text-gray-400">No disponible</span>
													)}
												</td>

												{/* Phone Cell */}
												<td className="w-[15%] px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{patient.phone}</td>

												{/* Email Cell */}
												<td className="w-[15%] px-4 py-4 text-sm text-gray-900 dark:text-gray-100 truncate">
													{patient.email || <span className="text-gray-500 dark:text-gray-400">No disponible</span>}
												</td>

												{/* Last Visit Cell */}
												<td className="w-[15%] px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-center">
													{format(new Date(patient.lastVisit), 'dd/MM/yyyy', { locale: es })}
												</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
					<div className="lg:hidden">
						{sortedPatients.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
								{sortedPatients.slice(0, 20).map((patient: PatientData) => (
									<div
										key={patient.id_number}
										className="bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
										onClick={() => handlePatientClick(patient)}
									>
										<div className="flex items-center mb-2">
											<div className="flex-shrink-0 h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
												<User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
											</div>
											<div className="ml-2 min-w-0">
												<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
													{patient.full_name}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">Cédula: {patient.id_number}</p>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-2 text-xs">
											<div className="col-span-2">
												<div className="flex items-center">
													<Calendar className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
													<span className="text-gray-600 dark:text-gray-300 text-xs">
														{patient.date_of_birth ? (
															<>
																{format(parseISO(patient.date_of_birth), 'dd/MM/yyyy', { locale: es })}
																<span className="ml-1 text-blue-600 dark:text-blue-400">
																	({getAgeDisplay(patient.date_of_birth)})
																</span>
															</>
														) : (
															'N/A'
														)}
													</span>
												</div>
											</div>

											<div>
												<div className="flex items-center">
													<Phone className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
													<span className="text-gray-600 dark:text-gray-300 text-xs truncate">{patient.phone}</span>
												</div>
											</div>

											<div>
												<div className="flex items-center justify-end">
													<div className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
														{patient.totalVisits} visita{patient.totalVisits !== 1 ? 's' : ''}
													</div>
												</div>
											</div>

											{patient.email && (
												<div className="col-span-2 mt-1">
													<div className="flex items-center">
														<Mail className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
														<span className="text-gray-600 dark:text-gray-300 text-xs truncate">{patient.email}</span>
													</div>
												</div>
											)}
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

						{sortedPatients.length > 20 && (
							<div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
									Mostrando 20 de {sortedPatients.length} pacientes
								</p>
								<Button variant="outline" onClick={() => {}} className="text-xs">
									Refinar búsqueda
								</Button>
							</div>
						)}
					</div>
				</Card>

				{/* Patient History Modal */}
				<PatientHistoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} patient={selectedPatient} />
			</div>
		)
	},
)

export default PatientsList
