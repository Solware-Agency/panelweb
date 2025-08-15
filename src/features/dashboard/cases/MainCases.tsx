import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react'
import { Download, Users, Activity, FileText, BarChart3, Stethoscope, FlaskConical } from 'lucide-react'
import CasesTable from '@shared/components/cases/CasesTable'
// import CaseDetailPanel from '@shared/components/cases/CaseDetailPanel'
// import UnifiedCaseModal from '@shared/components/cases/UnifiedCaseModal'
import type { MedicalRecord } from '@lib/supabase-service'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMedicalRecords } from '@lib/supabase-service'
import { Card, CardContent } from '@shared/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent } from '@shared/components/ui/tooltip'
import { Info } from 'lucide-react'
import { supabase } from '@lib/supabase/config'

// Lazy loaded components
import { UnifiedCaseModal } from '@shared/components/lazy-components'

// Loading fallback for UnifiedCaseModal
const UnifiedCaseModalFallback = () => (
	<div className="flex items-center justify-center h-64">
		<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
	</div>
)

const MainCases: React.FC = React.memo(() => {
	const queryClient = useQueryClient()

	useEffect(() => {
		const channel = supabase
			.channel('realtime-cases')
			.on(
				'postgres_changes',
				{
					event: '*', // INSERT | UPDATE | DELETE
					schema: 'public',
					table: 'medical_records_clean',
				},
				() => {
					queryClient.invalidateQueries({ queryKey: ['medical-cases'] }) // tanstack refetch
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [queryClient])

	const [selectedCase, setSelectedCase] = useState<MedicalRecord | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [isFullscreen, setIsFullscreen] = useState(false)

	// Estados para filtros
	const [showPendingOnly, setShowPendingOnly] = useState(false)
	const [showPdfReadyOnly, setShowPdfReadyOnly] = useState(false)
	const [selectedExamType, setSelectedExamType] = useState<string | null>(null)
  const [selectedDocAprobado, setSelectedDocAprobado] = useState<'faltante' | 'pendiente' | 'aprobado' | null>(null)

	// Query for refreshing data - optimized to prevent unnecessary refetches
	const casesQueryResult = useQuery({
		queryKey: ['medical-cases'],
		queryFn: () => getMedicalRecords(),
		staleTime: 1000 * 60 * 2, // 5 minutes
		refetchOnWindowFocus: true, // Prevent refetching on window focus
		refetchOnReconnect: true,
		refetchInterval: 1000 * 60 * 1, // Prevent refetching on reconnect
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

	// Function to invalidate cache after case deletion
	const handleCaseDeleted = useCallback(() => {
		// Invalidate the medical-cases query to refresh the data
		queryClient.invalidateQueries({ queryKey: ['medical-cases'] })
	}, [queryClient])

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
		setSelectedDocAprobado(null)
	}, [showPdfReadyOnly])

	const handleExamTypeFilter = useCallback(
		(examType: string) => {
			if (selectedExamType === examType) {
				setSelectedExamType(null)
			} else {
				setSelectedExamType(examType)
				setShowPendingOnly(false)
				setShowPdfReadyOnly(false)
				setSelectedDocAprobado(null)
			}
		},
		[selectedExamType],
	)

	// Toggle filtro por estado de documento aprobado (faltante | pendiente | aprobado)
	const handleDocAprobadoFilter = useCallback(
		(status: 'faltante' | 'pendiente' | 'aprobado') => {
			if (selectedDocAprobado === status) {
				setSelectedDocAprobado(null)
			} else {
				setSelectedDocAprobado(status)
				setShowPendingOnly(false)
				setShowPdfReadyOnly(false)
				setSelectedExamType(null)
			}
		},
		[selectedDocAprobado],
	)

	// Filtrar casos basado en los filtros activos
	const filteredCases = useMemo(() => {
		if (!cases || cases.length === 0) return []

		let filtered = [...cases]

		// Filtro de casos pendientes
		if (showPendingOnly) {
			filtered = filtered.filter((c) => c.payment_status !== 'Pagado')
		}

		// Filtro de PDF disponibles
		if (showPdfReadyOnly) {
			filtered = filtered.filter((c) => {
				const pdfReadyValue = c.pdf_en_ready
				// Si es booleano
				if (typeof pdfReadyValue === 'boolean') {
					return pdfReadyValue === false
				}
				// Si es string
				if (typeof pdfReadyValue === 'string') {
					return pdfReadyValue === 'FALSE'
				}
				// Por defecto considerar como pendiente
				return true
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

		// Filtro por estado de documento aprobado (doc_aprobado)
		if (selectedDocAprobado) {
			filtered = filtered.filter((c) => {
				const raw = c.doc_aprobado as string | undefined | null
				const status = (raw ? String(raw) : 'faltante').toLowerCase().trim()
				return status === selectedDocAprobado
			})
		}

		return filtered
	}, [cases, showPendingOnly, showPdfReadyOnly, selectedExamType, selectedDocAprobado])

	// Calculate statistics
	const stats = useMemo(() => {
		if (!cases || cases.length === 0) {
			return { total: 0, totalAmount: 0, completed: 0, examTypes: {} }
		}

		const total = cases.length
		const totalAmount = cases.reduce((sum: number, record: MedicalRecord) => sum + (record.total_amount || 0), 0)
		const completed = cases.filter((record: MedicalRecord) => record.payment_status === 'Pagado').length

		return { total, totalAmount, completed }
	}, [cases])

	// Count PDF-ready cases using pdf_en_ready column
	const pendingPdfCases = useMemo(() => {
		return (
			cases?.filter((c) => {
				const pdfReadyValue = c.pdf_en_ready
				// Si es booleano
				if (typeof pdfReadyValue === 'boolean') {
					return pdfReadyValue === false
				}
				// Si es string
				if (typeof pdfReadyValue === 'string') {
					return pdfReadyValue === 'FALSE'
				}
				// Por defecto considerar como pendiente
				return true
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
					// Solo contar casos pendientes (no pagados)
					const isPending = record.payment_status?.toLowerCase().trim() !== 'pagado'
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

	// Conteos por estado de documento (doc_aprobado)
	const docAprobadoCounts = useMemo(() => {
		const counts: Record<'faltante' | 'pendiente' | 'aprobado', number> = {
			faltante: 0,
			pendiente: 0,
			aprobado: 0,
		}

		if (cases) {
			cases.forEach((record) => {
				const raw = record.doc_aprobado as string | undefined | null
				const status = (raw ? String(raw) : 'faltante').toLowerCase().trim()
				if (status === 'faltante' || status === 'pendiente' || status === 'aprobado') {
					counts[status] += 1
				}
			})
		}

		return counts
	}, [cases])

	return (
		<div>
			{/* Page Title */}
			<div className="mb-4 sm:mb-6">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Casos Médicos</h1>
					<div className="w-16 sm:w-24 h-1 bg-primary mt-2 rounded-full" />
				</div>
				<p className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
					Gestiona todos los casos médicos registrados en el sistema
				</p>
			</div>

			{/* Statistics cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-5 w-full mb-4 sm:mb-6">
				{/* Combined Pending Cases and PDF Card */}
				<Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group transition-transform duration-300">
					<CardContent className="p-4">
						<div className="flex justify-end">
							<Tooltip>
								<TooltipTrigger className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
									<Info className="w-4 h-4" />
								</TooltipTrigger>
								<TooltipContent>
									<p>Usa estos botones para filtrar casos pendientes y PDF por generar.</p>
								</TooltipContent>
							</Tooltip>
						</div>
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
								<div
									className={`p-2 rounded-lg transition-transform duration-200 ${
										showPendingOnly
											? 'bg-primary/20'
											: 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-800/40'
									}`}
								>
									<Users
										className={`h-5 w-5 transition-transform duration-200 ${
											showPendingOnly ? 'text-primary' : 'text-orange-600 dark:text-orange-400'
										}`}
									/>
								</div>
								<p className="text-sm font-medium text-muted-foreground">Casos Pendientes</p>
							</div>
							<div className="text-right">
								<p className="text-xl font-bold">
									{stats.total > 0 ? Math.round(((stats.total - stats.completed) / stats.total) * 100) : 0}%
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
								<div
									className={`p-2 rounded-lg transition-transform duration-200 ${
										showPdfReadyOnly
											? 'bg-primary/20'
											: 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40'
									}`}
								>
									<Download
										className={`h-5 w-5 transition-transform duration-200 ${
											showPdfReadyOnly ? 'text-primary' : 'text-green-600 dark:text-green-400'
										}`}
									/>
								</div>
								<p className="text-sm font-medium text-muted-foreground">PDF Pendientes</p>
							</div>
							<div className="text-right">
								<p className="text-xl font-bold">{pendingPdfCases}</p>
							</div>
						</button>

						{/* Status indicators */}
						<div className="mt-3">
							{showPendingOnly && <p className="text-xs text-primary font-medium">Mostrando casos pendientes</p>}
							{showPdfReadyOnly && <p className="text-xs text-primary font-medium">Mostrando PDF disponibles</p>}
						</div>
					</CardContent>
				</Card>

				{/* Exam Types Card */}
				<Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group transition-transform duration-300">
					<CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
							<div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
								<BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
                                <p className="text-xs font-medium text-muted-foreground">Tipos de Examen</p>
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
                                    <Activity className="h-3 w-3 text-green-500" />
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
                                    <Stethoscope className="h-3 w-3 text-blue-500" />
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
                                    <FlaskConical className="h-3 w-3 text-orange-500" />
									<span className="text-xs font-medium">Inmuno</span>
								</div>
								<span className="text-sm font-bold">{examTypeCounts['inmunohistoquimica'] || 0}</span>
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Document Status Card (doc_aprobado) */}
				<Card className="hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group transition-transform duration-300">
					<CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
							<div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
								<FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
							</div>
							<div>
                                <p className="text-xs font-medium text-muted-foreground">Estatus de Documento</p>
							</div>
						</div>

						<div className="space-y-2">
							{/* Faltante */}
							<button
								className={`w-full flex items-center justify-between p-2 rounded-lg border transition-transform duration-300 cursor-pointer hover:bg-accent ${
									selectedDocAprobado === 'faltante'
										? 'border-primary bg-primary/10'
										: 'border-border hover:border-primary/50'
								}`}
								onClick={() => handleDocAprobadoFilter('faltante')}
							>
								<div className="flex items-center gap-2">
									<FileText className="h-3 w-3 text-red-500" />
									<span className="text-xs font-medium">Faltante</span>
								</div>
								<span className="text-sm font-bold">{docAprobadoCounts['faltante'] || 0}</span>
							</button>

							{/* Pendiente */}
							<button
								className={`w-full flex items-center justify-between p-2 rounded-lg border transition-transform duration-300 cursor-pointer hover:bg-accent ${
									selectedDocAprobado === 'pendiente'
										? 'border-primary bg-primary/10'
										: 'border-border hover:border-primary/50'
								}`}
								onClick={() => handleDocAprobadoFilter('pendiente')}
							>
								<div className="flex items-center gap-2">
									<FileText className="h-3 w-3 text-yellow-500" />
									<span className="text-xs font-medium">Pendiente</span>
								</div>
								<span className="text-sm font-bold">{docAprobadoCounts['pendiente'] || 0}</span>
							</button>

							{/* Aprobado */}
							<button
								className={`w-full flex items-center justify-between p-2 rounded-lg border transition-transform duration-300 cursor-pointer hover:bg-accent ${
									selectedDocAprobado === 'aprobado'
										? 'border-primary bg-primary/10'
										: 'border-border hover:border-primary/50'
								}`}
								onClick={() => handleDocAprobadoFilter('aprobado')}
							>
								<div className="flex items-center gap-2">
									<FileText className="h-3 w-3 text-green-500" />
									<span className="text-xs font-medium">Aprobado</span>
								</div>
								<span className="text-sm font-bold">{docAprobadoCounts['aprobado'] || 0}</span>
							</button>
						</div>
					</CardContent>
				</Card>
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
			<Suspense fallback={<UnifiedCaseModalFallback />}>
				<UnifiedCaseModal
					case_={selectedCase}
					isOpen={isPanelOpen}
					onClose={handlePanelClose}
					onCaseSelect={handleCaseSelect}
					onDelete={handleCaseDeleted}
				/>
			</Suspense>
		</div>
	)
})

MainCases.displayName = 'MainCases'

export default MainCases
