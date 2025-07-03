import React, { useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import CasesTable from '@shared/components/cases/CasesTable'
import CaseDetailPanel from '@shared/components/cases/CaseDetailPanel'
import type { MedicalRecord } from '@lib/supabase-service'
import { useQuery } from '@tanstack/react-query'
import { getMedicalRecords } from '@lib/supabase-service'
import { Card } from '@shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'

const MainCases: React.FC = () => {
	const [selectedCase, setSelectedCase] = useState<MedicalRecord | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [isFullscreen, setIsFullscreen] = useState(false)
	const [itemsPerPage, setItemsPerPage] = useState(100)

	// Query for refreshing data
	const casesQueryResult = useQuery({
		queryKey: ['medical-cases', itemsPerPage],
		queryFn: () => getMedicalRecords(itemsPerPage, 0),
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	const { refetch, isLoading } = casesQueryResult
	const cases: MedicalRecord[] = casesQueryResult.data?.data || []
	const error = casesQueryResult.error

	const handleCaseSelect = (case_: MedicalRecord) => {
		setSelectedCase(case_)
		setIsPanelOpen(true)
	}

	const handlePanelClose = () => {
		setIsPanelOpen(false)
		// Delay clearing selected case to allow animation to complete
		setTimeout(() => setSelectedCase(null), 300)
	}

	const handleRefresh = () => {
		refetch()
	}

	return (
		<div className="p-3 sm:p-6">
			{/* Action Buttons */}
			<div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<button className="bg-white dark:bg-background rounded-xl p-3 sm:p-4 transition-colors duration-300 flex items-center gap-2 sm:gap-3">
						<div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
							<Download className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
						</div>
						<div className="text-left">
							<p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Exportar</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Descargar datos</p>
						</div>
					</button>
				</Card>

				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<button
						onClick={handleRefresh}
						disabled={isLoading}
						className="bg-white dark:bg-background rounded-xl p-3 sm:p-4 transition-colors duration-300 flex items-center gap-2 sm:gap-3"
					>
						<div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
							<RefreshCw
								className={`w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 ${
									isLoading ? 'animate-spin' : ''
								}`}
							/>
						</div>
						<div className="text-left">
							<p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
								{isLoading ? 'Actualizando...' : 'Actualizar'}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Recargar datos</p>
						</div>
					</button>
				</Card>

				<Card className="col-span-1 grid hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 shadow-lg">
					<div className="bg-white dark:bg-background rounded-xl p-3 sm:p-4 transition-colors duration-300 flex items-center gap-2 sm:gap-3">
						<div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
							<RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="text-left flex-1">
							<p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
								Registros por página
							</p>
							<Select 
								value={itemsPerPage.toString()} 
								onValueChange={(value) => setItemsPerPage(parseInt(value))}
							>
								<SelectTrigger className="h-6 text-xs border-none shadow-none bg-transparent pl-0">
									<SelectValue placeholder="Seleccionar cantidad" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="100">100 registros</SelectItem>
									<SelectItem value="500">500 registros</SelectItem>
									<SelectItem value="1000">1000 registros</SelectItem>
									<SelectItem value="0">Todos los registros</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</Card>
			</div>

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
			<CaseDetailPanel case_={selectedCase} isOpen={isPanelOpen} onClose={handlePanelClose} />
		</div>
	)
}

export default MainCases