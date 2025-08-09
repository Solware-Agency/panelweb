import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
	ChevronUp,
	ChevronDown,
	Search,
	Filter,
	Eye,
	User,
	Stethoscope,
	FileText,
	Maximize2,
	FlaskConical,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react'
import type { MedicalRecord } from '@lib/supabase-service'
import { getAgeDisplay } from '@lib/supabase-service'
import { useToast } from '@shared/hooks/use-toast'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import RequestCaseModal from './RequestCaseModal'
import DoctorFilterPanel from './DoctorFilterPanel'
import UnifiedCaseModal from './UnifiedCaseModal'
import HorizontalLinearStepper from './StepsCaseModal'
import {
	PopoverBody,
	PopoverButton,
	PopoverContent,
	PopoverRoot,
	PopoverTrigger,
} from '@shared/components/ui/PopoverInput'
import { BranchBadge } from '@shared/components/ui/branch-badge'

interface CasesTableProps {
	cases: MedicalRecord[]
	isLoading: boolean
	error: unknown
	refetch: () => void
	isFullscreen: boolean
	setIsFullscreen: (value: boolean) => void
	onSearch?: (term: string) => void
	onCaseSelect?: (case_: MedicalRecord) => void
}

type SortField = 'id' | 'created_at' | 'full_name' | 'total_amount' | 'code'
type SortDirection = 'asc' | 'desc'

