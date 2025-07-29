import React, { useState, useCallback, useMemo } from 'react'
import { Download, Users, Activity, FileText, Microscope } from 'lucide-react'
import CasesTable from '@shared/components/cases/CasesTable'
import CaseDetailPanel from '@shared/components/cases/CaseDetailPanel'
import type { MedicalRecord } from '@lib/supabase-service'
import { useQuery } from '@tanstack/react-query'
import { getMedicalRecords } from '@lib/supabase-service'
import { Card, CardContent } from '@shared/components/ui/card'

const MainCases: React.FC = React.memo(() => {
	const [selectedCase, setSelectedCase] = useState<MedicalRecord | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [isFullscreen, setIsFullscreen] = useState(false)
	
	// Estados para filtros
	const [showPendingOnly, setShowPendingOnly] = useState(false)
	const [showPdfReadyOnly, setShowPdfReadyOnly] = useState(false)
	const [selectedExamType, setSelectedExamType] = useState<string | null>(null)

	// Query for refreshing data - optimized to prevent unnecessary refetches
	const casesQueryResult = useQuery({
		queryKey: ['medical-cases'],
		queryFn: () => getMedicalRecords(),
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: false, // Prevent refetching on window focus
		refetchOnReconnect: false, // Prevent refetching on reconnect
	})

	const { refetch, isLoading } = casesQueryResult
	const cases: MedicalRecord[] = useMemo(() => casesQueryResult.data?.data || [], [casesQueryResult.data])
	const error = casesQueryResult.error

	const handleCaseSelect = useCallback((case_: MedicalRecord) => {
		setSelectedCase(case_)
		setIsPanelOpen(true)
	}, [])

	const handlePanelClose = useCallback(() => {
		setIsPanelOpen(false)
		// Delay clearing selected case to allow animation to complete
		setTimeout(() => setSelectedCase(null), 300)
	}, [])

	// Handlers para filtros
	const handleTogglePendingFilter = useCallback(() => {
		setShowPendingOnly(!showPendingOnly)
		setShowPdfReadyOnly(false)
		setSelectedExamType(null)
	}, [showPendingOnly])

	const handleTogglePdfFilter = useCallback(() => {
		setShowPdfReadyOnly(!showPdfReadyOnly)
		setShowPendingOnly(false)
		setSelectedExamType(null)
	}, [showPdfReadyOnly])

	const handleExamTypeFilter = useCallback((examType: string) => {
		if (selectedExamType === examType) {
			setSelectedExamType(null)
		} else {
			setSelectedExamType(examType)
			setShowPendingOnly(false)
			setShowPdfReadyOnly(false)
		}
	}, [selectedExamType])

	// Filtrar casos basado en los filtros activos
	const filteredCases = useMemo(() => {
		if (!cases || cases.length === 0) return []

		let filtered = [...cases]

		// Filtro de casos pendientes
		if (showPendingOnly) {
			filtered = filtered.filter((c) => c.payment_status !== 'Completado')
		}

		// Filtro de PDF disponibles
		if (showPdfReadyOnly) {
			filtered = filtered.filter((c) => {
				const type = c.exam_type?.toLowerCase().trim()
				const isGeneratableCase = type?.includes('biops') || type?.includes('inmuno') || type?.includes('citolog')
				const hasContent = c.diagnostico || c.conclusion_diagnostica || 
					(type?.includes('citolog') && c.descripcion_macroscopica)
				return isGeneratableCase && hasContent
			})
		}

		// Filtro por tipo de examen
		if (selectedExamType) {
			filtered = filtered.filter((c) => {
				if (!c.exam_type) return false
				const type = c.exam_type.toLowerCase().trim()
				
				let normalizedType = type
				if (type.includes('inmuno')) {
					normalizedType = 'inmunohistoquimica'
				} else if (type.includes('citolog')) {
					normalizedType = 'citologia'
				} else if (type.includes('biops')) {
					normalizedType = 'biopsia'
				}
				
				return normalizedType === selectedExamType
			})
		}

		return filtered
	}, [cases, showPendingOnly, showPdfReadyOnly, selectedExamType])

	// Calculate statistics
	const stats = useMemo(() => {
		if (!cases || cases.length === 0) {
			return { total: 0, totalAmount: 0, completed: 0, examTypes: {} }
		}

		const total = cases.length
		const totalAmount = cases.reduce(
			(sum: number, record: MedicalRecord) => sum + (record.total_amount || 0),
			0,
		)
		const completed = cases.filter((record: MedicalRecord) => record.payment_status === 'Completado').length

		return { total, totalAmount, completed }
	}, [cases])

	// Count PDF-ready cases
	const pdfReadyCases = useMemo(() => {
		return (
			cases?.filter((c) => {
				const type = c.exam_type?.toLowerCase().trim()
				const isGeneratableCase = type?.includes('biops') || type?.includes('inmuno') || type?.includes('citolog')
				const hasContent = c.diagnostico || c.conclusion_diagnostica || 
					(type?.includes('citolog') && c.descripcion_macroscopica)

				return isGeneratableCase && hasContent
			}).length || 0
		)
	}, [cases])

	// Get exam type counts (pending cases only)
	const examTypeCounts = useMemo(() => {
		const counts: Record<string, number> = {
			biopsia: 0,
			citologia: 0,
			inmunohistoquimica: 0,
		}

		if (cases) {
			cases.forEach((record) => {
				if (record.exam_type) {
					// Solo contar casos pendientes (no completados)
					const isPending = record.payment_status?.toLowerCase().trim() !== 'completado'
					if (!isPending) return

					const type = record.exam_type.toLowerCase().trim()

					// Mapear variaciones comunes
					let normalizedType = type
					if (type.includes('inmuno')) {
						normalizedType = 'inmunohistoquimica'
					} else if (type.includes('citolog')) {
						normalizedType = 'citologia'
					} else if (type.includes('biops')) {
						normalizedType = 'biopsia'
					}

					if (counts[normalizedType] !== undefined) {
						counts[normalizedType]++
					}
				}
			})
		}

		return counts
	}, [cases])

	return (
		<div className="p-3 sm:p-6">
			{/* Page Title */}
			<div className="mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Casos Médicos</h1>
				<p className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
					Gestiona todos los casos médicos registrados en el sistema
				</p>
			</div>

			{/* Statistics cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mb-4 sm:mb-6">
				{/* Combined Pending Cases and PDF Card */}
				<Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group transition-transform duration-300">
					<CardContent className="p-4">
						{/* Pending Cases Button */}
						<button 
							className={`w-full flex items-center justify-between p-3 rounded-lg border transition-transform duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-md ${
								showPendingOnly
									? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
									: 'border-border hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
							}`}
							onClick={handleTogglePendingFilter}
						>
							<div className="flex items-center gap-3">
								<div className={`p-2 rounded-lg transition-transform duration-200 ${
									showPendingOnly 
										? 'bg-primary/20' 
										: 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-800/40'
								}`}>
									<Users className={`h-5 w-5 transition-transform duration-200 ${
										showPendingOnly 
											? 'text-primary' 
											: 'text-orange-600 dark:text-orange-400'
									}`} />
								</div>
								<div>
									<p className="text-xs font-medium text-muted-foreground">Casos Pendientes</p>
									<p className="text-xl font-bold">
										{stats.total > 0 ? Math.round(((stats.total - stats.completed) / stats.total) * 100) : 0}%
									</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-xs text-muted-foreground">
									{stats.total - stats.completed} de {stats.total} casos
								</p>
							</div>
						</button>

						{/* PDF Ready Button */}
						<button 
							className={`w-full flex items-center justify-between p-3 rounded-lg border transition-transform duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-md mt-3 ${
								showPdfReadyOnly
									? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
									: 'border-border hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
							}`}
							onClick={handleTogglePdfFilter}
						>
							<div className="flex items-center gap-3">
								<div className={`p-2 rounded-lg transition-transform duration-200 ${
									showPdfReadyOnly 
										? 'bg-primary/20' 
										: 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40'
								}`}>
									<Download className={`h-5 w-5 transition-transform duration-200 ${
										showPdfReadyOnly 
											? 'text-primary' 
											: 'text-green-600 dark:text-green-400'
									}`} />
								</div>
								<div>
									<p className="text-xs font-medium text-muted-foreground">PDF Pendientes</p>
									<p className="text-xl font-bold">{pdfReadyCases}</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-xs text-muted-foreground">
									pendientes por generar
								</p>
							</div>
						</button>

						{/* Status indicators */}
						<div className="mt-3 pt-3 border-t border-border">
							{showPendingOnly && (
								<p className="text-xs text-primary font-medium">Mostrando casos pendientes</p>
							)}
							{showPdfReadyOnly && (
								<p className="text-xs text-primary font-medium">Mostrando PDF disponibles</p>
							)}
							{!showPendingOnly && !showPdfReadyOnly && (
								<p className="text-xs text-muted-foreground">Haz clic en un botón para filtrar</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Exam Types Card */}
				<Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group transition-transform duration-300">
					<CardContent className="p-4">
						<div className="flex items-center gap-3 mb-3">
							<div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
								<Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<p className="text-xs font-medium text-muted-foreground">Tipos de Examen</p>
								<p className="text-xs text-muted-foreground">Pendientes por tipo</p>
							</div>
						</div>

						<div className="space-y-2">
							{/* Biopsia */}
							<button
								className={`w-full flex items-center justify-between p-2 rounded-lg border transition-transform duration-300 cursor-pointer hover:bg-accent ${
									selectedExamType === 'biopsia'
										? 'border-primary bg-primary/10'
										: 'border-border hover:border-primary/50'
								}`}
								onClick={() => handleExamTypeFilter('biopsia')}
							>
								<div className="flex items-center gap-2">
									<Activity className="h-3 w-3 text-red-500" />
									<span className="text-xs font-medium">Biopsia</span>
								</div>
								<span className="text-sm font-bold">{examTypeCounts['biopsia'] || 0}</span>
							</button>

							{/* Citología */}
							<button
								className={`w-full flex items-center justify-between p-2 rounded-lg border transition-transform duration-300 cursor-pointer hover:bg-accent ${
									selectedExamType === 'citologia'
										? 'border-primary bg-primary/10'
										: 'border-border hover:border-primary/50'
								}`}
								onClick={() => handleExamTypeFilter('citologia')}
							>
								<div className="flex items-center gap-2">
									<FileText className="h-3 w-3 text-blue-500" />
									<span className="text-xs font-medium">Citología</span>
								</div>
								<span className="text-sm font-bold">{examTypeCounts['citologia'] || 0}</span>
							</button>

							{/* Inmunohistoquímica */}
							<button
								className={`w-full flex items-center justify-between p-2 rounded-lg border transition-transform duration-300 cursor-pointer hover:bg-accent ${
									selectedExamType === 'inmunohistoquimica'
										? 'border-primary bg-primary/10'
										: 'border-border hover:border-primary/50'
								}`}
								onClick={() => handleExamTypeFilter('inmunohistoquimica')}
							>
								<div className="flex items-center gap-2">
									<Microscope className="h-3 w-3 text-purple-500" />
									<span className="text-xs font-medium">Inmuno</span>
								</div>
								<span className="text-sm font-bold">{examTypeCounts['inmunohistoquimica'] || 0}</span>
							</button>
						</div>
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
							{selectedExamType === 'biopsia' && <Activity className="w-3 h-3 sm:w-4 sm:h-4" />}
							{selectedExamType === 'citologia' && <FileText className="w-3 h-3 sm:w-4 sm:h-4" />}
							{selectedExamType === 'inmunohistoquimica' && <Microscope className="w-3 h-3 sm:w-4 sm:h-4" />}
							Filtrando por: {selectedExamType.charAt(0).toUpperCase() + selectedExamType.slice(1)}
						</span>
					</div>
				)}
			</div>

			{/* Cases Table */}
			<CasesTable
				onCaseSelect={handleCaseSelect}
				cases={filteredCases}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
				isFullscreen={isFullscreen}
				setIsFullscreen={setIsFullscreen}
			/>

			{/* Case Detail Panel */}
			<CaseDetailPanel
				case_={selectedCase}
				isOpen={isPanelOpen}
				onClose={handlePanelClose}
				onCaseSelect={handleCaseSelect}
			/>
		</div>
	)
})

MainCases.displayName = 'MainCases'

export default MainCases
