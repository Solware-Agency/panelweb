import React, { useState, useMemo, useCallback } from 'react'
import {
	ChevronUp,
	ChevronDown,
	Search,
	Filter,
	Eye,
	CalendarIcon,
	User,
	Stethoscope,
	CreditCard,
	FileText,
	Download,
	Maximize2,
	Edit2,
} from 'lucide-react'
import type { MedicalRecord } from '@lib/supabase-service'
import { getAgeDisplay } from '@lib/supabase-service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useToast } from '@shared/hooks/use-toast'
import { Button } from '@shared/components/ui/button'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import GenerateBiopsyModal from './GenerateBiopsyModal'
import DoctorFilterPanel from './DoctorFilterPanel'
import { generatePDF } from '@shared/utils/pdf-generator'
import UnifiedCaseModal from './UnifiedCaseModal'

interface CasesTableProps {
	onCaseSelect: (case_: MedicalRecord) => void
	cases: MedicalRecord[]
	isLoading: boolean
	error: any
	refetch: () => void
	isFullscreen: boolean
	setIsFullscreen: (value: boolean) => void
	onSearch?: (term: string) => void
}

type SortField = 'id' | 'created_at' | 'full_name' | 'date_of_birth' | 'total_amount' | 'code'
type SortDirection = 'asc' | 'desc'

