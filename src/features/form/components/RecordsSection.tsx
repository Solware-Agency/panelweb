import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import CasesTable from '@shared/components/cases/CasesTable'
import CaseDetailPanel from '@shared/components/cases/CaseDetailPanel'
import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card'
import { getClientes, searchClientes, type MedicalRecord } from '@lib/supabase-service'

export const RecordsSection: React.FC = () => {
	const [searchTerm] = useState('')
	const [selectedCase, setSelectedCase] = useState<MedicalRecord | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)

	const handleCaseSelect = (case_: MedicalRecord) => {
		setSelectedCase(case_)
		setIsPanelOpen(true)
	}

	const handlePanelClose = () => {
		setIsPanelOpen(false)
		// Delay clearing selected case to allow animation to complete
		setTimeout(() => setSelectedCase(null), 300)
	}

	// Query for all records (when no search term)
	const { data: allRecords } = useQuery({
		queryKey: ['clientes'],
		queryFn: () => getClientes(50, 0),
		enabled: !searchTerm,
	})

	// Query for search results
	const { data: searchResults } = useQuery({
		queryKey: ['clientes-search', searchTerm],
		queryFn: () => searchClientes(searchTerm),
		enabled: !!searchTerm,
	})

	// Determine which data to use
	const records = searchTerm ? searchResults?.data : allRecords?.data

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
						{searchTerm ? `Resultados de búsqueda para "${searchTerm}"` : 'Todos los registros médicos'}
					</p>
				</div>
			</div>

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
			<CasesTable onCaseSelect={handleCaseSelect} />

			{/* Case Detail Panel */}
			<CaseDetailPanel case_={selectedCase} isOpen={isPanelOpen} onClose={handlePanelClose} />
		</div>
	)
}
