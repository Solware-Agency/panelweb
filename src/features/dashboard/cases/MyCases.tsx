import React, { useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import CasesTable from '@shared/components/cases/CasesTable'
import CaseDetailPanel from '@shared/components/cases/CaseDetailPanel'
import type { MedicalRecord } from '@lib/supabase-service'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@lib/supabase/config'
import { Card } from '@shared/components/ui/card'
import { useAuth } from '@app/providers/AuthContext'

const MyCases: React.FC = () => {
	const [selectedCase, setSelectedCase] = useState<MedicalRecord | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [isFullscreen, setIsFullscreen] = useState(false)
	const { user } = useAuth()

	// Query for fetching only cases created by the current user
	const casesQueryResult = useQuery({
		queryKey: ['my-medical-cases'],
		queryFn: async () => {
			if (!user) return { data: [] }
			
			const { data, error } = await supabase
				.from('medical_records_clean')
				.select('*')
				.eq('created_by', user.id)
				.order('created_at', { ascending: false })
			
			if (error) {
				throw error
			}
			
			return { data: data || [] }
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: !!user, // Only run query if user is logged in
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
			<div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
			</div>

			{/* Page Title */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis Casos Generados</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Aquí puedes ver todos los casos que has generado como médico
				</p>
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

export default MyCases