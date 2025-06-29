import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import CasesTable from '@shared/components/cases/CasesTable'
import CaseDetailPanel from '@shared/components/cases/CaseDetailPanel'
import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card'
import { searchClientes, type MedicalRecord } from '@lib/supabase-service'
import { useUserProfile } from '@shared/hooks/useUserProfile'

interface RecordsSectionProps {
	cases: MedicalRecord[]
	isLoading: boolean
	error: any
	refetch: () => void
	isFullscreen: boolean
	setIsFullscreen: (value: boolean) => void
}

export const RecordsSection: React.FC<RecordsSectionProps> = ({
	cases,
	isLoading,
	error,
	refetch,
	isFullscreen,
	setIsFullscreen,
}) => {
	const [searchTerm] = useState('')
	const [selectedCase, setSelectedCase] = useState<MedicalRecord | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const { profile } = useUserProfile()
	const [filteredCases, setFilteredCases] = useState<MedicalRecord[]>(cases)

	// Filter cases by assigned branch if user is an employee with assigned branch
	useEffect(() => {
		if (!cases) {
			setFilteredCases([])
			return
		}

		// If user is an employee with assigned branch, filter cases
		if (profile?.role === 'employee' && profile?.assigned_branch) {
			const filtered = cases.filter(c => c.branch === profile.assigned_branch)
			setFilteredCases(filtered)
		} else {
			// Otherwise show all cases
			setFilteredCases(cases)
		}
	}, [cases, profile])

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
		if (!records) return { total: 0, totalAmount: 0, completed: 0 }

		const total = records.length
		const totalAmount = records.reduce((sum: number, record: MedicalRecord) => sum + record.total_amount, 0)
		const completed = records.filter((record: MedicalRecord) => record.payment_status === 'Completado').length

		return { total, totalAmount, completed }
	}, [records])

	return (
		<div>
			{/* Header with search and refresh */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
				<div>
					<h2 className="text-2xl font-bold text-foreground">Registros de Clientes</h2>
					<p className="text-muted-foreground">
						{searchTerm ? `Resultados de búsqueda para "${searchTerm}"` : 
						 profile?.assigned_branch ? `Registros de la sede ${profile.assigned_branch}` : 'Todos los registros médicos'}
					</p>
				</div>
			</div>

			{/* Branch restriction notice */}
			{profile?.role === 'employee' && profile?.assigned_branch && (
				<div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-full">
							<MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
						</div>
						<h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
							Acceso Restringido a Sede: {profile.assigned_branch}
						</h3>
					</div>
					<p className="text-sm text-blue-700 dark:text-blue-400">
						Tu cuenta está configurada para ver únicamente los registros de la sede {profile.assigned_branch}.
						Si necesitas acceso a otras sedes, contacta al administrador del sistema.
					</p>
				</div>
			)}

			{/* Statistics cards */}
			{!searchTerm && records && (
				<div className="flex justify-center gap-4 mb-6 w-full">
					<Card className="w-full max-w-[370px] transition-all duration-300 hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Casos Pendientes</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground group-hover:text-primary/80" />
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
				</div>
			)}

			{/* Results count for search */}
			{searchTerm && records && (
				<div className="text-sm text-muted-foreground">
					Se encontraron {records.length} resultado{records.length !== 1 ? 's' : ''}
				</div>
			)}

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

			{/* Case Detail Panel */}
			<CaseDetailPanel case_={selectedCase} isOpen={isPanelOpen} onClose={handlePanelClose} />
		</div>
	)
}