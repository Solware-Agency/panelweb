import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import CasesTable from '@shared/components/cases/CasesTable'
import CaseDetailPanel from '@shared/components/cases/CaseDetailPanel'
import { Users, MapPin, Microscope, FileText, Activity, Maximize2, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card'
import { searchClientes, type MedicalRecord, type PaginationMeta } from '@lib/supabase-service'
import { useUserProfile } from '@shared/hooks/useUserProfile'
import { Button } from '@shared/components/ui/button'

interface RecordsSectionProps {
	cases: MedicalRecord[]
	isLoading: boolean
	error: any
	refetch: () => void
	isFullscreen: boolean
	setIsFullscreen: (value: boolean) => void
	pagination?: PaginationMeta | null
	onPageChange?: (page: number) => void
}

export const RecordsSection: React.FC<RecordsSectionProps> = ({
	cases,
	isLoading,
	error,
	refetch,
	isFullscreen,
	setIsFullscreen,
	pagination,
	onPageChange
}) => {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCase, setSelectedCase] = useState<MedicalRecord | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const { profile } = useUserProfile()
	const [filteredCases, setFilteredCases] = useState<MedicalRecord[]>(cases || [])
	const [showPendingOnly, setShowPendingOnly] = useState(false)
	const [selectedExamType, setSelectedExamType] = useState<string | null>(null)
	const [showPdfReadyOnly, setShowPdfReadyOnly] = useState(false)

	// Filter cases by assigned branch if user is an employee with assigned branch
	useEffect(() => {
		if (!cases) {
			setFilteredCases([])
			return
		}

		let filtered = [...cases]

		// If user is an employee with assigned branch, filter cases
		if (profile?.role === 'employee' && profile?.assigned_branch) {
			filtered = filtered.filter(c => c.branch === profile.assigned_branch)
		}

		// If showPendingOnly is true, filter to show only incomplete cases
		if (showPendingOnly) {
			filtered = filtered.filter(c => c.payment_status !== 'Completado')
		}

		// If an exam type is selected, filter by that type
		if (selectedExamType) {
			filtered = filtered.filter(c => 
				c.exam_type.toLowerCase() === selectedExamType.toLowerCase()
			)
		}

		// If showPdfReadyOnly is true, filter to show only cases with downloadable PDF
		if (showPdfReadyOnly) {
			filtered = filtered.filter(c => {
				const isBiopsyCase = c.exam_type?.toLowerCase() === 'biopsia'
				const hasDownloadableContent = isBiopsyCase && !!c.diagnostico
				return hasDownloadableContent
			})
		}

		setFilteredCases(filtered)
	}, [cases, profile, showPendingOnly, selectedExamType, showPdfReadyOnly])

	const handleCaseSelect = (case_: MedicalRecord) => {
		setSelectedCase(case_)
		setIsPanelOpen(true)
	}

	const handlePanelClose = () => {
		setIsPanelOpen(false)
		// Delay clearing selected case to allow animation to complete
		setTimeout(() => setSelectedCase(null), 300)
	}

	// Query for search results (if needed for separate search functionality)
	const { data: searchResults } = useQuery({
		queryKey: ['clientes-search', searchTerm],
		queryFn: () => searchClientes(searchTerm),
		enabled: !!searchTerm,
	})

	// Determine which data to use
	const records = searchTerm ? searchResults?.data : filteredCases

	// Calculate statistics
	const stats = React.useMemo(() => {
		if (!records) return { total: 0, totalAmount: 0, completed: 0, examTypes: {} }

		const total = records.length
		const totalAmount = records.reduce((sum: number, record: MedicalRecord) => sum + (record.total_amount || 0), 0)
		const completed = records.filter((record: MedicalRecord) => record.payment_status === 'Completado').length

		// Count cases by exam type
		const examTypes: Record<string, number> = {}
		records.forEach((record: MedicalRecord) => {
			if (!record.exam_type) return;
			const type = record.exam_type.toLowerCase()
			examTypes[type] = (examTypes[type] || 0) + 1
		})

		return { total, totalAmount, completed, examTypes }
	}, [records])

	// Toggle pending cases filter
	const handleTogglePendingFilter = () => {
		setShowPendingOnly(!showPendingOnly)
		setSelectedExamType(null) // Clear exam type filter when toggling pending filter
		setShowPdfReadyOnly(false) // Clear PDF filter when toggling pending filter
	}

	// Toggle exam type filter
	const handleExamTypeFilter = (examType: string) => {
		if (selectedExamType === examType.toLowerCase()) {
			setSelectedExamType(null) // Clear filter if already selected
		} else {
			setSelectedExamType(examType.toLowerCase())
			setShowPendingOnly(false) // Clear pending filter when selecting exam type
			setShowPdfReadyOnly(false) // Clear PDF filter when selecting exam type
		}
	}

	// Toggle PDF ready filter
	const handleTogglePdfFilter = () => {
		setShowPdfReadyOnly(!showPdfReadyOnly)
		setShowPendingOnly(false) // Clear pending filter when toggling PDF filter
		setSelectedExamType(null) // Clear exam type filter when toggling PDF filter
	}

	// Get exam type counts from all cases (not just filtered)
	const examTypeCounts = React.useMemo(() => {
		const counts: Record<string, number> = {
			'biopsia': 0,
			'citologia': 0,
			'inmunohistoquimica': 0
		}
		
		cases?.forEach((record: MedicalRecord) => {
			if (!record.exam_type) return;
			const type = record.exam_type.toLowerCase()
			if (counts[type] !== undefined) {
				counts[type]++
			}
		})
		
		return counts
	}, [cases])

	// Count PDF-ready cases
	const pdfReadyCases = React.useMemo(() => {
		return cases?.filter(c => {
			const isBiopsyCase = c.exam_type?.toLowerCase() === 'biopsia'
			const hasDownloadableContent = isBiopsyCase && !!c.diagnostico
			return hasDownloadableContent
		}).length || 0
	}, [cases])

	// Get exam type icon
	const getExamTypeIcon = (examType: string) => {
		switch (examType.toLowerCase()) {
			case 'biopsia':
				return <Activity className="h-4 w-4" />
			case 'citologia':
				return <FileText className="h-4 w-4" />
			case 'inmunohistoquimica':
				return <Microscope className="h-4 w-4" />
			default:
				return <FileText className="h-4 w-4" />
		}
	}

	// Handle toggle fullscreen
	const handleToggleFullscreen = () => {
		setIsFullscreen(!isFullscreen)
	}

	// Handle page change
	const handlePageChange = (newPage: number) => {
		if (onPageChange) {
			onPageChange(newPage);
		}
	}

	return (
		<div>
			{/* Header with search and refresh */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
				<div>
					<div className="flex items-center gap-3">
						<h2 className="text-2xl font-bold text-foreground">Registros de Clientes</h2>
						{profile?.role === 'employee' && profile?.assigned_branch && (
							<div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1">
								<MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								<span className="text-sm font-medium text-blue-800 dark:text-blue-300">
									Sede: {profile.assigned_branch}
								</span>
							</div>
						)}
					</div>
					<p className="text-muted-foreground">
						{searchTerm ? `Resultados de búsqueda para "${searchTerm}"` : ''}
					</p>
				</div>
				
				{/* Fullscreen button */}
				<Button
					onClick={handleToggleFullscreen}
					variant="outline"
					className="flex items-center gap-2"
				>
					<Maximize2 className="w-4 h-4" />
					{isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
				</Button>
			</div>

			{/* Statistics cards */}
			{!searchTerm && records && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
					{/* Pending Cases Card */}
					<Card 
						className={`transition-all duration-300 hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer ${
							showPendingOnly ? 'border-primary shadow-lg shadow-primary/20' : ''
						}`}
						onClick={handleTogglePendingFilter}
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Casos Pendientes</CardTitle>
							<Users className={`h-4 w-4 ${showPendingOnly ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'}`} />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats.total > 0 ? Math.round(((stats.total - stats.completed) / stats.total) * 100) : 0}%
							</div>
							<p className="text-xs text-muted-foreground">
								{stats.total - stats.completed} de {stats.total} casos pendientes
							</p>
						</CardContent>
					</Card>

					{/* PDF Ready Cases Card */}
					<Card 
						className={`transition-all duration-300 hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer ${
							showPdfReadyOnly ? 'border-primary shadow-lg shadow-primary/20' : ''
						}`}
						onClick={handleTogglePdfFilter}
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">PDF Disponibles</CardTitle>
							<Download className={`h-4 w-4 ${showPdfReadyOnly ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'}`} />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{pdfReadyCases}
							</div>
							<p className="text-xs text-muted-foreground">
								casos con PDF listo para descargar
							</p>
						</CardContent>
					</Card>

					{/* Biopsia Card */}
					<Card 
						className={`transition-all duration-300 hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer ${
							selectedExamType === 'biopsia' ? 'border-primary shadow-lg shadow-primary/20' : ''
						}`}
						onClick={() => handleExamTypeFilter('biopsia')}
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Biopsias</CardTitle>
							<Activity className={`h-4 w-4 ${selectedExamType === 'biopsia' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'}`} />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{examTypeCounts['biopsia'] || 0}
							</div>
							<p className="text-xs text-muted-foreground">
								casos de biopsia
							</p>
						</CardContent>
					</Card>

					{/* Citología Card */}
					<Card 
						className={`transition-all duration-300 hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer ${
							selectedExamType === 'citologia' ? 'border-primary shadow-lg shadow-primary/20' : ''
						}`}
						onClick={() => handleExamTypeFilter('citologia')}
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Citologías</CardTitle>
							<FileText className={`h-4 w-4 ${selectedExamType === 'citologia' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'}`} />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{examTypeCounts['citologia'] || 0}
							</div>
							<p className="text-xs text-muted-foreground">
								casos de citología
							</p>
						</CardContent>
					</Card>

					{/* Inmunohistoquímica Card */}
					<Card 
						className={`transition-all duration-300 hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer ${
							selectedExamType === 'inmunohistoquimica' ? 'border-primary shadow-lg shadow-primary/20' : ''
						}`}
						onClick={() => handleExamTypeFilter('inmunohistoquimica')}
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Inmunohistoquímica</CardTitle>
							<Microscope className={`h-4 w-4 ${selectedExamType === 'inmunohistoquimica' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'}`} />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{examTypeCounts['inmunohistoquimica'] || 0}
							</div>
							<p className="text-xs text-muted-foreground">
								casos de inmunohistoquímica
							</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Results count for search */}
			{searchTerm && records && (
				<div className="text-sm text-muted-foreground">
					Se encontraron {records.length} resultado{records.length !== 1 ? 's' : ''}
				</div>
			)}

			{/* Active filters indicators */}
			<div className="flex flex-wrap gap-2 mb-4">
				{showPendingOnly && (
					<div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg inline-block">
						<span className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
							<Users className="w-4 h-4" />
							Mostrando solo casos pendientes
						</span>
					</div>
				)}
				
				{showPdfReadyOnly && (
					<div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg inline-block">
						<span className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
							<Download className="w-4 h-4" />
							Mostrando solo casos con PDF disponible
						</span>
					</div>
				)}
				
				{selectedExamType && (
					<div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg inline-block">
						<span className="text-sm font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2">
							{getExamTypeIcon(selectedExamType)}
							Filtrando por: {selectedExamType.charAt(0).toUpperCase() + selectedExamType.slice(1)}
						</span>
					</div>
				)}
			</div>

			{/* Cases Table */}
			<CasesTable
				onCaseSelect={handleCaseSelect}
				cases={records || []}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
				isFullscreen={isFullscreen}
				setIsFullscreen={setIsFullscreen}
			/>

			{/* Pagination Controls */}
			{pagination && pagination.totalPages > 1 && (
				<div className="flex justify-between items-center mt-6 bg-white dark:bg-background rounded-lg p-4 border border-gray-200 dark:border-gray-700">
					<div className="text-sm text-gray-600 dark:text-gray-400">
						Mostrando página {pagination.currentPage + 1} de {pagination.totalPages} ({pagination.totalCount} registros totales)
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(pagination.currentPage - 1)}
							disabled={!pagination.hasPreviousPage}
							className="flex items-center gap-1"
						>
							<ChevronLeft className="h-4 w-4" />
							Anterior
						</Button>
						
						{/* Page number indicators */}
						<div className="flex items-center gap-1">
							{pagination.totalPages <= 7 ? (
								// Show all pages if 7 or fewer
								Array.from({ length: pagination.totalPages }, (_, i) => (
									<Button
										key={i}
										variant={pagination.currentPage === i ? "default" : "outline"}
										size="sm"
										onClick={() => handlePageChange(i)}
										className="w-8 h-8 p-0"
									>
										{i + 1}
									</Button>
								))
							) : (
								// Show limited pages with ellipsis for many pages
								<>
									{/* First page */}
									<Button
										variant={pagination.currentPage === 0 ? "default" : "outline"}
										size="sm"
										onClick={() => handlePageChange(0)}
										className="w-8 h-8 p-0"
									>
										1
									</Button>
									
									{/* Ellipsis or page numbers */}
									{pagination.currentPage > 2 && (
										<span className="px-1 text-gray-500 dark:text-gray-400">...</span>
									)}
									
									{/* Pages around current page */}
									{Array.from(
										{ length: Math.min(3, pagination.totalPages) },
										(_, i) => {
											const pageNum = Math.max(
												1,
												Math.min(
													pagination.currentPage - 1 + i,
													pagination.totalPages - 2
												)
											);
											return pageNum;
										}
									)
										.filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
										.map(pageNum => (
											<Button
												key={pageNum}
												variant={pagination.currentPage === pageNum ? "default" : "outline"}
												size="sm"
												onClick={() => handlePageChange(pageNum)}
												className="w-8 h-8 p-0"
											>
												{pageNum + 1}
											</Button>
										))}
									
									{/* Ellipsis or page numbers */}
									{pagination.currentPage < pagination.totalPages - 3 && (
										<span className="px-1 text-gray-500 dark:text-gray-400">...</span>
									)}
									
									{/* Last page */}
									<Button
										variant={pagination.currentPage === pagination.totalPages - 1 ? "default" : "outline"}
										size="sm"
										onClick={() => handlePageChange(pagination.totalPages - 1)}
										className="w-8 h-8 p-0"
									>
										{pagination.totalPages}
									</Button>
								</>
							)}
						</div>
						
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(pagination.currentPage + 1)}
							disabled={!pagination.hasNextPage}
							className="flex items-center gap-1"
						>
							Siguiente
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Case Detail Panel */}
			<CaseDetailPanel case_={selectedCase} isOpen={isPanelOpen} onClose={handlePanelClose} />
		</div>
	)
}