const CasesTable: React.FC<CasesTableProps> = React.memo(
	({ cases, isLoading, error, refetch, isFullscreen, setIsFullscreen, onSearch, onCaseSelect }) => {
		useAuth()
		const { profile } = useUserProfile()
		const { toast } = useToast()
		const [searchTerm, setSearchTerm] = useState('')
		const [statusFilter, setStatusFilter] = useState<string>('all')
		const [branchFilter, setBranchFilter] = useState<string>('all')
		const [sortField, setSortField] = useState<SortField>('created_at')
		const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
		const [selectedCaseForGenerate, setSelectedCaseForGenerate] = useState<MedicalRecord | null>(null)
		const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
		const [isDownloading, setIsDownloading] = useState<string | null>(null)
		const [selectedCaseForView, setSelectedCaseForView] = useState<MedicalRecord | null>(null)
		const [isViewModalOpen, setIsViewModalOpen] = useState(false)
		const [showPdfReadyOnly, setShowPdfReadyOnly] = useState(false)
		const [selectedDoctors, setSelectedDoctors] = useState<string[]>([])
		const [showDoctorFilter, setShowDoctorFilter] = useState(false)
		const [isSearching, setIsSearching] = useState(false)
		const [isStepsModalOpen, setIsStepsModalOpen] = useState(false)
		const [shouldUpdateSelectedCase, setShouldUpdateSelectedCase] = useState(false)

		// Paginación
		const [currentPage, setCurrentPage] = useState(1)
		const [itemsPerPage, setItemsPerPage] = useState(20)
		const handleGenerateEmployeeCase = useCallback((case_: MedicalRecord) => {
			setSelectedCaseForGenerate(case_)
			setIsStepsModalOpen(true)
		}, [])

		// Effect to update selected case when cases data changes and we need to update
		useEffect(() => {
			if (shouldUpdateSelectedCase && selectedCaseForView && cases.length > 0) {
				const updatedCase = cases.find((c) => c.id === selectedCaseForView.id)
				if (updatedCase) {
					setSelectedCaseForView(updatedCase)
				}
				setShouldUpdateSelectedCase(false)
			}
		}, [cases, selectedCaseForView, shouldUpdateSelectedCase])

		// Reset pagination when filters change
		useEffect(() => {
			setCurrentPage(1)
		}, [statusFilter, branchFilter, showPdfReadyOnly, selectedDoctors, searchTerm])

		// Case actions popover component
		// Modifica el CaseActionsPopover para cambiar las restricciones de roles
		const CaseActionsPopover = ({ case_ }: { case_: MedicalRecord }) => {
			const examType = case_.exam_type?.toLowerCase().trim() || ''
			const isRequestableCase = examType.includes('inmuno')

			return (
				<PopoverRoot>
					<PopoverTrigger className="px-3 py-1 text-xs">Acciones</PopoverTrigger>
					<PopoverContent className="w-30 h-auto">
						<PopoverBody className="p-1">
							<PopoverButton onClick={() => handleCaseSelect(case_)}>
								<Eye className="w-4 h-4" />
								<span>Ver</span>
							</PopoverButton>

							{/* Botón Generar - Visible para todos los roles */}
							<PopoverButton onClick={() => handleGenerateEmployeeCase(case_)}>
								<FileText className="w-4 h-4" />
								<span>Generar</span>
							</PopoverButton>

							{/* Botón Solicitar - Solo visible para admin y solo para inmunohistoquímica */}
							{(profile?.role === 'admin' || profile?.role === 'owner') && isRequestableCase && (
								<PopoverButton onClick={() => handleGenerateCase(case_)}>
									<FlaskConical className="w-4 h-4" />
									<span>Reacciones</span>
								</PopoverButton>
							)}
						</PopoverBody>
					</PopoverContent>
				</PopoverRoot>
			)
		}

		// Determine if user can edit, delete, or generate cases based on role
		// const canGenerate = profile?.role === 'owner' || profile?.role === 'admin'
		const canRequest = profile?.role === 'owner' || profile?.role === 'admin'

		// const isAdmin = profile?.role === 'admin'
		// const isOwner = profile?.role === 'owner'
		// const isEmployee = profile?.role === 'employee'

		// Use a ref to track if we're in the dashboard or form view

        const getStatusColor = useCallback((status: string) => {
					const normalized = (status || '').toString().trim().toLowerCase()
					switch (normalized) {
						case 'pagado':
						case 'completado':
							return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
						case 'en proceso':
							return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
						case 'pendiente':
							return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
						case 'cancelado':
							return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
						case 'incompleto':
						default:
							return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
					}
				}, [])

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

				const handleGenerateCase = useCallback(
					(case_: MedicalRecord) => {
						// Check if user has permission to generate cases
						if (!canRequest) {
							toast({
								title: '❌ Permiso denegado',
								description: 'No tienes permisos para generar casos.',
								variant: 'destructive',
							})
							return
						}

						// Check if this is a generatable case type
						const examType = case_.exam_type?.toLowerCase().trim() || ''
						const isRequestableCase = examType.includes('inmuno')

						if (!isRequestableCase) {
							toast({
								title: '❌ Tipo de examen incorrecto',
								description:
									'La generación de casos solo está disponible para biopsias, inmunohistoquímica y citología.',
								variant: 'destructive',
							})
							return
						}

						setSelectedCaseForGenerate(case_)
						setIsGenerateModalOpen(true)
					},
					[toast, canRequest],
				)

				const handleDownloadCase = useCallback(
					async (case_: MedicalRecord) => {
						// Check if this case has the required content for PDF generation
						const examType = case_.exam_type?.toLowerCase().trim() || ''
						const hasContent =
							case_.diagnostico ||
							case_.conclusion_diagnostica ||
							(examType.includes('citolog') && case_.descripcion_macroscopica)

						if (!hasContent) {
							toast({
								title: '❌ Sin diagnóstico',
								description: 'Este caso no tiene un diagnóstico. Primero debe generar el caso.',
								variant: 'destructive',
							})
							return
						}

						setIsDownloading(case_.id ?? null)
						try {
							// Use the new pdf-lib based generator
							// await generatePDF(case_)

							toast({
								title: '✅ PDF generado exitosamente',
								description: `El informe ha sido descargado correctamente.`,
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
					},
					[toast],
				)

				// Handle search input change
				const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
					setSearchTerm(e.target.value)
				}, [])

				// Handle search on Enter key
				const handleSearchKeyDown = useCallback(
					(e: React.KeyboardEvent<HTMLInputElement>) => {
						if (e.key === 'Enter' && onSearch) {
							setIsSearching(true)
							onSearch(searchTerm)
							setTimeout(() => setIsSearching(false), 500)
						}
					},
					[onSearch, searchTerm],
				)
				// Handle doctor filter change
				const handleDoctorFilterChange = useCallback((doctors: string[]) => {
					setSelectedDoctors(doctors)
				}, [])

				// Toggle doctor filter panel
				const toggleDoctorFilter = useCallback(() => {
					setShowDoctorFilter((prev) => !prev)
				}, [])

				// Handle PDF filter toggle
				const handlePdfFilterToggle = useCallback(() => {
					setShowPdfReadyOnly(!showPdfReadyOnly)
				}, [showPdfReadyOnly])

				const handleCaseSelect = useCallback(
					(case_: MedicalRecord) => {
						// If onCaseSelect prop is provided, use it (for external selection)
						if (onCaseSelect) {
							onCaseSelect(case_)
						} else {
							// Otherwise, handle selection locally with modal
							setSelectedCaseForView(case_)
							setIsViewModalOpen(true)
						}
					},
					[onCaseSelect],
				)

				// Memoize the filtered and sorted cases to improve performance - OPTIMIZED
				const filteredAndSortedCases = useMemo(() => {
					if (!cases || !Array.isArray(cases)) {
						console.warn('Cases is not an array:', cases)
						return { filtered: [], hasActiveFilters: false, totalCases: 0 }
					}

					// Check if we have active filters or search terms
					const hasActiveFilters =
						statusFilter !== 'all' ||
						branchFilter !== 'all' ||
						showPdfReadyOnly ||
						selectedDoctors.length > 0 ||
						(searchTerm && searchTerm.trim() !== '') ||
						(onSearch && searchTerm && searchTerm.trim() !== '')

					// Process all cases for filtering (pagination will handle the limiting)
					const casesToProcess = cases

					// Apply client-side filtering only for local filters
					// (searchTerm is handled by the parent component via onSearch)
					const filtered = casesToProcess.filter((case_) => {
						// Skip if case_ is null or undefined
						if (!case_) return false

						// Doctor filter
						const matchesDoctor =
							selectedDoctors.length === 0 ||
							(case_.treating_doctor && selectedDoctors.includes(case_.treating_doctor.trim()))

						// Status filter
						let matchesStatus = true
						const paymentStatusNormalized = (case_.payment_status || '').toString().trim().toLowerCase()
						if (statusFilter === 'Pagado') {
							matchesStatus = paymentStatusNormalized === 'pagado'
						} else if (statusFilter === 'Incompleto') {
							// "Incompleto" incluye todos los estados distintos de pagado
							matchesStatus = paymentStatusNormalized !== 'pagado'
						}
						// If statusFilter is 'all', matchesStatus remains true

						// Branch filter
						const normalize = (str: string | null | undefined) => (str ? str.trim().toLowerCase() : '')
						const matchesBranch = branchFilter === 'all' || normalize(case_.branch) === normalize(branchFilter)

						// Exam type filter
						const matchesExamType = true // No exam type filter active

						// PDF ready filter
						let matchesPdfReady = true
						if (showPdfReadyOnly) {
							// Usar la columna pdf_en_ready de Supabase
							// Manejar tanto boolean como string
							const pdfReadyValue = case_.pdf_en_ready
							if (pdfReadyValue === true) {
								matchesPdfReady = true
							} else if (typeof pdfReadyValue === 'string') {
								matchesPdfReady = pdfReadyValue === 'true' || pdfReadyValue === 'TRUE'
							} else {
								matchesPdfReady = false
							}
						}

						// Local search filter (only if onSearch is not provided)
						let matchesSearch = true
						if (!onSearch && searchTerm && searchTerm.trim()) {
							const searchLower = searchTerm.toLowerCase()
							matchesSearch =
								(case_.full_name?.toLowerCase() || '').includes(searchLower) ||
								(case_.id_number?.toLowerCase() || '').includes(searchLower) ||
								(case_.treating_doctor?.toLowerCase() || '').includes(searchLower) ||
								(case_.code?.toLowerCase() || '').includes(searchLower) ||
								(case_.branch?.toLowerCase() || '').includes(searchLower)
						}

						return (
							matchesStatus && matchesBranch && matchesExamType && matchesPdfReady && matchesSearch && matchesDoctor
						)
					})

					// Apply sorting - optimized to avoid expensive Date operations when possible
					filtered.sort((a, b) => {
						let aValue: unknown = a[sortField]
						let bValue: unknown = b[sortField]

						// Handle null/undefined values
						if (aValue === null || aValue === undefined) aValue = ''
						if (bValue === null || bValue === undefined) bValue = ''

						// Optimize date sorting by using string comparison when possible
						if (sortField === 'created_at') {
							// Use string comparison for ISO dates (they sort correctly)
							aValue = aValue || '0000-00-00'
							bValue = bValue || '0000-00-00'
						} else if (typeof aValue === 'string' && typeof bValue === 'string') {
							aValue = aValue.toLowerCase()
							bValue = bValue.toLowerCase()
						}

						if (sortDirection === 'asc') {
							return (aValue as string | number) > (bValue as string | number) ? 1 : -1
						} else {
							return (aValue as string | number) < (bValue as string | number) ? 1 : -1
						}
					})

					return { filtered, hasActiveFilters, totalCases: cases.length }
				}, [
					cases,
					statusFilter,
					branchFilter,
					sortField,
					sortDirection,
					showPdfReadyOnly,
					searchTerm,
					onSearch,
					selectedDoctors,
				])

				// Paginación
				const totalPages = Math.ceil(filteredAndSortedCases.filtered.length / itemsPerPage)
				const startIndex = (currentPage - 1) * itemsPerPage
				const endIndex = startIndex + itemsPerPage
				const paginatedCases = filteredAndSortedCases.filtered.slice(startIndex, endIndex)

				// Funciones de paginación
				const goToPage = useCallback(
					(page: number) => {
						setCurrentPage(Math.max(1, Math.min(page, totalPages)))
					},
					[totalPages],
				)

				const goToNextPage = useCallback(() => {
					if (currentPage < totalPages) {
						setCurrentPage(currentPage + 1)
					}
				}, [currentPage, totalPages])

				const goToPreviousPage = useCallback(() => {
					if (currentPage > 1) {
						setCurrentPage(currentPage - 1)
					}
				}, [currentPage])

				const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
					setItemsPerPage(newItemsPerPage)
					setCurrentPage(1) // Reset to first page when changing items per page
				}, [])

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

				// Mobile Card Component - Memoized to prevent unnecessary re-renders
				const CaseCard = useCallback(
					({ case_ }: { case_: MedicalRecord }) => {
						return (
							<div className="bg-white dark:bg-background rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md">
								{/* Header with status and code */}
								<div className="flex flex-wrap gap-1.5 mb-2">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
											case_.payment_status,
										)}`}
									>
										{case_.payment_status}
									</span>
									<div className="flex items-center">
										{case_.code && (
											<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
												{case_.code}
											</span>
										)}
									</div>
								</div>

								{/* Patient info */}
								<div className="grid grid-cols-1 gap-2 mb-2">
									<div>
										<div className="flex items-center gap-2">
											<User className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
											<div className="min-w-0">
												<p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
													{case_.full_name}
												</p>
											</div>
										</div>
									</div>

									<div>
										<p className="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
										<p className="text-sm text-gray-900 dark:text-gray-100 truncate">{case_.exam_type}</p>
									</div>
								</div>

								{/* Medical info */}
								<div className="grid grid-cols-2 gap-2 mb-2">
									<div>
										<p className="text-xs text-gray-500 dark:text-gray-400">Sede</p>
										<BranchBadge branch={case_.branch} className="text-xs" />
									</div>

									<div>
										<p className="text-xs text-gray-500 dark:text-gray-400">Monto</p>
										<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
											${case_.total_amount.toLocaleString()}
										</p>
									</div>
								</div>

								{/* Action buttons */}
								<div className="flex justify-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
									<CaseActionsPopover case_={case_} />
								</div>
							</div>
						)
					},
					[getStatusColor, handleCaseSelect, handleGenerateCase, handleDownloadCase, isDownloading],
				)

				// Componente de paginación
				const Pagination = useCallback(() => {
					if (totalPages <= 1) return null

					const getPageNumbers = () => {
						const pages = []
						const maxVisiblePages = 5
						let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
						const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

						if (endPage - startPage + 1 < maxVisiblePages) {
							startPage = Math.max(1, endPage - maxVisiblePages + 1)
						}

						for (let i = startPage; i <= endPage; i++) {
							pages.push(i)
						}

						return pages
					}

					return (
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
							{/* Información de resultados */}
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAndSortedCases.filtered.length)} de{' '}
								{filteredAndSortedCases.filtered.length} casos
							</div>

							{/* Controles de paginación */}
							<div className="flex items-center gap-2">
								{/* Items por página */}
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-600 dark:text-gray-400">Mostrar:</span>
									<select
										value={itemsPerPage}
										onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
										className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
									>
										<option value={10}>10</option>
										<option value={20}>20</option>
										<option value={50}>50</option>
										<option value={100}>100</option>
									</select>
								</div>

								{/* Botones de navegación */}
								<div className="flex items-center gap-1">
									<button
										onClick={goToPreviousPage}
										disabled={currentPage === 1}
										className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
										title="Página anterior"
									>
										<ChevronLeft className="w-4 h-4" />
									</button>

									{/* Números de página */}
									{getPageNumbers().map((page) => (
										<button
											key={page}
											onClick={() => goToPage(page)}
											className={`px-3 py-2 text-sm rounded-md transition-none ${
												page === currentPage
													? 'bg-primary text-white'
													: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
											}`}
										>
											{page}
										</button>
									))}

									<button
										onClick={goToNextPage}
										disabled={currentPage === totalPages}
										className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
										title="Página siguiente"
									>
										<ChevronRight className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
					)
				}, [
					currentPage,
					totalPages,
					startIndex,
					endIndex,
					filteredAndSortedCases.filtered.length,
					itemsPerPage,
					handleItemsPerPageChange,
					goToPage,
					goToNextPage,
					goToPreviousPage,
				])

				// Render loading state
				if (isLoading) {
					return (
						<div className="bg-white dark:bg-background rounded-xl h-full">
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

				// Render error state
				if (error) {
					return (
						<div className="bg-white dark:bg-background rounded-xl h-full">
							<div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
								<div className="text-center py-12">
									<div className="text-red-500 dark:text-red-400">
										<p className="text-lg font-medium">Error al cargar los casos</p>
										<p className="text-sm mt-2">Verifica tu conexión a internet o contacta al administrador</p>
										<button
											onClick={() => refetch()}
											className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
										>
											Reintentar
										</button>
									</div>
								</div>
							</div>
						</div>
					)
				}

				// Fullscreen view
				if (isFullscreen) {
					return (
						<div className="fixed inset-0 z-[999999] bg-white dark:bg-background h-screen flex flex-col overflow-hidden">
							{/* Fixed Header with Controls */}
							<div className="flex-shrink-0 p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-background">
								<div className="flex flex-wrap items-center gap-2 sm:gap-4">
									{/* Search and Filters Row */}
									<div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1">
										{/* Search - Acortada */}
										<div className="w-full sm:max-w-md relative flex-1">
											<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
											<Input
												type="text"
												placeholder="Buscar por nombre, código, cédula, estudio o médico..."
												value={searchTerm}
												onChange={handleSearchChange}
												onKeyDown={handleSearchKeyDown}
												className="pl-10"
											/>
											{isSearching && (
												<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
												</div>
											)}
										</div>

										{/* Status Filter - Updated with only Pagado and Incompleto */}
										<div className="flex items-center gap-2">
											<select
												title="Filtrar por estado"
												value={statusFilter}
												onChange={(e) => setStatusFilter(e.target.value)}
												className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-none duration-200"
											>
												<option value="all">Todos los estatus</option>
												<option value="Pagado">Pagado</option>
												<option value="Incompleto">Incompleto</option>
											</select>
										</div>

										{/* Branch Filter - Only show if user doesn't have assigned branch */}
										<div className="flex items-center gap-2">
											<select
												title="Filtrar por sede"
												value={branchFilter}
												onChange={(e) => setBranchFilter(e.target.value)}
												className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-none duration-200"
											>
												<option value="all">Todas las sedes</option>
												<option value="PMG">PMG</option>
												<option value="CPC">CPC</option>
												<option value="CNX">CNX</option>
												<option value="STX">STX</option>
												<option value="MCY">MCY</option>
											</select>
										</div>

										{/* Doctor Filter Button */}
										<Button
											onClick={toggleDoctorFilter}
											variant={showDoctorFilter ? 'default' : 'outline'}
											className="flex items-center gap-2"
											title="Filtrar por médico"
										>
											<Stethoscope className="w-4 h-4 hidden sm:inline" />
											<span className="inline">Médicos</span>
											{selectedDoctors.length > 0 && (
												<span className="bg-white dark:bg-gray-800 text-primary text-xs px-2 py-0.5 rounded-full">
													{selectedDoctors.length}
												</span>
											)}
										</Button>

										{/* PDF Ready Filter */}
										<Button
											onClick={handlePdfFilterToggle}
											variant={showPdfReadyOnly ? 'default' : 'outline'}
											className="flex items-center gap-2"
											title="Filtrar PDF disponibles"
										>
											<FileText className="w-4 h-4" />
											<span className="text-sm font-medium">PDF</span>
										</Button>
									</div>

									{/* Results count */}
									<div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block"></div>

									{/* Close button */}
									<button
										onClick={() => setIsFullscreen(false)}
										className="text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 text-sm border px-2 sm:px-3 py-1 rounded-md ml-auto sm:ml-0"
									>
										<span className="hidden sm:inline">Cerrar</span> ✕
									</button>
								</div>
							</div>

							{/* Doctor Filter Panel - Conditionally rendered */}
							{showDoctorFilter && (
								<div className="mb-4">
									<DoctorFilterPanel cases={cases} onFilterChange={handleDoctorFilterChange} />
								</div>
							)}

							{/* Active filters indicators */}
							<div className="flex flex-wrap gap-2 mb-4">
								{statusFilter !== 'all' && (
									<div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg inline-block">
										<span className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
											<Filter className="w-4 h-4" />
											Estado: {statusFilter}
										</span>
									</div>
								)}

								{selectedDoctors.length > 0 && (
									<div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg inline-block">
										<span className="text-sm font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2">
											<Stethoscope className="w-4 h-4" />
											{selectedDoctors.length === 1
												? `Médico: ${selectedDoctors[0]}`
												: `${selectedDoctors.length} médicos seleccionados`}
										</span>
									</div>
								)}
							</div>

							{/* Scrollable Content Area */}
							<div className="flex-1 overflow-hidden">
								{/* Mobile View - Cards */}
								<div className="block lg:hidden h-full overflow-y-auto px-3 py-4">
									<div className="p-2 sm:p-4 space-y-3 max-h-[60vh] overflow-y-auto">
										{paginatedCases.length > 0 ? (
											paginatedCases.map((case_) => <CaseCard key={case_.id} case_={case_} />)
										) : (
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

								{/* Desktop View - Table with virtualization */}
								<div className="hidden lg:block h-full overflow-y-auto">
									<table className="w-full responsive-table">
										<thead className="bg-gray-50/50 dark:bg-background/50 backdrop-blur-[10px] sticky top-0 z-[60]">
											<tr>
												<th className="px-4 py-3 text-left">
													<button
														onClick={() => handleSort('code')}
														className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
													>
														Código / Estatus
														<SortIcon field="code" />
													</button>
												</th>
												<th className="px-4 py-3 text-left">
													<button
														onClick={() => handleSort('created_at')}
														className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
													>
														Fecha de Registro
														<SortIcon field="created_at" />
													</button>
												</th>
												<th className="px-4 py-3 text-left">
													<button
														onClick={() => handleSort('full_name')}
														className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
													>
														Paciente
														<SortIcon field="full_name" />
													</button>
												</th>
												<th className="px-3 py-3 text-center">
													<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
														Sede
													</span>
												</th>
												<th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
													Estudio
												</th>
												<th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
													Médico Tratante
												</th>
												<th className="px-4 py-3 text-left">
													<button
														onClick={() => handleSort('total_amount')}
														className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
													>
														Monto Total
														<SortIcon field="total_amount" />
													</button>
												</th>
												<th className="px-4 py-3 text-center">
													<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
														Opciones
													</span>
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
											{paginatedCases.length > 0 ? (
												// Render paginated cases
												paginatedCases.map((case_) => {
													const ageDisplay = case_.edad ? getAgeDisplay(case_.edad) : ''

													return (
														<tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
															<td className="px-4 py-4">
																<div className="flex flex-col items-start space-y-1 text-left">
																	{case_.code && (
																		<div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mb-1">
																			{case_.code}
																		</div>
																	)}
																	<span
																		className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
																			case_.payment_status,
																		)}`}
																	>
																		{case_.payment_status}
																	</span>
																</div>
															</td>
															<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-left">
																{case_.created_at ? new Date(case_.created_at).toLocaleDateString('es-ES') : 'N/A'}
															</td>
															<td className="px-4 py-4">
																<div className="text-left">
																	<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
																		{case_.full_name}
																	</div>
																	<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
																		<span>{case_.id_number}</span>
																		{ageDisplay && (
																			<>
																				<span>•</span>
																				<span>{ageDisplay}</span>
																			</>
																		)}
																	</div>
																</div>
															</td>
															<td className="text-sm text-gray-900 dark:text-gray-100">
																<BranchBadge branch={case_.branch} />
															</td>
															<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-center">
																{case_.exam_type}
															</td>
															<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
																{case_.treating_doctor}
															</td>
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
																<div className="flex justify-center mx-5">
																	<CaseActionsPopover case_={case_} />
																</div>
															</td>
														</tr>
													)
												})
											) : (
												<tr>
													<td colSpan={8}>
														<div className="text-center py-12">
															<div className="text-gray-500 dark:text-gray-400">
																<Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
																<p className="text-lg font-medium">No se encontraron casos</p>
																<p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
															</div>
														</div>
													</td>
												</tr>
											)}
										</tbody>
									</table>

									{/* Paginación en vista fullscreen */}
									<Pagination />
								</div>
							</div>
						</div>
					)
				}

				return (
					<>
						<div className="bg-white dark:bg-background rounded-xl h-full overflow-hidden">
							{/* Search and Filter Controls */}
							<div className="p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700">
								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
									{/* Search and Filters Row */}
									<div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
										{/* Search - Acortada */}
										<div className="flex-1 min-w-[200px] relative">
											<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
											<Input
												type="text"
												placeholder="Buscar por nombre, código, cédula, estudio o médico..."
												value={searchTerm}
												onChange={handleSearchChange}
												onKeyDown={handleSearchKeyDown}
												className="pl-10"
											/>
											{isSearching && (
												<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
												</div>
											)}
										</div>

										{/* Status Filter - Updated with only Pagado and Incompleto */}
										<div className="flex items-center gap-2 flex-shrink-0">
											<select
												title="Filtrar por estado"
												value={statusFilter}
												onChange={(e) => setStatusFilter(e.target.value)}
												className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-none duration-200"
											>
												<option value="all">Todos los estatus</option>
												<option value="Pagado">Pagado</option>
												<option value="Incompleto">Incompleto</option>
											</select>
										</div>

										{/* Branch Filter */}
										<div className="flex items-center gap-2 flex-shrink-0">
											<select
												title="Filtrar por sede"
												value={branchFilter}
												onChange={(e) => setBranchFilter(e.target.value)}
												className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-none duration-200"
											>
												<option value="all">Todas las sedes</option>
												<option value="PMG">PMG</option>
												<option value="CPC">CPC</option>
												<option value="CNX">CNX</option>
												<option value="STX">STX</option>
												<option value="MCY">MCY</option>
											</select>
										</div>

										{/* Doctor Filter Button */}
										<Button
											onClick={toggleDoctorFilter}
											variant={showDoctorFilter ? 'default' : 'outline'}
											className="flex items-center gap-2 flex-shrink-0"
											title="Filtrar por médico"
										>
											<Stethoscope className="w-4 h-4 hidden sm:inline" />
											<span className="inline">Médicos</span>
											{selectedDoctors.length > 0 && (
												<span className="bg-white dark:bg-gray-800 text-primary text-xs px-2 py-0.5 rounded-full">
													{selectedDoctors.length}
												</span>
											)}
										</Button>

										{/* PDF Ready Filter */}
										<Button
											onClick={handlePdfFilterToggle}
											variant={showPdfReadyOnly ? 'default' : 'outline'}
											className="flex items-center gap-2 flex-shrink-0"
											title="Filtrar PDF disponibles"
										>
											<FileText className="w-4 h-4" />
											<span className="text-sm font-medium">PDF</span>
										</Button>

										{/* Results count */}
										<div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:flex"></div>

										{/* Fullscreen Button */}
										<button
											onClick={() => setIsFullscreen(true)}
											className="hidden lg:flex items-center gap-2 px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex-shrink-0 whitespace-nowrap"
										>
											<Maximize2 className="w-4 h-4" />
											Expandir
										</button>
									</div>
								</div>
							</div>

							{/* Doctor Filter Panel - Conditionally rendered */}
							{showDoctorFilter && (
								<div className="mb-4">
									<DoctorFilterPanel cases={cases} onFilterChange={handleDoctorFilterChange} />
								</div>
							)}

							{/* Mobile View - Cards */}
							<div className="block lg:hidden overflow-hidden">
								<div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
									{paginatedCases.length > 0 ? (
										paginatedCases.map((case_) => <CaseCard key={case_.id} case_={case_} />)
									) : (
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
								<div className="overflow-x-auto responsive-table">
									<div className="max-h-[60vh] overflow-y-auto">
										<table className="w-full min-w-[800px]">
											<thead className="bg-gray-50/50 dark:bg-background/50 backdrop-blur-[10px] sticky top-0 z-[50]">
												<tr>
													<th className="px-4 py-3 text-left">
														<button
															onClick={() => handleSort('code')}
															className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
														>
															Código / Estatus
															<SortIcon field="code" />
														</button>
													</th>
													<th className="px-4 py-3 text-left">
														<button
															onClick={() => handleSort('created_at')}
															className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
														>
															Fecha de Registro
															<SortIcon field="created_at" />
														</button>
													</th>
													<th className="px-4 py-3 text-left">
														<button
															onClick={() => handleSort('full_name')}
															className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
														>
															Paciente
															<SortIcon field="full_name" />
														</button>
													</th>
													<th className="px-3 py-3 text-center">
														<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
															Sede
														</span>
													</th>
													<th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
														Estudio
													</th>
													<th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
														Médico Tratante
													</th>
													<th className="px-4 py-3 text-left">
														<button
															onClick={() => handleSort('total_amount')}
															className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 text-left"
														>
															Monto Total
															<SortIcon field="total_amount" />
														</button>
													</th>
													<th className="px-4 py-3 text-center">
														<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
															Opciones
														</span>
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
												{paginatedCases.length > 0 ? (
													// Render paginated cases
													paginatedCases.map((case_) => {
														const ageDisplay = case_.edad || ''

														return (
															<tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
																<td className="px-4 py-4">
																	<div className="flex flex-col items-start space-y-1 text-left">
																		{case_.code && (
																			<div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mb-1">
																				{case_.code}
																			</div>
																		)}
																		<span
																			className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
																				case_.payment_status,
																			)}`}
																		>
																			{case_.payment_status}
																		</span>
																	</div>
																</td>
																<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-left">
																	{case_.created_at ? new Date(case_.created_at).toLocaleDateString('es-ES') : 'N/A'}
																</td>
																<td className="px-4 py-4">
																	<div className="text-left">
																		<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
																			{case_.full_name}
																		</div>
																		<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
																			<span>{case_.id_number}</span>
																			{ageDisplay && (
																				<>
																					<span>•</span>
																					<span>{ageDisplay}</span>
																				</>
																			)}
																		</div>
																	</div>
																</td>
																<td className="text-sm text-gray-900 dark:text-gray-100">
																	<BranchBadge branch={case_.branch} />
																</td>
																<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-center">
																	{case_.exam_type}
																</td>
																<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
																	{case_.treating_doctor}
																</td>
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
																	<div className="flex justify-center mx-5">
																		<CaseActionsPopover case_={case_} />
																	</div>
																</td>
															</tr>
														)
													})
												) : (
													<tr>
														<td colSpan={8}>
															<div className="text-center py-12">
																<div className="text-gray-500 dark:text-gray-400">
																	<Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
																	<p className="text-lg font-medium">No se encontraron casos</p>
																	<p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
																</div>
															</div>
														</td>
													</tr>
												)}
											</tbody>
										</table>

										{/* Paginación en vista normal */}
									</div>
									<Pagination />
								</div>
							</div>
						</div>

						{/* Unified View/Edit Modal */}
						<UnifiedCaseModal
							case_={selectedCaseForView}
							isOpen={isViewModalOpen}
							onClose={() => {
								setIsViewModalOpen(false)
								setSelectedCaseForView(null)
							}}
							onSave={() => {
								// Refetch the data to update the cases list
								refetch()

								// Mark that we should update the selected case when data changes
								setShouldUpdateSelectedCase(true)
							}}
							onDelete={() => {
								setIsViewModalOpen(false)
								setSelectedCaseForView(null)
								refetch()
							}}
							onCaseSelect={handleCaseSelect}
						/>

						{/* Generate Case Modal - Solo para admin y solo para inmunohistoquímica */}
						{(profile?.role === 'admin' || profile?.role === 'owner') &&
							selectedCaseForGenerate?.exam_type?.toLowerCase().includes('inmuno') && (
								<RequestCaseModal
									case_={selectedCaseForGenerate}
									isOpen={isGenerateModalOpen}
									onClose={() => {
										setIsGenerateModalOpen(false)
										setSelectedCaseForGenerate(null)
									}}
									onSuccess={() => {
										refetch()
									}}
								/>
							)}

						{/* Steps Case Modal - Para todos los roles */}
						<HorizontalLinearStepper
							case_={selectedCaseForGenerate as MedicalRecord}
							isOpen={isStepsModalOpen}
							onClose={() => {
								setIsStepsModalOpen(false)
								setSelectedCaseForGenerate(null)
							}}
							onSuccess={() => {
								refetch()
							}}
						/>
					</>
				)
	},
)

CasesTable.displayName = 'CasesTable'

export default CasesTable
