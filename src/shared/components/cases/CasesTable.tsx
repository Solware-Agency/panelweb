import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Search,
	Filter,
	RefreshCw,
	Trash2,
	Edit,
	Eye,
	Download,
	FileText,
	Microscope,
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Maximize2,
	Minimize2,
} from 'lucide-react'
import { Card } from '@shared/components/ui/card'
import { Input } from '@shared/components/ui/input'
import { Button } from '@shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'
import { useToast } from '@shared/hooks/use-toast'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { deleteMedicalRecord, updateMedicalRecordWithLog } from '@lib/supabase-service'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { getAgeDisplay } from '@lib/supabase-service'
import type { MedicalRecord } from '@lib/supabase-service'
import EditCaseModal from './EditCaseModal'
import GenerateBiopsyModal from './GenerateBiopsyModal'
import { generatePDF } from '@shared/utils/pdf-generator'

interface CasesTableProps {
	onCaseSelect: (case_: MedicalRecord) => void
	cases: MedicalRecord[]
	isLoading: boolean
	error: any
	refetch: () => void
	isFullscreen: boolean
	setIsFullscreen: (value: boolean) => void
}

const CasesTable: React.FC<CasesTableProps> = ({
	onCaseSelect,
	cases,
	isLoading,
	error,
	refetch,
	isFullscreen,
	setIsFullscreen,
}) => {
	const { toast } = useToast()
	const { user } = useAuth()
	const { profile } = useUserProfile()
	const navigate = useNavigate()
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [branchFilter, setBranchFilter] = useState<string>('all')
	const [examTypeFilter, setExamTypeFilter] = useState<string>('all')
	const [isDeleting, setIsDeleting] = useState<string | null>(null)
	const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
	const [caseToDelete, setCaseToDelete] = useState<MedicalRecord | null>(null)
	const [editModalOpen, setEditModalOpen] = useState(false)
	const [biopsyModalOpen, setBiopsyModalOpen] = useState(false)
	const [selectedCase, setSelectedCase] = useState<MedicalRecord | null>(null)
	const [isDownloading, setIsDownloading] = useState<string | null>(null)
	
	// Pagination state
	const [currentPage, setCurrentPage] = useState(0)
	const [itemsPerPage, setItemsPerPage] = useState(10)
	const [totalItems, setTotalItems] = useState(0)

	// Check if user is owner or admin (for edit/delete permissions)
	const canEditDelete = profile?.role === 'owner' || profile?.role === 'admin'

	// Update total items when cases change
	useEffect(() => {
		setTotalItems(filteredCases.length)
	}, [cases, searchTerm, statusFilter, branchFilter, examTypeFilter])

	// Filter cases based on search term and filters
	const filteredCases = React.useMemo(() => {
		return cases.filter((case_) => {
			// Search filter
			const matchesSearch =
				searchTerm === '' ||
				case_.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				case_.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
				case_.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(case_.code && case_.code.toLowerCase().includes(searchTerm.toLowerCase()))

			// Status filter
			const matchesStatus =
				statusFilter === 'all' ||
				(statusFilter === 'completed' && case_.payment_status === 'Completado') ||
				(statusFilter === 'pending' && case_.payment_status !== 'Completado')

			// Branch filter
			const matchesBranch = branchFilter === 'all' || case_.branch === branchFilter

			// Exam type filter
			const matchesExamType =
				examTypeFilter === 'all' ||
				(examTypeFilter === 'biopsia' && case_.exam_type.toLowerCase() === 'biopsia') ||
				(examTypeFilter === 'citologia' && case_.exam_type.toLowerCase() === 'citologia') ||
				(examTypeFilter === 'inmunohistoquimica' && case_.exam_type.toLowerCase() === 'inmunohistoquimica')

			return matchesSearch && matchesStatus && matchesBranch && matchesExamType
		})
	}, [cases, searchTerm, statusFilter, branchFilter, examTypeFilter])

	// Get paginated data
	const paginatedCases = React.useMemo(() => {
		const startIndex = currentPage * itemsPerPage
		return filteredCases.slice(startIndex, startIndex + itemsPerPage)
	}, [filteredCases, currentPage, itemsPerPage])

	// Calculate total pages
	const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

	// Handle page change
	const handlePageChange = (newPage: number) => {
		setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)))
	}

	// Get unique branches for filter
	const branches = React.useMemo(() => {
		const uniqueBranches = new Set<string>()
		cases.forEach((case_) => {
			if (case_.branch) {
				uniqueBranches.add(case_.branch)
			}
		})
		return Array.from(uniqueBranches).sort()
	}, [cases])

	// Handle case deletion
	const handleDelete = (case_: MedicalRecord) => {
		setCaseToDelete(case_)
		setIsConfirmDeleteOpen(true)
	}

	// Confirm case deletion
	const confirmDelete = async () => {
		if (!caseToDelete || !user) return

		setIsDeleting(caseToDelete.id!)
		try {
			const { error } = await deleteMedicalRecord(caseToDelete.id!)

			if (error) {
				throw error
			}

			toast({
				title: '✅ Caso eliminado',
				description: `El caso ${caseToDelete.code || caseToDelete.id} ha sido eliminado exitosamente.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})

			// Refresh data
			refetch()
		} catch (error) {
			console.error('Error deleting case:', error)
			toast({
				title: '❌ Error al eliminar',
				description: 'Hubo un problema al eliminar el caso. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		} finally {
			setIsDeleting(null)
			setIsConfirmDeleteOpen(false)
			setCaseToDelete(null)
		}
	}

	// Handle case edit
	const handleEdit = (case_: MedicalRecord) => {
		setSelectedCase(case_)
		setEditModalOpen(true)
	}

	// Handle case view
	const handleView = (case_: MedicalRecord) => {
		onCaseSelect(case_)
	}

	// Handle biopsy generation
	const handleGenerateBiopsy = (case_: MedicalRecord) => {
		setSelectedCase(case_)
		setBiopsyModalOpen(true)
	}

	// Handle case download as PDF
	const handleDownloadCase = async (case_: MedicalRecord) => {
		if (!case_) return

		setIsDownloading(case_.id!)
		try {
			// Check if it's a biopsy case with required fields
			const isBiopsyCase =
				case_.exam_type.toLowerCase() === 'biopsia' &&
				case_.material_remitido &&
				case_.informacion_clinica &&
				case_.descripcion_macroscopica &&
				case_.diagnostico

			if (!isBiopsyCase) {
				toast({
					title: '❌ No se puede generar PDF',
					description:
						'Este caso no es una biopsia o no tiene la información completa para generar un PDF.',
					variant: 'destructive',
				})
				setIsDownloading(null)
				return
			}

			// Generate and download PDF
			await generatePDF(case_)

			toast({
				title: '✅ PDF generado',
				description: `El PDF del caso ${case_.code || case_.id} ha sido generado exitosamente.`,
				className: 'bg-green-100 border-green-400 text-green-800',
			})
		} catch (error) {
			console.error('Error generating PDF:', error)
			toast({
				title: '❌ Error al generar PDF',
				description: 'Hubo un problema al generar el PDF. Inténtalo de nuevo.',
				variant: 'destructive',
			})
		} finally {
			setIsDownloading(null)
		}
	}

	// Handle save case changes
	const handleSaveCase = async (
		caseId: string,
		updates: Partial<MedicalRecord>,
		changes: Array<{
			field: string
			fieldLabel: string
			oldValue: any
			newValue: any
		}>,
	) => {
		if (!user) return

		try {
			const { error } = await updateMedicalRecordWithLog(
				caseId,
				updates,
				changes,
				user.id,
				user.email || 'unknown@email.com',
			)

			if (error) {
				throw error
			}

			// Refresh data
			refetch()
		} catch (error) {
			console.error('Error updating case:', error)
			throw error
		}
	}

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(0)
	}, [searchTerm, statusFilter, branchFilter, examTypeFilter])

	// Handle fullscreen toggle
	const handleToggleFullscreen = useCallback(() => {
		setIsFullscreen(!isFullscreen)
	}, [isFullscreen, setIsFullscreen])

	if (error) {
		return (
			<div className="p-4">
				<Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
					<div className="flex items-center gap-3 mb-4">
						<AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
						<h2 className="text-xl font-bold text-red-800 dark:text-red-300">Error al cargar los casos</h2>
					</div>
					<p className="text-red-700 dark:text-red-400 mb-4">
						No se pudieron cargar los casos médicos. Por favor, intenta de nuevo más tarde.
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
		<div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
			{/* Filters */}
			<Card className="mb-4 p-4">
				<div className="flex flex-col sm:flex-row gap-4">
					{/* Search */}
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<Input
							type="text"
							placeholder="Buscar por nombre, cédula, teléfono o código..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Status Filter */}
					<div className="flex items-center gap-2">
						<Filter className="w-4 h-4 text-gray-400" />
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Estado" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los estados</SelectItem>
								<SelectItem value="completed">Completados</SelectItem>
								<SelectItem value="pending">Pendientes</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Branch Filter */}
					<div className="flex items-center gap-2">
						<Select value={branchFilter} onValueChange={setBranchFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Sede" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todas las sedes</SelectItem>
								{branches.map((branch) => (
									<SelectItem key={branch} value={branch}>
										{branch}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Exam Type Filter */}
					<div className="flex items-center gap-2">
						<Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Tipo de examen" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los tipos</SelectItem>
								<SelectItem value="biopsia">Biopsia</SelectItem>
								<SelectItem value="citologia">Citología</SelectItem>
								<SelectItem value="inmunohistoquimica">Inmunohistoquímica</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Fullscreen Toggle */}
					<Button variant="outline" size="icon" onClick={handleToggleFullscreen}>
						{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
					</Button>
				</div>
			</Card>

			{/* Cases Table */}
			<Card className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50/50 dark:bg-background/50 backdrop-blur-[10px] sticky top-0 z-10">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Paciente
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Tipo
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Sede
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Fecha
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Estado
								</th>
								<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
							{isLoading ? (
								<tr>
									<td colSpan={6} className="px-4 py-4 text-center">
										<div className="flex items-center justify-center">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
											<span className="ml-2">Cargando casos...</span>
										</div>
									</td>
								</tr>
							) : paginatedCases.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-4 py-8 text-center">
										<div className="flex flex-col items-center justify-center">
											<FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
											<p className="text-lg font-medium text-gray-500 dark:text-gray-400">No se encontraron casos</p>
											<p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
												{searchTerm || statusFilter !== 'all' || branchFilter !== 'all' || examTypeFilter !== 'all'
													? 'Intenta ajustar los filtros de búsqueda'
													: 'No hay casos registrados en el sistema'}
											</p>
										</div>
									</td>
								</tr>
							) : (
								paginatedCases.map((case_) => {
									// Calculate age from date_of_birth
									const ageDisplay = case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : ''

									return (
										<tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
											<td className="px-4 py-4">
												<div className="flex flex-col">
													<div className="flex items-center">
														<span className="font-medium text-gray-900 dark:text-gray-100">{case_.full_name}</span>
														{case_.code && (
															<span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
																{case_.code}
															</span>
														)}
													</div>
													<div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
														<span className="mr-2">CI: {case_.id_number}</span>
														{ageDisplay && <span>• {ageDisplay}</span>}
													</div>
												</div>
											</td>
											<td className="px-4 py-4">
												<div className="flex items-center">
													{case_.exam_type.toLowerCase() === 'biopsia' ? (
														<div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs">
															<Microscope className="w-3 h-3" />
															<span>Biopsia</span>
														</div>
													) : case_.exam_type.toLowerCase() === 'citologia' ? (
														<div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
															<FileText className="w-3 h-3" />
															<span>Citología</span>
														</div>
													) : (
														<div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs">
															<Microscope className="w-3 h-3" />
															<span>Inmunohistoquímica</span>
														</div>
													)}
												</div>
											</td>
											<td className="px-4 py-4">
												<span className="text-sm text-gray-900 dark:text-gray-100">{case_.branch}</span>
											</td>
											<td className="px-4 py-4">
												<span className="text-sm text-gray-900 dark:text-gray-100">
													{format(new Date(case_.date), 'dd/MM/yyyy', { locale: es })}
												</span>
											</td>
											<td className="px-4 py-4">
												<div
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														case_.payment_status === 'Completado'
															? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
															: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
													}`}
												>
													{case_.payment_status}
												</div>
											</td>
											<td className="px-4 py-4 text-center">
												<div className="flex items-center justify-center space-x-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleView(case_)}
														className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
													>
														<Eye className="w-4 h-4" />
													</Button>

													{canEditDelete && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleEdit(case_)}
															className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
														>
															<Edit className="w-4 h-4" />
														</Button>
													)}

													{case_.exam_type.toLowerCase() === 'biopsia' && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleGenerateBiopsy(case_)}
															className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
														>
															<Microscope className="w-4 h-4" />
														</Button>
													)}

													{case_.exam_type.toLowerCase() === 'biopsia' &&
														case_.material_remitido &&
														case_.diagnostico && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleDownloadCase(case_)}
																disabled={isDownloading === case_.id}
																className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
															>
																{isDownloading === case_.id ? (
																	<RefreshCw className="w-4 h-4 animate-spin" />
																) : (
																	<Download className="w-4 h-4" />
																)}
															</Button>
														)}

													{canEditDelete && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(case_)}
															disabled={isDeleting === case_.id}
															className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
														>
															{isDeleting === case_.id ? (
																<RefreshCw className="w-4 h-4 animate-spin" />
															) : (
																<Trash2 className="w-4 h-4" />
															)}
														</Button>
													)}
												</div>
											</td>
										</tr>
									)
								})
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				{!isLoading && filteredCases.length > 0 && (
					<div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
						<div className="text-sm text-gray-500 dark:text-gray-400">
							Mostrando {paginatedCases.length} de {filteredCases.length} casos
							{filteredCases.length < cases.length && (
								<> (filtrados de {cases.length} total)</>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Select 
								value={itemsPerPage.toString()} 
								onValueChange={(value) => {
									setItemsPerPage(parseInt(value))
									setCurrentPage(0) // Reset to first page when changing items per page
								}}
							>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="Filas por página" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="10">10 por página</SelectItem>
									<SelectItem value="25">25 por página</SelectItem>
									<SelectItem value="50">50 por página</SelectItem>
									<SelectItem value="100">100 por página</SelectItem>
								</SelectContent>
							</Select>
							
							<div className="flex items-center gap-1">
								<Button 
									variant="outline" 
									size="icon"
									onClick={() => handlePageChange(0)}
									disabled={currentPage === 0}
									className="w-8 h-8"
								>
									<ChevronsLeft className="w-4 h-4" />
								</Button>
								<Button 
									variant="outline" 
									size="icon"
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 0}
									className="w-8 h-8"
								>
									<ChevronLeft className="w-4 h-4" />
								</Button>
								
								<span className="text-sm px-2">
									Página {currentPage + 1} de {totalPages}
								</span>
								
								<Button 
									variant="outline" 
									size="icon"
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={currentPage >= totalPages - 1}
									className="w-8 h-8"
								>
									<ChevronRight className="w-4 h-4" />
								</Button>
								<Button 
									variant="outline" 
									size="icon"
									onClick={() => handlePageChange(totalPages - 1)}
									disabled={currentPage >= totalPages - 1}
									className="w-8 h-8"
								>
									<ChevronsRight className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</div>
				)}
			</Card>

			{/* Edit Case Modal */}
			<EditCaseModal
				case_={selectedCase}
				isOpen={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				onSave={handleSaveCase}
			/>

			{/* Generate Biopsy Modal */}
			<GenerateBiopsyModal
				case_={selectedCase}
				isOpen={biopsyModalOpen}
				onClose={() => setBiopsyModalOpen(false)}
				onSuccess={() => {
					refetch()
					setBiopsyModalOpen(false)
				}}
			/>

			{/* Confirm Delete Modal */}
			{isConfirmDeleteOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white dark:bg-background rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
						<p className="mb-6">
							¿Estás seguro de que quieres eliminar el caso{' '}
							<span className="font-semibold">{caseToDelete?.code || caseToDelete?.id?.slice(-6)}</span> de{' '}
							<span className="font-semibold">{caseToDelete?.full_name}</span>? Esta acción no se puede deshacer.
						</p>
						<div className="flex justify-end gap-3">
							<Button
								variant="outline"
								onClick={() => {
									setIsConfirmDeleteOpen(false)
									setCaseToDelete(null)
								}}
							>
								Cancelar
							</Button>
							<Button
								variant="destructive"
								onClick={confirmDelete}
								disabled={isDeleting !== null}
							>
								{isDeleting ? (
									<>
										<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
										Eliminando...
									</>
								) : (
									'Eliminar'
								)}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Fullscreen Close Button */}
			{isFullscreen && (
				<Button
					variant="outline"
					size="sm"
					onClick={handleToggleFullscreen}
					className="absolute top-4 right-4 z-10"
				>
					<Minimize2 className="w-4 h-4 mr-2" />
					Salir de pantalla completa
				</Button>
			)}
		</div>
	)
}

export default CasesTable