const CasesTable: React.FC<CasesTableProps> = ({
	onCaseSelect,
	cases,
	isLoading,
	error,
	refetch,
	isFullscreen,
	setIsFullscreen,
	onSearch,
}) => {
	useAuth()
	const { profile } = useUserProfile()
	const { toast } = useToast()
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [branchFilter, setBranchFilter] = useState<string>('all')
	const [examTypeFilter, setExamTypeFilter] = useState<string>('all')
	const [sortField, setSortField] = useState<SortField>('created_at')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
	const [selectedCaseForGenerate, setSelectedCaseForGenerate] = useState<MedicalRecord | null>(null)
	const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
	const [isDownloading, setIsDownloading] = useState<string | null>(null)
	const [selectedCaseForEdit, setSelectedCaseForEdit] = useState<MedicalRecord | null>(null)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [showPdfReadyOnly, setShowPdfReadyOnly] = useState(false)
	const [selectedDoctors, setSelectedDoctors] = useState<string[]>([])
	const [showDoctorFilter, setShowDoctorFilter] = useState(false)
	const [isSearching, setIsSearching] = useState(false)

	// Determine if user can edit, delete, or generate cases based on role
	const canEdit = profile?.role === 'owner' || profile?.role === 'employee'
	const canGenerate = profile?.role === 'owner' || profile?.role === 'admin'

	// Use a ref to track if we're in the dashboard or form view

	const getStatusColor = useCallback((status: string) => {
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
			if (!canGenerate) {
				toast({
					title: '❌ Permiso denegado',
					description: 'No tienes permisos para generar casos.',
					variant: 'destructive',
				})
				return
			}

			// Check if this is a biopsy case
			if (case_.exam_type?.toLowerCase() !== 'biopsia') {
				toast({
					title: '❌ Tipo de examen incorrecto',
					description: 'La generación de casos solo está disponible para biopsias.',
					variant: 'destructive',
				})
				return
			}

			setSelectedCaseForGenerate(case_)
			setIsGenerateModalOpen(true)
		},
		[toast, canGenerate],
	)

	const handleEditCase = useCallback(
		(case_: MedicalRecord) => {
			// Check if user has permission to edit cases
			if (!canEdit) {
				toast({
					title: '❌ Permiso denegado',
					description: 'No tienes permisos para editar casos.',
					variant: 'destructive',
				})
				return
			}

			setSelectedCaseForEdit(case_)
			setIsEditModalOpen(true)
		},
		[canEdit, toast],
	)

	const handleDownloadCase = useCallback(
		async (case_: MedicalRecord) => {
			// Check if this case has a diagnosis
			if (!case_.diagnostico) {
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
				await generatePDF(case_)

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

	// Handle search button click
	const handleSearchClick = useCallback(() => {
		if (onSearch) {
			setIsSearching(true)
			onSearch(searchTerm)
			setTimeout(() => setIsSearching(false), 500)
		}
	}, [onSearch, searchTerm])

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

	// Memoize the filtered and sorted cases to improve performance
	const filteredAndSortedCases = useMemo(() => {
		if (!cases || !Array.isArray(cases)) {
			console.warn('Cases is not an array:', cases)
			return []
		}

		// Apply client-side filtering only for local filters
		// (searchTerm is handled by the parent component via onSearch)
		let filtered = cases.filter((case_) => {
			// Skip if case_ is null or undefined
			if (!case_) return false

			// Doctor filter
			const matchesDoctor =
				selectedDoctors.length === 0 ||
				(case_.treating_doctor && selectedDoctors.includes(case_.treating_doctor.trim()))

			// Status filter
			let matchesStatus = true
			if (statusFilter === 'Completado') {
				matchesStatus = case_.payment_status === 'Completado'
			} else if (statusFilter === 'Incompleto') {
				// "Incompleto" includes all non-completed statuses
				matchesStatus = case_.payment_status !== 'Completado'
			}
			// If statusFilter is 'all', matchesStatus remains true

			// Branch filter
			const normalize = (str: string | null | undefined) => (str ? str.trim().toLowerCase() : '')
			const matchesBranch = branchFilter === 'all' || normalize(case_.branch) === normalize(branchFilter)

			// Exam type filter
			const matchesExamType = examTypeFilter === 'all' || case_.exam_type === examTypeFilter

			// PDF ready filter
			let matchesPdfReady = true
			if (showPdfReadyOnly) {
				const isBiopsyCase = case_.exam_type?.toLowerCase() === 'biopsia'
				matchesPdfReady = isBiopsyCase && !!case_.diagnostico
			}

			// Local search filter (only if onSearch is not provided)
			let matchesSearch = true
			if (!onSearch && searchTerm) {
				matchesSearch =
					(case_.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
					(case_.id_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
					(case_.treating_doctor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
					(case_.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
					(case_.branch?.toLowerCase() || '').includes(searchTerm.toLowerCase())
			}

			return matchesStatus && matchesBranch && matchesExamType && matchesPdfReady && matchesSearch && matchesDoctor
		})

		// Apply sorting
		filtered.sort((a, b) => {
			let aValue: any = a[sortField]
			let bValue: any = b[sortField]

			if (sortField === 'created_at' || sortField === 'date_of_birth') {
				aValue = new Date(aValue as string).getTime()
				bValue = new Date(bValue as string).getTime()
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
	}, [
		cases,
		statusFilter,
		branchFilter,
		examTypeFilter,
		sortField,
		sortDirection,
		showPdfReadyOnly,
		searchTerm,
		onSearch,
		selectedDoctors,
	])

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
			const ageDisplay = case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : ''
			const isBiopsyCase = case_.exam_type?.toLowerCase() === 'biopsia'
			const hasDownloadableContent = isBiopsyCase && !!case_.diagnostico

			return (
				<div className="bg-white dark:bg-background rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
					{/* Header with status and code */}
					<div className="flex items-center justify-between mb-3">
						<span
							className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
								case_.payment_status,
							)}`}
						>
							{case_.payment_status}
						</span>
						<div className="flex items-center gap-2">
							{case_.code && (
								<span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
									{case_.code}
								</span>
							)}
						</div>
					</div>

					{/* Patient info */}
					<div className="flex items-center gap-2 mb-2">
						<User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
						<div>
							<p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{case_.full_name}</p>
							<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
								<span>{case_.id_number}</span>
								{ageDisplay && (
									<>
										<span>•</span>
										<span>{ageDisplay}</span>
									</>
								)}
							</div>
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
							<CalendarIcon className="w-3 h-3 text-gray-400" />
							<span className="text-xs text-gray-500 dark:text-gray-400">
								{case_.created_at ? format(new Date(case_.created_at), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
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
						<div className="mt-2 text-xs text-red-600 dark:text-red-400">
							Faltante: ${case_.remaining.toLocaleString()}
						</div>
					)}

					{/* Action buttons */}
					<div className="flex gap-1 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
						<button
							onClick={() => onCaseSelect(case_)}
							className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
						>
							<Eye className="w-3 h-3" />
							Ver
						</button>
						<button
							onClick={() => handleEditCase(case_)}
							className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
							disabled={!canEdit}
						>
							<Edit2 className="w-3 h-3" />
							Editar
						</button>
						{isBiopsyCase && (
							<button
								onClick={() => handleGenerateCase(case_)}
								className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
								disabled={!canGenerate}
							>
								<FileText className="w-3 h-3" />
								Generar
							</button>
						)}
						{hasDownloadableContent && (
							<button
								onClick={() => handleDownloadCase(case_)}
								className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
								disabled={isDownloading === case_.id}
							>
								{isDownloading === case_.id ? (
									<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
								) : (
									<Download className="w-3 h-3" />
								)}
								PDF
							</button>
						)}
					</div>
				</div>
			)
		},
		[getStatusColor, onCaseSelect, handleEditCase, handleGenerateCase, handleDownloadCase, isDownloading],
	)

	// Render loading state
	if (isLoading) {
		return (
			<div className="bg-white dark:bg-background rounded-xl transition-colors duration-300 h-full">
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
			<div className="bg-white dark:bg-background rounded-xl transition-colors duration-300 h-full">
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
								<input
									type="text"
									placeholder="Buscar por nombre, código, cédula, estudio o médico..."
									value={searchTerm}
									onChange={handleSearchChange}
									onKeyDown={handleSearchKeyDown}
									className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								/>
								{isSearching && (
									<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
									</div>
								)}
							</div>

							{/* Search Button */}
							<Button
								onClick={handleSearchClick}
								disabled={isSearching || !searchTerm.trim()}
								className="whitespace-nowrap sm:flex-none"
							>
								Buscar
							</Button>

							{/* Status Filter - Updated with only Completado and Incompleto */}
							<div className="flex items-center gap-2">
								<Filter className="size-4 text-gray-400 mr-2" />
								<select
									title="Filtrar por estado"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todos los estatus</option>
									<option value="Completado">Completado</option>
									<option value="Incompleto">Incompleto</option>
								</select>
							</div>

							{/* Branch Filter - Only show if user doesn't have assigned branch */}
							<div className="flex items-center gap-2">
								<select
									title="Filtrar por sede"
									value={branchFilter}
									onChange={(e) => setBranchFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todas las sedes</option>
									<option value="PMG">PMG</option>
									<option value="CPC">CPC</option>
									<option value="CNX">CNX</option>
									<option value="STX">STX</option>
									<option value="MCY">MCY</option>
								</select>
							</div>

							{/* Exam Type Filter */}
							<div className="flex items-center gap-2">
								<select
									title="Filtrar por tipo de examen"
									value={examTypeFilter}
									onChange={(e) => setExamTypeFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todos los estudios</option>
									<option value="inmunohistoquimica">Inmunohistoquímica</option>
									<option value="biopsia">Biopsia</option>
									<option value="citologia">Citología</option>
								</select>
							</div>

							{/* Doctor Filter Button */}
							<Button
								onClick={toggleDoctorFilter}
								variant={showDoctorFilter ? 'default' : 'outline'}
								className="flex items-center gap-2"
								title="Filtrar por médico"
							>
								<Stethoscope className="w-4 h-4" />
								<span className="hidden sm:inline">Médicos</span>
								{selectedDoctors.length > 0 && (
									<span className="bg-white dark:bg-gray-800 text-primary text-xs px-2 py-0.5 rounded-full">
										{selectedDoctors.length}
									</span>
								)}
							</Button>

							{/* PDF Ready Filter */}
							<div className="flex items-center gap-2">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={showPdfReadyOnly}
										onChange={handlePdfFilterToggle}
										className="rounded border-gray-300 text-primary focus:ring-primary"
									/>
									<span className="text-sm">Solo PDF disponibles</span>
								</label>
							</div>
						</div>

						{/* Results count */}
						<div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
							Mostrando {filteredAndSortedCases.length} de {cases.length} casos
						</div>

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
				<div className="flex-1 overflow-hidden mobile-scroll-container">
					{/* Mobile View - Cards */}
					<div className="block lg:hidden h-full overflow-y-auto px-3 py-4">
						<div className="space-y-3">
							{filteredAndSortedCases.length > 0 ? (
								filteredAndSortedCases.map((case_) => <CaseCard key={case_.id} case_={case_} />)
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
							<thead className="bg-gray-50/50 dark:bg-background/50 backdrop-blur-[10px] sticky top-0 z-50">
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
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Acciones
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{filteredAndSortedCases.length > 0 ? (
									// Only render the first 100 rows for better performance
									filteredAndSortedCases.slice(0, 100).map((case_) => {
										const ageDisplay = case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : ''
										const isBiopsyCase = case_.exam_type?.toLowerCase() === 'biopsia'
										const hasDownloadableContent = isBiopsyCase && !!case_.diagnostico

										return (
											<tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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
													<div className="bg-gray-200 dark:bg-gray-900/60 hover:bg-gray-300 dark:hover:bg-gray-800/80 text-center border border-gray-500 dark:border-gray-700 rounded-lg px-1 py-1">
														{case_.branch}
													</div>
												</td>
												<td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 text-center">
													{case_.exam_type}
												</td>
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
													<div className="flex gap-2">
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
														<button
															onClick={(e) => {
																e.stopPropagation()
																handleEditCase(case_)
															}}
															disabled={!canEdit}
															className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
														>
															<Edit2 className="w-3 h-3" />
															Editar
														</button>
														{isBiopsyCase && (
															<button
																onClick={(e) => {
																	e.stopPropagation()
																	handleGenerateCase(case_)
																}}
																disabled={!canGenerate}
																className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
															>
																<FileText className="w-3 h-3" />
																Generar
															</button>
														)}
														{hasDownloadableContent && (
															<button
																onClick={(e) => {
																	e.stopPropagation()
																	handleDownloadCase(case_)
																}}
																className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
																disabled={isDownloading === case_.id}
															>
																{isDownloading === case_.id ? (
																	<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
																) : (
																	<Download className="w-3 h-3" />
																)}
																PDF
															</button>
														)}
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

						{filteredAndSortedCases.length > 100 && (
							<div className="text-center py-4 border-t border-gray-200 dark:border-gray-700">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Mostrando 100 de {filteredAndSortedCases.length} casos
								</p>
								<button
									onClick={() => setIsFullscreen(true)}
									className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
								>
									Ver todos los casos
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="bg-white dark:bg-background rounded-xl transition-colors duration-300 h-full overflow-hidden">
				{/* Search and Filter Controls */}
				<div className="p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
						{/* Search and Filters Row */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full">
							{/* Search - Acortada */}
							<div className="col-span-1 sm:col-span-1 lg:col-span-1 relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									type="text"
									placeholder="Buscar por nombre, código, cédula, estudio o médico..."
									value={searchTerm}
									onChange={handleSearchChange}
									onKeyDown={handleSearchKeyDown}
									className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								/>
								{isSearching && (
									<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
									</div>
								)}
							</div>

							{/* Search Button */}
							<Button
								onClick={handleSearchClick}
								disabled={isSearching || !searchTerm.trim()}
								className="col-span-1 sm:col-span-1 lg:col-span-1 whitespace-nowrap"
							>
								Buscar
							</Button>

							{/* Status Filter - Updated with only Completado and Incompleto */}
							<div className="col-span-1 sm:col-span-1 lg:col-span-1 flex items-center gap-2">
								<Filter className="w-4 h-4 text-gray-400" />
								<select
									title="Filtrar por estado"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todos los estatus</option>
									<option value="Completado">Completado</option>
									<option value="Incompleto">Incompleto</option>
								</select>
							</div>

							{/* Branch Filter */}
							<div className="col-span-1 sm:col-span-1 lg:col-span-1 flex items-center gap-2">
								<select
									title="Filtrar por sede"
									value={branchFilter}
									onChange={(e) => setBranchFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todas las sedes</option>
									<option value="PMG">PMG</option>
									<option value="CPC">CPC</option>
									<option value="CNX">CNX</option>
									<option value="STX">STX</option>
									<option value="MCY">MCY</option>
								</select>
							</div>

							{/* Exam Type Filter */}
							<div className="flex items-center gap-2">
								<select
									title="Filtrar por tipo de examen"
									value={examTypeFilter}
									onChange={(e) => setExamTypeFilter(e.target.value)}
									className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm"
								>
									<option value="all">Todos los estudios</option>
									<option value="inmunohistoquimica">Inmunohistoquímica</option>
									<option value="biopsia">Biopsia</option>
									<option value="citologia">Citología</option>
								</select>
							</div>

							{/* Doctor Filter Button */}
							<Button
								onClick={toggleDoctorFilter}
								variant={showDoctorFilter ? 'default' : 'outline'}
								className="flex items-center gap-2"
								title="Filtrar por médico"
							>
								<Stethoscope className="w-4 h-4" />
								<span className="hidden sm:inline">Médicos</span>
								{selectedDoctors.length > 0 && (
									<span className="bg-white dark:bg-gray-800 text-primary text-xs px-2 py-0.5 rounded-full">
										{selectedDoctors.length}
									</span>
								)}
							</Button>

							{/* PDF Ready Filter */}
							<div className="flex items-center gap-2">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={showPdfReadyOnly}
										onChange={handlePdfFilterToggle}
										className="rounded border-gray-300 text-primary focus:ring-primary"
									/>
									<span className="text-sm">Solo PDF disponibles</span>
								</label>
							</div>

							{/* Fullscreen Button */}
							<button
								onClick={() => setIsFullscreen(true)}
								className="hidden lg:flex px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary dark:bg-background dark:text-white text-sm items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							>
								<Maximize2 className="w-4 h-4" />
								Expandir
							</button>
						</div>

						{/* Results count */}
						<div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
							Mostrando {filteredAndSortedCases.length} de {cases.length} casos
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
						{filteredAndSortedCases.length > 0 ? (
							filteredAndSortedCases.slice(0, 50).map((case_) => <CaseCard key={case_.id} case_={case_} />)
						) : (
							<div className="text-center py-12">
								<div className="text-gray-500 dark:text-gray-400">
									<Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
									<p className="text-lg font-medium">No se encontraron casos</p>
									<p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
								</div>
							</div>
						)}

						{filteredAndSortedCases.length > 50 && (
							<div className="text-center py-4 border-t border-gray-200 dark:border-gray-700">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Mostrando 50 de {filteredAndSortedCases.length} casos
								</p>
								<button
									onClick={() => setIsFullscreen(true)}
									className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
								>
									Ver todos los casos
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Desktop View - Table */}
				<div className="hidden lg:block">
					<div className="overflow-x-auto responsive-table">
						<div className="max-h-[60vh] overflow-y-auto">
							{/* Doctor Filter Panel - Conditionally rendered */}
							{showDoctorFilter && (
								<div className="mb-4">
									<DoctorFilterPanel cases={cases} onFilterChange={handleDoctorFilterChange} />
								</div>
							)}

							<table className="w-full min-w-[800px]">
								<thead className="bg-gray-50/50 dark:bg-background/50 backdrop-blur-[10px] sticky top-0 z-50">
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
										<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
											Acciones
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
									{filteredAndSortedCases.length > 0 ? (
										// Only render the first 100 rows for better performance
										filteredAndSortedCases.slice(0, 100).map((case_) => {
											const ageDisplay = case_.date_of_birth ? getAgeDisplay(case_.date_of_birth) : ''
											const isBiopsyCase = case_.exam_type?.toLowerCase() === 'biopsia'
											const hasDownloadableContent = isBiopsyCase && !!case_.diagnostico

											return (
												<tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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
														<div className="bg-gray-200 dark:bg-gray-900/60 hover:bg-gray-300 dark:hover:bg-gray-800/80 text-center border border-gray-500 dark:border-gray-700 rounded-lg px-1 py-1">
															{case_.branch}
														</div>
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
														<div className="flex gap-2">
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
															{isBiopsyCase && (
																<button
																	onClick={(e) => {
																		e.stopPropagation()
																		handleGenerateCase(case_)
																	}}
																	disabled={!canGenerate}
																	className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
																>
																	<FileText className="w-3 h-3" />
																	Generar
																</button>
															)}
															{hasDownloadableContent && (
																<button
																	onClick={(e) => {
																		e.stopPropagation()
																		handleDownloadCase(case_)
																	}}
																	className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
																	disabled={isDownloading === case_.id}
																>
																	{isDownloading === case_.id ? (
																		<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
																	) : (
																		<Download className="w-3 h-3" />
																	)}
																	PDF
																</button>
															)}
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

							{filteredAndSortedCases.length > 100 && !isFullscreen && (
								<div className="text-center py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700">
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Mostrando 100 de {filteredAndSortedCases.length} casos
									</p>
									<button
										onClick={() => setIsFullscreen(true)}
										className="mt-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm"
									>
										Ver todos los casos
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Generate Biopsy Modal */}
			<GenerateBiopsyModal
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

			{/* Unified Edit Modal */}
			<UnifiedCaseModal
				case_={selectedCaseForEdit}
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false)
					setSelectedCaseForEdit(null)
				}}
				onSave={() => {
					refetch()
				}}
				onDelete={() => {
					refetch()
				}}
			/>
		</>
	)
}

export default React.memo(CasesTable)
