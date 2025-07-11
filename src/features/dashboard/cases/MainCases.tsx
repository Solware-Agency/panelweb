import React, { useState, useCallback, useMemo } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import CasesTable from '@shared/components/cases/CasesTable'
import CaseDetailPanel from '@shared/components/cases/CaseDetailPanel'
import type { MedicalRecord } from '@lib/supabase-service'
import { useQuery } from '@tanstack/react-query'
import { getMedicalRecords } from '@lib/supabase-service'
import { Card } from '@shared/components/ui/card'

const MainCases: React.FC = React.memo(() => {
	const [selectedCase, setSelectedCase] = useState<MedicalRecord | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [isFullscreen, setIsFullscreen] = useState(false)

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

	const handleRefresh = useCallback(() => {
		refetch()
	}, [refetch])

	return (
		<div className="p-3 sm:p-6">
			{/* Page Title */}
			<div className="grid grid-cols-3 mb-4 sm:mb-6 gap-5">
				<div className="col-span-1">
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Casos Médicos</h1>
					<p className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
						Gestiona todos los casos médicos registrados en el sistema
					</p>
				</div>
				<div className="grid grid-cols-2 gap-2 sm:gap-4 col-span-2">
					<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 shadow-lg">
						<button className="bg-white dark:bg-background rounded-xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3">
							<div className="p-1 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
								<Download className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
							</div>
							<div className="text-left">
								<p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Exportar</p>
								<p className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block">Descargar datos</p>
							</div>
						</button>
					</Card>

					<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 shadow-lg">
						<button
							onClick={handleRefresh}
							disabled={isLoading}
							className="bg-white dark:bg-background rounded-xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3"
						>
							<div className="p-1 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
								<RefreshCw
									className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-orange-600 dark:text-orange-400 ${
										isLoading ? 'animate-spin' : ''
									}`}
								/>
							</div>
							<div className="text-left">
								<p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
									{isLoading ? 'Actualizando...' : 'Actualizar'}
								</p>
								<p className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block">Recargar datos</p>
							</div>
						</button>
					</Card>
				</div>
			</div>

			{/* Action Buttons */}

			{/* Cases Table */}
			<CasesTable
				onCaseSelect={handleCaseSelect}
				cases={cases}
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
