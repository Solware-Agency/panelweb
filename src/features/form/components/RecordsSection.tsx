import React, { useState, useCallback, useMemo } from 'react'
import CasesTable from '@shared/components/cases/CasesTable'
import { Users, MapPin, Microscope, FileText, Activity, Download, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card'
import { type MedicalRecord } from '@lib/supabase-service'
import { useUserProfile } from '@shared/hooks/useUserProfile'

interface RecordsSectionProps {
	cases: MedicalRecord[]
	isLoading: boolean
	error: any
	refetch: () => void
	isFullscreen: boolean
	setIsFullscreen: (value: boolean) => void
	onSearch?: (term: string) => void
}

export const RecordsSection: React.FC<RecordsSectionProps> = ({
	cases,
	isLoading,
	error,
	refetch,
	isFullscreen,
	setIsFullscreen,
	onSearch,
}) => {
	const [searchTerm] = useState('')
	const { profile } = useUserProfile()
	const [showPendingOnly, setShowPendingOnly] = useState(false)
	const [selectedExamType, setSelectedExamType] = useState<string | null>(null)
	const [showPdfReadyOnly, setShowPdfReadyOnly] = useState(false)

	// Filter cases by assigned branch if user has an assigned branch
	const filteredCases = useMemo(() => {
		if (!cases || cases.length === 0) return []

		let filtered = [...cases]

		// If user is an employee with assigned branch, filter cases
		if (profile?.role === 'employee' && profile?.assigned_branch) {
			filtered = filtered.filter((c) => c.branch === profile.assigned_branch)
		}

		// If user is an admin with assigned branch, filter cases
		if (profile?.role === 'admin' && profile?.assigned_branch) {
			filtered = filtered.filter((c) => c.branch === profile.assigned_branch)
		}

		// If showPendingOnly is true, filter to show only incomplete cases
		if (showPendingOnly) {
			filtered = filtered.filter((c) => c.payment_status !== 'Completado')
		}

		// If an exam type is selected, filter by that type
		if (selectedExamType) {
			filtered = filtered.filter((c) => c.exam_type.toLowerCase() === selectedExamType.toLowerCase())
		}

		// If showPdfReadyOnly is true, filter to show only cases with PDF ready
		if (showPdfReadyOnly) {
			filtered = filtered.filter((c) => {
				const isBiopsyCase = c.exam_type?.toLowerCase() === 'biopsia'
				const hasDownloadableContent = isBiopsyCase && !!c.diagnostico
				return hasDownloadableContent
			})
		}

		return filtered
	}, [cases, profile, showPendingOnly, selectedExamType, showPdfReadyOnly])

	// Calculate statistics
	const stats = useMemo(() => {
		if (!filteredCases || filteredCases.length === 0) {
			return { total: 0, totalAmount: 0, completed: 0, examTypes: {} }
		}

		const total = filteredCases.length
		const totalAmount = filteredCases.reduce(
			(sum: number, record: MedicalRecord) => sum + (record.total_amount || 0),
			0,
		)
		const completed = filteredCases.filter((record: MedicalRecord) => record.payment_status === 'Completado').length

		// Count cases by exam type
		const examTypes: Record<string, number> = {}
		filteredCases.forEach((record: MedicalRecord) => {
			if (!record.exam_type) return
			const type = record.exam_type.toLowerCase()
			examTypes[type] = (examTypes[type] || 0) + 1
		})

		return { total, totalAmount, completed, examTypes }
	}, [filteredCases])

	// Toggle pending cases filter
	const handleTogglePendingFilter = useCallback(() => {
		setShowPendingOnly(!showPendingOnly)
		setSelectedExamType(null) // Clear exam type filter when toggling pending filter
		setShowPdfReadyOnly(false) // Clear PDF filter when toggling pending filter
	}, [showPendingOnly])

	// Toggle exam type filter
	const handleExamTypeFilter = useCallback(
		(examType: string) => {
			if (selectedExamType === examType.toLowerCase()) {
				setSelectedExamType(null) // Clear filter if already selected
			} else {
				setSelectedExamType(examType.toLowerCase())
				setShowPendingOnly(false) // Clear pending filter when selecting exam type
				setShowPdfReadyOnly(false) // Clear PDF filter when selecting exam type
			}
		},
		[selectedExamType],
	)

	// Toggle PDF ready filter
	const handleTogglePdfFilter = useCallback(() => {
		setShowPdfReadyOnly(!showPdfReadyOnly)
		setShowPendingOnly(false) // Clear pending filter when toggling PDF filter
		setSelectedExamType(null) // Clear exam type filter when toggling PDF filter
	}, [showPdfReadyOnly])

	// Get exam type counts from all cases (not just filtered)
	const examTypeCounts = useMemo(() => {
		const counts: Record<string, number> = {
			biopsia: 0,
			citologia: 0,
			inmunohistoquimica: 0,
		}

		if (cases) {
			cases.forEach((record) => {
				if (record.exam_type) {
					const type = record.exam_type.toLowerCase()
					if (counts[type] !== undefined) {
						counts[type]++
					}
				}
			})
		}

		return counts
	}, [cases])

	// Count PDF-ready cases
	const pdfReadyCases = useMemo(() => {
		return (
			cases?.filter((c) => {
				const isBiopsyCase = c.exam_type?.toLowerCase() === 'biopsia'
				const hasDownloadableContent = isBiopsyCase && !!c.diagnostico
				return hasDownloadableContent
			}).length || 0
		)
	}, [cases])

	// Get exam type icon
	const getExamTypeIcon = useCallback((examType: string) => {
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
	}, [])

	// Handle search input change

	// Handle search on Enter key

	// Handle search button click

	return (
		<div>
			{/* Header with search and refresh */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
				<div>
					<div className="flex items-center gap-2 sm:gap-3">
						<h2 className="text-xl sm:text-2xl font-bold text-foreground">Registros de Clientes</h2>
						{profile?.assigned_branch && (
							<div className="flex items-center gap-1.5 sm:gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-2 sm:px-3 py-0.5 sm:py-1">
								<MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								<span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300">
									Sede: {profile.assigned_branch}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Statistics cards */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
				{/* Pending Cases Card - Responsive */}
				<Card
					className={`hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer ${
						showPendingOnly ? 'border-primary shadow-lg shadow-primary/20' : ''
					}`}
					onClick={handleTogglePendingFilter}
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-xs sm:text-sm font-medium">Casos Pendientes</CardTitle>
						<Users
							className={`h-4 w-4 ${
								showPendingOnly ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'
							}`}
						/>
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">
							{stats.total > 0 ? Math.round(((stats.total - stats.completed) / stats.total) * 100) : 0}%
						</div>
						<p className="text-xs text-muted-foreground">
							{stats.total - stats.completed} de {stats.total} casos pendientes
						</p>
					</CardContent>
				</Card>

				{/* PDF Ready Cases Card */}
				<Card
					className={`hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer ${
						showPdfReadyOnly ? 'border-primary shadow-lg shadow-primary/20' : ''
					}`}
					onClick={handleTogglePdfFilter}
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-xs sm:text-sm font-medium">PDF Disponibles</CardTitle>
						<Download
							className={`h-4 w-4 ${
								showPdfReadyOnly ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'
							}`}
						/>
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">{pdfReadyCases}</div>
						<p className="text-xs text-muted-foreground">casos con PDF listo para descargar</p>
					</CardContent>
				</Card>

				{/* Biopsia Card */}
				<Card
					className={`hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer ${
						selectedExamType === 'biopsia' ? 'border-primary shadow-lg shadow-primary/20' : ''
					}`}
					onClick={() => handleExamTypeFilter('biopsia')}
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-xs sm:text-sm font-medium">Biopsias</CardTitle>
						<Activity
							className={`h-4 w-4 ${
								selectedExamType === 'biopsia' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'
							}`}
						/>
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">{examTypeCounts['biopsia'] || 0}</div>
						<p className="text-xs text-muted-foreground">casos de biopsia</p>
					</CardContent>
				</Card>

				{/* Citología Card */}
				<Card
					className={`hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer ${
						selectedExamType === 'citologia' ? 'border-primary shadow-lg shadow-primary/20' : ''
					}`}
					onClick={() => handleExamTypeFilter('citologia')}
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-xs sm:text-sm font-medium">Citologías</CardTitle>
						<FileText
							className={`h-4 w-4 ${
								selectedExamType === 'citologia' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'
							}`}
						/>
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">{examTypeCounts['citologia'] || 0}</div>
						<p className="text-xs text-muted-foreground">casos de citología</p>
					</CardContent>
				</Card>

				{/* Inmunohistoquímica Card */}
				<Card
					className={`hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer ${
						selectedExamType === 'inmunohistoquimica' ? 'border-primary shadow-lg shadow-primary/20' : ''
					}`}
					onClick={() => handleExamTypeFilter('inmunohistoquimica')}
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-xs sm:text-sm font-medium truncate">Inmunohistoquímica</CardTitle>
						<Microscope
							className={`h-4 w-4 ${
								selectedExamType === 'inmunohistoquimica'
									? 'text-primary'
									: 'text-muted-foreground group-hover:text-primary/80'
							}`}
						/>
					</CardHeader>
					<CardContent>
						<div className="text-xl sm:text-2xl font-bold">{examTypeCounts['inmunohistoquimica'] || 0}</div>
						<p className="text-xs text-muted-foreground">casos de inmunohistoquímica</p>
					</CardContent>
				</Card>
			</div>

			{/* Active filters indicators */}
			<div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
				{showPendingOnly && (
					<div className="px-2 sm:px-4 py-1 sm:py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg inline-block">
						<span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-1.5 sm:gap-2">
							<Users className="w-3 h-3 sm:w-4 sm:h-4" />
							Mostrando solo casos pendientes
						</span>
					</div>
				)}

				{showPdfReadyOnly && (
					<div className="px-2 sm:px-4 py-1 sm:py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg inline-block">
						<span className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-1.5 sm:gap-2">
							<Download className="w-3 h-3 sm:w-4 sm:h-4" />
							Mostrando solo casos con PDF disponible
						</span>
					</div>
				)}

				{selectedExamType && (
					<div className="px-2 sm:px-4 py-1 sm:py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg inline-block">
						<span className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-300 flex items-center gap-1.5 sm:gap-2">
							{getExamTypeIcon(selectedExamType)}
							Filtrando por: {selectedExamType.charAt(0).toUpperCase() + selectedExamType.slice(1)}
						</span>
					</div>
				)}

				{searchTerm && (
					<div className="px-2 sm:px-4 py-1 sm:py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg inline-block">
						<span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-1.5 sm:gap-2">
							<Search className="w-3 h-3 sm:w-4 sm:h-4" />
							Resultados para: "{searchTerm}"
						</span>
					</div>
				)}
			</div>

			{/* Cases Table */}
			<CasesTable
				cases={filteredCases}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
				isFullscreen={isFullscreen}
				setIsFullscreen={setIsFullscreen}
				onSearch={onSearch}
			/>
		</div>
	)
}
