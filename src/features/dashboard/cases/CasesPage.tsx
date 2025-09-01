import React, { useCallback, useState } from 'react'
import { RecordsSection } from '@features/form/components/RecordsSection'
import { useQuery } from '@tanstack/react-query'
import { getCasesWithPatientInfo } from '@lib/medical-cases-service'
import { mapToLegacyRecords } from '@lib/mappers'

const CasesPage: React.FC = () => {
	const [isFullscreen, setIsFullscreen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [currentPage, setCurrentPage] = useState(1)

	const {
		data: casesData,
		isLoading: casesLoading,
		error: casesError,
		refetch: refetchCases,
	} = useQuery({
		queryKey: ['medical-cases', searchTerm, currentPage],
		queryFn: () => getCasesWithPatientInfo(currentPage, 50, { searchTerm }),
		staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
	})

	const handleSearch = useCallback((term: string) => {
		setSearchTerm(term)
		setCurrentPage(1) // Reset to first page when searching
	}, [])

	return (
		<RecordsSection
			cases={casesData?.data ? mapToLegacyRecords(casesData.data) : []}
			isLoading={casesLoading}
			error={casesError}
			refetch={refetchCases}
			isFullscreen={isFullscreen}
			setIsFullscreen={setIsFullscreen}
			onSearch={handleSearch}
			currentPage={currentPage}
			totalPages={casesData?.totalPages || 0}
			onPageChange={setCurrentPage}
		/>
	)
}

export default CasesPage
